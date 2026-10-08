"""Regression coverage for invitation status and guest-wishes APIs."""
import os

import pytest
import requests


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


@pytest.fixture
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


def test_api_root(api_client):
    response = api_client.get(f"{BASE_URL}/api/")
    assert response.status_code == 200
    assert response.json()["message"] == "Hello World"


def test_wishes_list_returns_valid_shape(api_client):
    response = api_client.get(f"{BASE_URL}/api/wishes")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    for wish in response.json():
        assert {"id", "name", "message", "attendance", "created_at"}.issubset(wish)


def test_create_wish_and_verify_persistence(api_client):
    payload = {
        "name": "TEST_Invitation Guest",
        "message": "TEST Semoga menjadi keluarga bahagia.",
        "attendance": "Hadir",
    }
    created = api_client.post(f"{BASE_URL}/api/wishes", json=payload)
    assert created.status_code == 200
    created_data = created.json()
    assert created_data["name"] == payload["name"]
    assert created_data["message"] == payload["message"]
    assert isinstance(created_data["id"], str)

    listed = api_client.get(f"{BASE_URL}/api/wishes")
    assert listed.status_code == 200
    assert any(item["id"] == created_data["id"] for item in listed.json())


def test_create_wish_rejects_too_short_fields(api_client):
    response = api_client.post(
        f"{BASE_URL}/api/wishes",
        json={"name": "x", "message": "x", "attendance": "Hadir"},
    )
    assert response.status_code == 422