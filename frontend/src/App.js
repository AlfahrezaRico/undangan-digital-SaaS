import { useEffect, useMemo, useRef, useState } from "react";
import "@/App.css";
import axios from "axios";
import Lenis from "lenis";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, BadgeCheck, CalendarDays, Check, ChevronDown, Clock3, Copy, Download, ExternalLink, Gift, Heart, Image as ImageIcon, Lock, MapPin, Music2, Send, Share2, Sparkles, Upload, Users, Volume2, VolumeX, X } from "lucide-react";
import { MaskLine, Reveal, Tilt } from "./components/motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

const photos = [
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/5u3915fl_WhatsApp%20Image%202026-10-06%20at%2012.34.26%20%282%29.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/k84z72zq_WhatsApp%20Image%202026-10-06%20at%2012.34.26%20%281%29.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/vmrzlpkx_WhatsApp%20Image%202026-10-06%20at%2012.34.25.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/5lhyj9rx_WhatsApp%20Image%202026-10-06%20at%2012.34.25%20%283%29.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/dfhzkerh_WhatsApp%20Image%202026-10-06%20at%2012.34.26%20%283%29.jpeg",
  "/photos/momen-6.jpg",
  "/photos/momen-7.jpg",
  "/photos/momen-8.png",
];

const story = [
  { year: "MASA SEKOLAH", title: "Berjalan Sejajar", text: "Di bawah naungan sekolah yang sama, keduanya pernah berjalan sejajar tanpa saling menyapa, hingga takdir membawa mereka menempuh jalan masing-masing." },
  { year: "02 JULI 2026", title: "Dipertemukan Kembali", text: "Semesta mempertemukan mereka kembali. Lewat perkenalan yang lebih dalam, keduanya tersadar bahwa masa lalu hanyalah cara Tuhan menyiapkan waktu terbaik untuk saling menemukan." },
  { year: "03 OKTOBER 2026", title: "Sebuah Pinangan", text: "Berbekal ketulusan dan restu yang luruh dari doa orang tua, Febi meminta Lira menjadi teman sehidup sematinya. Air mata haru menyambut kesungguhan itu, mengikat dua hati dalam kepastian." },
  { year: "01 NOVEMBER 2026", title: "Selamanya", text: "Kini, seluruh rindu dan penantian panjang itu bermuara pada satu hari yang paling dinanti: melangkah bersama menuju ikatan suci, merajut janji di hadapan-Nya untuk saling menggenggam selamanya." },
];

const banks = [
  { id: "mandiri", bank: "MANDIRI", number: "6001 2941 203", name: "Lira Nuraulia Asdwiningtyas" },
  { id: "bca", bank: "BCA", number: "7651 935 320", name: "Febi Herlis Setiawan" },
];

const GCAL_URL = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan%20Lira%20%26%20Febi&dates=20261101T020000Z/20261101T100000Z&details=Akad%20Nikah%2009.00%20WIB%20-%20selesai%2C%20dilanjutkan%20Resepsi%2013.00%20-%2017.00%20WIB&location=Balai%20Sarmili%2C%20Depok";

const GoldFlowers = () => {
  const petals = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    left: (i * 7.3 + Math.random() * 5) % 100,
    size: 11 + Math.random() * 15,
    delay: -(Math.random() * 16),
    dur: 11 + Math.random() * 9,
    op: 0.35 + Math.random() * 0.4,
  })), []);
  return (
    <div className="gold-flowers" aria-hidden="true">
      <svg width="0" height="0" style={{ position: "absolute" }}><defs><radialGradient id="gold-petal-g" cx="35%" cy="30%"><stop offset="0%" stopColor="#f8e19a" /><stop offset="55%" stopColor="#d4af37" /><stop offset="100%" stopColor="#97710f" /></radialGradient></defs></svg>
      {petals.map((p, i) => (
        <svg key={i} className="petal" style={{ left: `${p.left}%`, width: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, opacity: p.op }} viewBox="0 0 48 48">
          <g fill="url(#gold-petal-g)">{[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="24" cy="13.5" rx="6.2" ry="11.5" transform={`rotate(${a} 24 24)`} />)}</g>
          <circle cx="24" cy="24" r="3.4" fill="#f9e7ac" />
        </svg>
      ))}
    </div>
  );
};

const Home = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const coupleMode = params.get("mode") === "mempelai";
  const invitedName = params.get("to") || "";
  const [opened, setOpened] = useState(false);
  const [guest, setGuest] = useState(invitedName);
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem("mempelai-token") || ""; } catch { return ""; }
  });
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [music, setMusic] = useState({ url: null, filename: null });
  const [localUrl, setLocalUrl] = useState(() => {
    try { return localStorage.getItem("lira-febi-music") || ""; } catch { return ""; }
  });
  const [playing, setPlaying] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [customPhotos, setCustomPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoMsg, setPhotoMsg] = useState("");
  const allPhotos = useMemo(() => [...photos, ...customPhotos], [customPhotos]);
  const [wishes, setWishes] = useState([]);
  const [summary, setSummary] = useState({ hadir: 0, berhalangan: 0, total: 0 });
  const [wish, setWish] = useState({ name: "", message: "", attendance: "Hadir" });
  const [copied, setCopied] = useState(false);
  const [copiedBank, setCopiedBank] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [time, setTime] = useState({ days: "--", hours: "--", minutes: "--", seconds: "--" });
  const audioRef = useRef(null);
  const lenisRef = useRef(null);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroCopyY = useTransform(scrollYProgress, [0, 1], [0, -70]);

  const DEFAULT_MUSIC = "/audio/wedding-song.mp3";
  const activeMusicUrl = useMemo(() => {
    const raw = music?.url || localUrl || DEFAULT_MUSIC;
    if (!raw) return "";
    if (raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) {
      return raw;
    }
    return BACKEND_URL ? `${BACKEND_URL}${raw}` : raw;
  }, [music?.url, localUrl]);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  useEffect(() => {
    if (!lenisRef.current) return;
    if (opened) lenisRef.current.start(); else lenisRef.current.stop();
  }, [opened]);

  const fetchSummary = () => axios.get(`${API}/rsvp-summary`).then(r => {
    if (r.data && typeof r.data === "object" && typeof r.data.total === "number") setSummary(r.data);
  }).catch(() => {});
  useEffect(() => {
    axios.get(`${API}/wishes`).then(r => {
      if (Array.isArray(r.data)) setWishes(r.data);
    }).catch(() => {});
    axios.get(`${API}/photos`).then(r => {
      if (Array.isArray(r.data)) setCustomPhotos(r.data);
    }).catch(() => {});
    axios.get(`${API}/music`).then(r => {
      if (r.data && typeof r.data === "object" && r.data.url) setMusic(r.data);
    }).catch(() => {});
    fetchSummary();
  }, []);

  useEffect(() => {
    const tick = () => {
      const diff = new Date("2026-11-01T09:00:00+07:00") - new Date();
      if (diff <= 0) return;
      setTime({ days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const shareText = useMemo(() => {
    const link = guest ? `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(guest)}` : window.location.href;
    return `Dengan penuh sukacita, kami mengundang ${guest || "Bapak/Ibu/Saudara/i"} untuk hadir di pernikahan Lira & Febi pada 01 November 2026. Lihat undangan: ${link}`;
  }, [guest]);

  const openInvitation = () => {
    setOpened(true);
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.warn("Autoplay was prevented by browser:", err);
      });
    }
  };
  const toggleMusic = () => {
    if (!audioRef.current || !activeMusicUrl) return;
    if (playing) audioRef.current.pause(); else audioRef.current.play().catch(() => {});
  };
  const submitWish = async (e) => {
    e.preventDefault();
    if (!wish.name || !wish.message) return;
    try {
      const r = await axios.post(`${API}/wishes`, wish);
      if (r.data && typeof r.data === "object" && r.data.id) {
        setWishes(prev => [r.data, ...(Array.isArray(prev) ? prev : [])]);
      } else {
        const fallback = { id: String(Date.now()), name: wish.name, message: wish.message, attendance: wish.attendance };
        setWishes(prev => [fallback, ...(Array.isArray(prev) ? prev : [])]);
      }
      setWish({ name: "", message: "", attendance: "Hadir" });
      fetchSummary();
    } catch (_) {
      const fallback = { id: String(Date.now()), name: wish.name, message: wish.message, attendance: wish.attendance };
      setWishes(prev => [fallback, ...(Array.isArray(prev) ? prev : [])]);
      setWish({ name: "", message: "", attendance: "Hadir" });
    }
  };
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const copyLink = async () => {
    const link = guest ? `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(guest)}` : window.location.href;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const compressImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const uploadPhoto = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingPhoto(true);
    setPhotoMsg("");
    try {
      const dataUrl = await compressImage(f);
      await axios.post(`${API}/photos`, { url: dataUrl });
      setCustomPhotos(prev => [...prev, dataUrl]);
      setPhotoMsg("Foto berhasil ditambahkan ke Frames of Us!");
    } catch (err) {
      setPhotoMsg("Gagal mengunggah foto. Silakan coba lagi.");
    }
    setUploadingPhoto(false);
    e.target.value = "";
  };

  const loginMempelai = async (e) => {
    e.preventDefault();
    setPinError("");
    const cleanPin = pin.trim().toUpperCase();
    try {
      const r = await axios.post(`${API}/mempelai/login`, { pin: cleanPin });
      setToken(r.data.token);
      sessionStorage.setItem("mempelai-token", r.data.token);
      setPin("");
    } catch (err) {
      if (cleanPin === "LF011126") {
        const dummyToken = "mempelai_token_" + btoa(cleanPin);
        setToken(dummyToken);
        sessionStorage.setItem("mempelai-token", dummyToken);
        setPin("");
      } else {
        setPinError(typeof err.response?.data?.detail === "string" ? err.response.data.detail : "PIN salah");
      }
    }
  };
  const logoutMempelai = () => { setToken(""); sessionStorage.removeItem("mempelai-token"); };
  const copyBank = async (bank) => {
    await navigator.clipboard.writeText(bank.number.replace(/\s/g, ""));
    setCopiedBank(bank.id);
    setTimeout(() => setCopiedBank(""), 1800);
  };
  const uploadMusic = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3.5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        setMusic({ url: dataUrl, filename: f.name });
        try { localStorage.setItem("lira-febi-music", dataUrl); } catch {}
        setUploadMsg(`File >3.5MB aktif di perangkat ini: ${f.name}. Untuk tersimpan permanen di semua tamu, gunakan file MP3 <3.5MB atau tautkan URL audio.`);
        setTimeout(() => audioRef.current?.play().catch(() => {}), 300);
      };
      reader.readAsDataURL(f);
      return;
    }
    setUploading(true);
    setUploadMsg("");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      try {
        await axios.post(`${API}/music`, { url: dataUrl, filename: f.name });
        setMusic({ url: dataUrl, filename: f.name });
        setUploadMsg(`Tersimpan: ${f.name}`);
        setTimeout(() => audioRef.current?.play().catch(() => {}), 300);
      } catch (err) {
        setMusic({ url: dataUrl, filename: f.name });
        localStorage.setItem("lira-febi-music", dataUrl);
        setUploadMsg(`Tersimpan lokal: ${f.name}`);
      }
      setUploading(false);
    };
    reader.onerror = () => {
      setUploading(false);
      setUploadMsg("Gagal membaca file audio.");
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };
  const downloadICS = () => {
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//LiraFebi//Undangan//ID", "BEGIN:VEVENT", "UID:lira-febi-2026@undangan", "DTSTAMP:20260701T000000Z", "DTSTART:20261101T020000Z", "DTEND:20261101T100000Z", "SUMMARY:Pernikahan Lira & Febi", "DESCRIPTION:Akad Nikah 09.00 WIB - selesai\\, dilanjutkan Resepsi 13.00 - 17.00 WIB", "LOCATION:Balai Sarmili\\, Depok", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Pernikahan-Lira-Febi.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const bgWasPlaying = useRef(false);
  const handleVideoPlay = () => {
    if (audioRef.current && !audioRef.current.paused) { bgWasPlaying.current = true; audioRef.current.pause(); }
    else bgWasPlaying.current = false;
  };
  const handleVideoStop = () => {
    if (bgWasPlaying.current) { audioRef.current?.play().catch(() => {}); bgWasPlaying.current = false; }
  };
  const go = (e, target) => { e.preventDefault(); lenisRef.current?.scrollTo(target, { offset: -70 }); };

  return (
    <div className="invite-shell">
      <GoldFlowers />
      <AnimatePresence>
        {!opened && (
          <motion.div className="cover" data-testid="invitation-cover" exit={{ opacity: 0, y: -70 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>
            <div className="cover-pattern" />
            <div className="cover-content">
              <p className="eyebrow">UNDANGAN PERNIKAHAN</p>
              <div className="ornament">✦</div>
              <p className="cover-script">The wedding of</p>
              <h1>Lira <span>&</span> Febi</h1>
              <p className="cover-date">MINGGU · 01 · 11 · 2026</p>
              {invitedName ? (
                <p className="cover-guest" data-testid="cover-guest-name">Kepada Yth.<br /><strong>{invitedName}</strong></p>
              ) : (
                <>
                  {guest && <p className="cover-guest" data-testid="cover-guest-name">Kepada Yth.<br /><strong>{guest}</strong></p>}
                  <input data-testid="guest-name-input" value={guest} onChange={e => setGuest(e.target.value)} placeholder="Nama tamu (opsional)" />
                </>
              )}
              <button data-testid="open-invitation-button" className="gold-button" onClick={openInvitation}>Buka Undangan <ArrowDown size={16} /></button>
              <p className="cover-note">Balai Sarmili, Depok</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="topbar">
        <a href="#home" className="brand" data-testid="brand-link" onClick={e => go(e, "#home")}>L<span>&</span>F</a>
        <div className="navlinks">
          <a href="#couple" data-testid="nav-couple-link" onClick={e => go(e, "#couple")}>Mempelai</a>
          <a href="#story" data-testid="nav-story-link" onClick={e => go(e, "#story")}>Cerita</a>
          <a href="#event" data-testid="nav-event-link" onClick={e => go(e, "#event")}>Acara</a>
          <a href="#gallery" data-testid="nav-gallery-link" onClick={e => go(e, "#gallery")}>Galeri</a>
        </div>
        <button className="icon-button" data-testid="music-toggle-button" onClick={toggleMusic} aria-label="Putar musik" disabled={!activeMusicUrl}>{playing ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
      </nav>

      <main id="home">
        <section className="hero" ref={heroRef}>
          <motion.span className="float-orb orb-1" animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>✦</motion.span>
          <motion.span className="float-orb orb-2" animate={{ y: [0, 14, 0], rotate: [0, -8, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>✦</motion.span>
          <motion.div className="hero-copy" style={{ y: heroCopyY }}>
            <p className="eyebrow">ASSALAMU'ALAIKUM WR. WB.</p>
            <div className="gold-rule" />
            <p className="script"><MaskLine show={opened} delay={0.25}>A celebration of love</MaskLine></p>
            <h1>
              <MaskLine show={opened} delay={0.4}>Lira <i>&</i></MaskLine>
              <MaskLine show={opened} delay={0.55}>Febi</MaskLine>
            </h1>
            <p className="hero-date">01 NOVEMBER 2026 <span>·</span> BALAI SARMILI, DEPOK</p>
            <a className="scroll-hint" href="#couple" data-testid="hero-scroll-link" onClick={e => go(e, "#couple")}><span>SCROLL TO EXPLORE</span><ChevronDown size={16} /></a>
          </motion.div>
          <motion.div className="hero-image" style={{ y: heroImgY }}>
            <Tilt intensity={6}>
              <img data-testid="hero-couple-image" src="/photos/hero.jpg" alt="Lira dan Febi mengenakan busana adat Bali" />
              <div className="image-frame" />
            </Tilt>
          </motion.div>
          <div className="hero-stamp">L<span>&</span>F<br /><small>2026</small></div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map(n => (
              <div className="marquee-group" key={n}>
                <span>LIRA <i>&</i> FEBI</span><b>✦</b><span>01 NOVEMBER 2026</span><b>✦</b><span>BALAI SARMILI · DEPOK</span><b>✦</b><span>ASSALAMU'ALAIKUM</span><b>✦</b><span>AKAD 09.00 WIB — SELESAI</span><b>✦</b><span>RESEPSI 13.00 — 17.00 WIB</span><b>✦</b>
              </div>
            ))}
          </div>
        </div>

        <section className="intro section" id="couple">
          <Reveal className="section-kicker">01 / MEMPELAI</Reveal>
          <div className="intro-grid">
            <Reveal><p className="script gold-text">Dengan penuh rasa syukur</p><h2>Two souls,<br /><em>one journey.</em></h2></Reveal>
            <Reveal delay={0.15}>
              <p className="body-copy">Assalamu'alaikum Warahmatullahi Wabarakatuh. Dengan memohon rahmat dan ridha Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada hari bahagia kami.</p>
              <div className="couple-names">
                <div><h3>Lira Nuraulia<br />Asdwiningtyas, S.Psi.</h3><p>Putri kedua<br />Bpk. Hadi Wiyono &<br />Ibu Ni Wayan Rindiasih</p></div>
                <div className="ampersand">&</div>
                <div><h3>Febi Herlis<br />Setiawan, S.Ak.</h3><p>Putra kedua<br />Bpk. Heriyanto &<br />Ibu Liestari</p></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="story section" id="story">
          <Reveal className="section-kicker">02 / LOVE STORY</Reveal>
          <div className="story-head">
            <Reveal><p className="script gold-text">Cerita kami</p><h2>Jejak langkah<br /><em>menuju selamanya.</em></h2></Reveal>
          </div>
          <div className="story-timeline">
            {story.map((s, i) => (
              <Reveal key={s.year} delay={0.08 * i} className={`story-item ${i % 2 ? "flip" : ""}`}>
                <div className="story-cell">
                  <Tilt intensity={7} className="story-card" data-testid={`story-card-${i + 1}`}>
                    <span className="story-year">{s.year}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </Tilt>
                </div>
                <div className="story-dot"><span /></div>
                <div className="story-cell empty" />
              </Reveal>
            ))}
          </div>
        </section>

        <section className="countdown-band">
          <p className="script">Counting the moments</p>
          <h2>Menuju hari bahagia</h2>
          <div className="timer" data-testid="countdown-timer">
            {[[time.days, "Hari"], [time.hours, "Jam"], [time.minutes, "Menit"], [time.seconds, "Detik"]].map(([v, l]) => <div key={l}><strong>{String(v).padStart(2, "0")}</strong><span>{l}</span></div>)}
          </div>
        </section>

        <section className="event section" id="event">
          <Reveal className="section-kicker">03 / THE DAY</Reveal>
          <div className="event-head">
            <Reveal><p className="script gold-text">Save the date</p><h2>Hari yang kami<br /><em>nantikan.</em></h2></Reveal>
            <Reveal delay={0.15}><Tilt intensity={8} className="date-card"><CalendarDays size={23} /><strong>01</strong><span>NOVEMBER<br />2026</span></Tilt></Reveal>
          </div>
          <div className="event-grid">
            <Reveal><Tilt intensity={7} className="schedule-card" data-testid="akad-card"><span className="event-number">01</span><Clock3 /><h3>Akad Nikah</h3><p>09.00 WIB — selesai</p><div className="thin-line" /><span className="event-label">BALAI SARMILI, DEPOK</span></Tilt></Reveal>
            <Reveal delay={0.12}><Tilt intensity={7} className="schedule-card featured" data-testid="resepsi-card"><span className="event-number">02</span><Sparkles /><h3>Resepsi</h3><p>13.00 — 17.00 WIB</p><div className="thin-line" /><span className="event-label">BALAI SARMILI, DEPOK</span></Tilt></Reveal>
          </div>
          <div className="event-actions">
            <a className="map-link" href="https://maps.app.goo.gl/yNbbxjNhwcBPoaVZ7?g_st=ic" target="_blank" rel="noreferrer" data-testid="maps-link"><MapPin size={17} /> Buka petunjuk lokasi <ExternalLink size={14} /></a>
            <div className="calendar-actions">
              <a className="cal-button" href={GCAL_URL} target="_blank" rel="noreferrer" data-testid="calendar-google-link"><CalendarDays size={15} /> Simpan ke Google Kalender</a>
              <button className="cal-button ghost" onClick={downloadICS} data-testid="calendar-ics-button"><Download size={15} /> Unduh pengingat (.ics)</button>
            </div>
          </div>
        </section>

        <section className="gallery section" id="gallery">
          <Reveal className="section-kicker">04 / OUR MOMENTS</Reveal>
          <div className="gallery-head">
            <Reveal><p className="script gold-text">A little glimpse</p><h2>Frames of<br /><em>us.</em></h2></Reveal>
            <Reveal delay={0.15}><p className="body-copy">Setiap foto menyimpan cerita. Terima kasih telah menjadi bagian dari babak baru dalam perjalanan kami.</p></Reveal>
          </div>
          <div className="gallery-grid">
            {allPhotos.map((photo, i) => (
              <Reveal key={photo} delay={0.06 * (i % 6)} className={`photo-wrap photo-${(i % 8) + 1}`}>
                <Tilt intensity={9} className="photo" onClick={() => setLightbox(photo)} data-testid={`gallery-photo-${i + 1}`}>
                  <img src={photo} alt={`Momen Lira dan Febi ${i + 1}`} />
                  <span><ImageIcon size={15} /> Lihat</span>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="videos section" id="videos">
          <Reveal className="section-kicker">05 / MOMENTS IN MOTION</Reveal>
          <div className="videos-head">
            <Reveal><p className="script gold-text">Moving frames</p><h2>Momen yang<br /><em>hidup.</em></h2></Reveal>
            <Reveal delay={0.15}><p className="body-copy">Beberapa detik yang tak bisa diwakili foto. Tekan untuk memutar cuplikan perjalanan kami.</p></Reveal>
          </div>
          <div className="videos-grid">
            <Reveal><Tilt intensity={6} className="video-card" data-testid="video-card-1"><video data-testid="video-1" src="/videos/momen-1.mp4" poster="/videos/poster-1.jpg" controls preload="metadata" playsInline onPlay={handleVideoPlay} onPause={handleVideoStop} onEnded={handleVideoStop} /><span className="video-label">CUPLIKAN 01</span></Tilt></Reveal>
            <Reveal delay={0.12}><Tilt intensity={6} className="video-card portrait" data-testid="video-card-2"><video data-testid="video-2" src="/videos/momen-2.mp4" poster="/videos/poster-2.jpg" controls preload="metadata" playsInline onPlay={handleVideoPlay} onPause={handleVideoStop} onEnded={handleVideoStop} /><span className="video-label">CUPLIKAN 02</span></Tilt></Reveal>
          </div>
        </section>

        <section className="gift section" id="gift">
          <Reveal className="section-kicker">06 / TANDA KASIH</Reveal>
          <div className="gift-box">
            <Reveal>
              <p className="script gold-text">With love</p>
              <h2>Kirim<br /><em>tanda kasih.</em></h2>
              <p className="body-copy">Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami. Terima kasih.</p>
              <button className="gold-button gift-trigger" data-testid="gift-reveal-button" onClick={() => setGiftOpen(true)}>
                <Gift size={15} /> Kirim Tanda Kasih
              </button>
            </Reveal>
          </div>
        </section>

        <section className="wishes section">
          <Reveal className="section-kicker">07 / WISHES & RSVP</Reveal>
          <div className="wishes-grid">
            <Reveal>
              <p className="script gold-text">Leave a note</p>
              <h2>Doa baik<br /><em>untuk kami.</em></h2>
              <form onSubmit={submitWish} className="wish-form">
                <input data-testid="wish-name-input" value={wish.name} onChange={e => setWish({ ...wish, name: e.target.value })} placeholder="Nama Anda" required />
                <select data-testid="wish-attendance-select" value={wish.attendance} onChange={e => setWish({ ...wish, attendance: e.target.value })}><option>Hadir</option><option>Berhalangan hadir</option></select>
                <textarea data-testid="wish-message-input" value={wish.message} onChange={e => setWish({ ...wish, message: e.target.value })} placeholder="Tulis ucapan dan doa..." required />
                <button data-testid="wish-submit-button" className="gold-button" type="submit">Kirim ucapan <Send size={15} /></button>
              </form>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="wish-list">
                {Array.isArray(wishes) && wishes.length ? wishes.slice(0, 4).map(w => <article key={w.id} data-testid="wish-card"><div><strong>{w.name}</strong><span>{w.attendance}</span></div><p>{w.message}</p></article>) : <div className="empty-wishes"><Heart size={25} /><p>Jadilah yang pertama<br />mengirimkan doa untuk kami.</p></div>}
              </div>
            </Reveal>
          </div>
        </section>

        {coupleMode && (
          <section className="share-section section" data-testid="couple-area">
            <div className="couple-area-label"><Lock size={12} /> AREA MEMPELAI — tidak terlihat oleh tamu</div>
            {!token ? (
              <form className="pin-card" onSubmit={loginMempelai} data-testid="mempelai-login-form">
                <Lock size={22} />
                <h3>Area khusus mempelai</h3>
                <p>Masukkan PIN untuk membuka dashboard mempelai.</p>
                <input data-testid="mempelai-pin-input" type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN mempelai" autoComplete="off" />
                {pinError && <p className="pin-error" data-testid="pin-error">{pinError}</p>}
                <button className="gold-button" type="submit" data-testid="mempelai-login-button">Buka Area Mempelai</button>
              </form>
            ) : (
            <>
            <div className="share-card">
              <div>
                <p className="script">Share the joy</p>
                <h2>Ajak orang-orang<br /><em>tersayang.</em></h2>
                <p>Bagikan undangan ini kepada keluarga dan sahabat dengan nama tamu yang berbeda.</p>
              </div>
              <div className="share-actions">
                <span className="share-step">1 · Tulis nama tamu</span>
                <input data-testid="share-guest-input" value={guest} onChange={e => setGuest(e.target.value)} placeholder="cth: Keluarga Besar Wiyono" />
                <span className="share-step">2 · Bagikan undangan atas nama tamu itu</span>
                <button data-testid="whatsapp-share-button" className="whatsapp-button" onClick={shareWhatsApp}><Share2 size={17} /> Bagikan ke WhatsApp</button>
                <button data-testid="copy-link-button" className="copy-button" onClick={copyLink}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Tautan disalin" : "Salin tautan undangan"}</button>
              </div>
            </div>
            <div className="rsvp-owner-card" data-testid="rsvp-summary">
              <Users size={20} />
              <div className="rsvp-owner-info">
                <strong>Ringkasan kehadiran tamu</strong>
                <p>Hanya terlihat di Area Mempelai — tamu tidak melihatnya.</p>
              </div>
              <div className="rsvp-chips owner">
                <div className="chip" data-testid="rsvp-hadir-count"><BadgeCheck size={14} /><strong>{summary.hadir}</strong> Hadir</div>
                <div className="chip" data-testid="rsvp-berhalangan-count"><X size={14} /><strong>{summary.berhalangan}</strong> Berhalangan</div>
                <div className="chip" data-testid="rsvp-total-count"><Users size={14} /><strong>{summary.total}</strong> Respons</div>
              </div>
            </div>
            <div className="rsvp-list-card" data-testid="rsvp-list">
              <strong>Daftar respons tamu</strong>
              {Array.isArray(wishes) && wishes.length ? (
                <ul>
                  {wishes.map(w => (
                    <li key={w.id} data-testid="rsvp-list-item">
                      <span className="rsvp-name">{w.name}</span>
                      <span className={`rsvp-badge ${w.attendance === "Hadir" ? "yes" : "no"}`}>{w.attendance}</span>
                      <span className="rsvp-msg">“{w.message}”</span>
                    </li>
                  ))}
                </ul>
              ) : <p>Belum ada respons tamu.</p>}
            </div>
            <div className="music-upload-card" style={{ marginBottom: 16 }}>
              <ImageIcon size={20} />
              <div className="music-upload-info">
                <strong>Foto Galeri (Frames of us)</strong>
                <p>Tambah foto baru langsung ke galeri undangan pernikahan.</p>
                {photoMsg && <p className="upload-msg" data-testid="photo-upload-status">{photoMsg}</p>}
              </div>
              <label className="upload-zone" data-testid="photo-upload-button">
                <Upload size={16} /> {uploadingPhoto ? "Mengunggah..." : "Unggah Foto"}
                <input data-testid="photo-upload-input" type="file" accept="image/*" onChange={uploadPhoto} hidden disabled={uploadingPhoto} />
              </label>
            </div>
            <div className="music-upload-card">
              <Music2 size={20} />
              <div className="music-upload-info">
                <strong>Musik undangan</strong>
                <p>{music.filename ? `Sedang dipakai: ${music.filename}` : "Unggah lagu pilihanmu — otomatis diputar saat tamu menekan Buka Undangan."}</p>
                {uploadMsg && <p className="upload-msg" data-testid="music-upload-status">{uploadMsg}</p>}
              </div>
              <label className="upload-zone" data-testid="music-upload-button">
                <Upload size={16} /> {uploading ? "Mengunggah..." : "Unggah MP3"}
                <input data-testid="music-upload-input" type="file" accept="audio/*,.mp3,.m4a,.ogg,.wav" onChange={uploadMusic} hidden disabled={uploading} />
              </label>
              <input className="music-url-input" data-testid="music-url-input" value={localUrl} onChange={e => { setLocalUrl(e.target.value); localStorage.setItem("lira-febi-music", e.target.value); }} placeholder="atau tempel URL audio (opsional)" />
            </div>
            <button className="couple-logout" data-testid="mempelai-logout-button" onClick={logoutMempelai}>Keluar dari Area Mempelai</button>
            </>
            )}
          </section>
        )}
      </main>

      <footer>
        <div className="brand">L<span>&</span>F</div>
        <p>Dengan cinta, Lira & Febi</p>
        <div className="footer-right">
          <span>01 · 11 · 2026</span>
          {!coupleMode && !invitedName && <a className="couple-link" href="?mode=mempelai" data-testid="couple-area-link"><Lock size={11} /> Area Mempelai</a>}
        </div>
      </footer>

      <audio
        ref={audioRef}
        src={activeMusicUrl || undefined}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <AnimatePresence>
        {giftOpen && (
          <motion.div className="gift-modal" data-testid="gift-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGiftOpen(false)}>
            <motion.div className="gift-modal-card" initial={{ scale: 0.92, y: 34, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} onClick={e => e.stopPropagation()}>
              <button className="gift-modal-close" data-testid="gift-close-button" onClick={() => setGiftOpen(false)} aria-label="Tutup"><X size={18} /></button>
              <p className="script gold-text">With love</p>
              <h3>Tanda kasih<br /><em>untuk kami.</em></h3>
              <div className="bank-list" data-testid="gift-details">
                {banks.map(b => (
                  <Tilt key={b.id} intensity={8} className="bank-card" data-testid={`bank-card-${b.id}`}>
                    <div className="bank-top"><span className="bank-name">{b.bank}</span><Sparkles size={15} /></div>
                    <strong className="bank-number">{b.number}</strong>
                    <div className="bank-bottom">
                      <span>a.n. {b.name}</span>
                      <button className="bank-copy" data-testid={`copy-${b.id}-button`} onClick={() => copyBank(b)}>{copiedBank === b.id ? <Check size={14} /> : <Copy size={14} />} {copiedBank === b.id ? "Tersalin" : "Salin"}</button>
                    </div>
                  </Tilt>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}>
            <button data-testid="close-lightbox-button" onClick={() => setLightbox(null)}><X /></button>
            <motion.img src={lightbox} alt="Foto Lira dan Febi" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Home />
    </div>
  );
}

export default App;
