from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Object storage (Emergent integration)
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "lira-febi-wedding"
storage_key = None


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 404:
        init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": storage_key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


app = FastAPI()
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class WishCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    message: str = Field(min_length=2, max_length=500)
    attendance: str = Field(default="Hadir")


class Wish(WishCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.get("/wishes", response_model=List[Wish])
async def get_wishes():
    wishes = await db.wishes.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for wish in wishes:
        if isinstance(wish.get("created_at"), str):
            wish["created_at"] = datetime.fromisoformat(wish["created_at"])
    return wishes


@api_router.post("/wishes", response_model=Wish)
async def create_wish(input: WishCreate):
    wish = Wish(**input.model_dump())
    doc = wish.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.wishes.insert_one(doc)
    return wish


@api_router.get("/rsvp-summary")
async def rsvp_summary():
    rows = await db.wishes.aggregate([
        {"$group": {"_id": "$attendance", "count": {"$sum": 1}}}
    ]).to_list(20)
    hadir = sum(r["count"] for r in rows if r["_id"] == "Hadir")
    berhalangan = sum(r["count"] for r in rows if r["_id"] and r["_id"] != "Hadir")
    return {"hadir": hadir, "berhalangan": berhalangan, "total": hadir + berhalangan}


ALLOWED_AUDIO_EXT = {"mp3", "m4a", "ogg", "wav", "aac"}
MAX_AUDIO_SIZE = 15 * 1024 * 1024


@api_router.post("/music")
async def upload_music(file: UploadFile = File(...)):
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    content_type = file.content_type or ""
    if ext not in ALLOWED_AUDIO_EXT and not content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Hanya file audio (mp3/m4a/ogg/wav) yang diperbolehkan")
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="File kosong")
    if len(data) > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=400, detail="Ukuran file maksimal 15MB")
    ext = ext or "mp3"
    safe_type = content_type if content_type.startswith("audio/") else "audio/mpeg"
    path = f"{APP_NAME}/music/{uuid.uuid4()}.{ext}"
    try:
        result = await asyncio.to_thread(put_object, path, data, safe_type)
    except Exception as e:
        logger.error(f"Music upload failed: {e}")
        raise HTTPException(status_code=502, detail="Gagal mengunggah file, coba lagi")
    file_id = str(uuid.uuid4())
    await db.files.insert_one({
        "id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": safe_type,
        "size": result["size"],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.files.update_many(
        {"storage_path": {"$regex": f"^{APP_NAME}/music/"}, "is_deleted": False, "id": {"$ne": file_id}},
        {"$set": {"is_deleted": True}},
    )
    await db.settings.update_one(
        {"key": "music"},
        {"$set": {"key": "music", "path": result["path"], "filename": file.filename,
                  "updated_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"url": f"/api/files/{result['path']}", "filename": file.filename}


@api_router.get("/music")
async def get_music():
    doc = await db.settings.find_one({"key": "music"}, {"_id": 0})
    if not doc:
        return {"url": None, "filename": None}
    return {"url": f"/api/files/{doc['path']}", "filename": doc.get("filename")}


@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = await asyncio.to_thread(get_object, path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")
    return Response(content=data, media_type=record.get("content_type") or content_type)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    try:
        await asyncio.to_thread(init_storage)
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
