import { useEffect, useMemo, useRef, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { ArrowDown, CalendarDays, Check, ChevronDown, Clock3, Copy, ExternalLink, Heart, Image as ImageIcon, Instagram, MapPin, Menu, Music2, Send, Share2, Sparkles, Volume2, VolumeX, X } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const photos = [
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/5u3915fl_WhatsApp%20Image%202026-10-06%20at%2012.34.26%20%282%29.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/k84z72zq_WhatsApp%20Image%202026-10-06%20at%2012.34.26%20%281%29.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/vmrzlpkx_WhatsApp%20Image%202026-10-06%20at%2012.34.25.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/5lhyj9rx_WhatsApp%20Image%202026-10-06%20at%2012.34.25%20%283%29.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/dfhzkerh_WhatsApp%20Image%202026-10-06%20at%2012.34.26%20%283%29.jpeg",
];

const Home = () => {
  const [opened, setOpened] = useState(false); const [guest, setGuest] = useState(""); const [musicUrl, setMusicUrl] = useState(localStorage.getItem("lira-febi-music") || "");
  const [playing, setPlaying] = useState(false); const [lightbox, setLightbox] = useState(null); const [wishes, setWishes] = useState([]); const [wish, setWish] = useState({ name: "", message: "", attendance: "Hadir" }); const audioRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState({ days: "--", hours: "--", minutes: "--", seconds: "--" });
  useEffect(() => { axios.get(`${API}/wishes`).then(r => setWishes(r.data)).catch(() => {}); }, []);
  useEffect(() => { const tick = () => { const diff = new Date("2026-11-01T10:00:00+07:00") - new Date(); if (diff <= 0) return; setTime({ days: Math.floor(diff / 86400000), hours: Math.floor(diff / 3600000) % 24, minutes: Math.floor(diff / 60000) % 60, seconds: Math.floor(diff / 1000) % 60 }); }; tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);
  const shareText = useMemo(() => `Dengan penuh sukacita, kami mengundang ${guest || "Bapak/Ibu/Saudara/i"} untuk hadir di pernikahan Lira & Febi pada 01 November 2026. Lihat undangan: ${window.location.href}`, [guest]);
  const toggleMusic = () => { if (!audioRef.current || !musicUrl) return; if (playing) audioRef.current.pause(); else audioRef.current.play().catch(() => {}); setPlaying(!playing); };
  const saveMusic = (value) => { setMusicUrl(value); localStorage.setItem("lira-febi-music", value); };
  const submitWish = async (e) => { e.preventDefault(); if (!wish.name || !wish.message) return; try { const r = await axios.post(`${API}/wishes`, wish); setWishes([r.data, ...wishes]); setWish({ name: "", message: "", attendance: "Hadir" }); } catch (_) {} };
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const copyLink = async () => { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); };

  return (
    <div className="invite-shell">
      {!opened && <div className="cover" data-testid="invitation-cover"><div className="cover-pattern" /><div className="cover-content"><p className="eyebrow">UNDANGAN PERNIKAHAN</p><div className="ornament">✦</div><p className="cover-script">The wedding of</p><h1>Lira <span>&</span> Febi</h1><p className="cover-date">01 · 11 · 2026</p><input data-testid="guest-name-input" value={guest} onChange={e => setGuest(e.target.value)} placeholder="Nama tamu (opsional)" /><button data-testid="open-invitation-button" className="gold-button" onClick={() => setOpened(true)}>Buka Undangan <ArrowDown size={16} /></button><p className="cover-note">Kepada Yth. Bapak/Ibu/Saudara/i</p></div></div>}
      <nav className="topbar"><a href="#home" className="brand" data-testid="brand-link">L<span>&</span>F</a><div className="navlinks"><a href="#couple" data-testid="nav-couple-link">Mempelai</a><a href="#event" data-testid="nav-event-link">Acara</a><a href="#gallery" data-testid="nav-gallery-link">Galeri</a></div><button className="icon-button" data-testid="music-toggle-button" onClick={toggleMusic} aria-label="Putar musik">{playing ? <Volume2 size={18} /> : <VolumeX size={18} />}</button></nav>
      <main id="home">
        <section className="hero"><div className="hero-copy"><p className="eyebrow">OM SWASTIASTU</p><div className="gold-rule" /><p className="script">A celebration of love</p><h1>Lira <i>&</i><br />Febi</h1><p className="hero-date">01 NOVEMBER 2026 <span>·</span> DEPOK</p><a className="scroll-hint" href="#couple" data-testid="hero-scroll-link"><span>SCROLL TO EXPLORE</span><ChevronDown size={16} /></a></div><div className="hero-image"><img data-testid="hero-couple-image" src={photos[2]} alt="Lira dan Febi mengenakan busana adat Bali" /><div className="image-frame" /></div><div className="hero-stamp">L<span>&</span>F<br /><small>2026</small></div></section>
        <section className="intro section" id="couple"><div className="section-kicker">01 / MEMPELAI</div><div className="intro-grid"><div><p className="script gold-text">Dengan penuh rasa syukur</p><h2>Two souls,<br /><em>one journey.</em></h2></div><div><p className="body-copy">Atas rahmat Ida Sang Hyang Widhi Wasa, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada hari bahagia kami.</p><div className="couple-names"><div><h3>Lira Nuraulia<br />Asdwiningtyas, S.Psi.</h3><p>Putri kedua<br />Bpk. Hadi Wiyono &<br />Ibu Ni Wayan Rindiasih</p></div><div className="ampersand">&</div><div><h3>Febi Herlis<br />Setiawan, S.Ak.</h3><p>Putra kedua<br />Bpk. Heriyanto &<br />Ibu Liestari</p></div></div></div></div></section>
        <section className="countdown-band"><p className="script">Counting the moments</p><h2>Menuju hari bahagia</h2><div className="timer" data-testid="countdown-timer">{[[time.days,"Hari"],[time.hours,"Jam"],[time.minutes,"Menit"],[time.seconds,"Detik"]].map(([v,l]) => <div key={l}><strong>{String(v).padStart(2,"0")}</strong><span>{l}</span></div>)}</div></section>
        <section className="event section" id="event"><div className="section-kicker">02 / THE DAY</div><div className="event-head"><div><p className="script gold-text">Save the date</p><h2>Hari yang kami<br /><em>nantikan.</em></h2></div><div className="date-card"><CalendarDays size={23} /><strong>01</strong><span>NOVEMBER<br />2026</span></div></div><div className="event-grid"><div className="schedule-card"><span className="event-number">01</span><Clock3 /><h3>Akad Nikah</h3><p>10.00 WIB — selesai</p><div className="thin-line" /><span className="event-label">BALAI SARMILI, DEPOK</span></div><div className="schedule-card featured"><span className="event-number">02</span><Sparkles /><h3>Resepsi</h3><p>13.00 — 16.30 WIB</p><div className="thin-line" /><span className="event-label">BALAI SARMILI, DEPOK</span></div></div><a className="map-link" href="https://maps.app.goo.gl/yNbbxjNhwcBPoaVZ7?g_st=ic" target="_blank" rel="noreferrer" data-testid="maps-link"><MapPin size={17} /> Buka petunjuk lokasi <ExternalLink size={14} /></a></section>
        <section className="gallery section" id="gallery"><div className="section-kicker">03 / OUR MOMENTS</div><div className="gallery-head"><div><p className="script gold-text">A little glimpse</p><h2>Frames of<br /><em>us.</em></h2></div><p className="body-copy">Setiap foto menyimpan cerita. Terima kasih telah menjadi bagian dari babak baru dalam perjalanan kami.</p></div><div className="gallery-grid">{photos.map((photo, i) => <button key={photo} className={`photo photo-${i + 1}`} onClick={() => setLightbox(photo)} data-testid={`gallery-photo-${i + 1}`}><img src={photo} alt={`Momen Lira dan Febi ${i + 1}`} /><span><ImageIcon size={15} /> Lihat</span></button>)}</div></section>
        <section className="share-section section"><div className="share-card"><div><p className="script">Share the joy</p><h2>Ajak orang-orang<br /><em>tersayang.</em></h2><p>Bagikan undangan ini kepada keluarga dan sahabat dengan nama tamu yang berbeda.</p></div><div className="share-actions"><input data-testid="share-guest-input" value={guest} onChange={e => setGuest(e.target.value)} placeholder="Nama tamu" /><button data-testid="whatsapp-share-button" className="whatsapp-button" onClick={shareWhatsApp}><Share2 size={17} /> Bagikan ke WhatsApp</button><button data-testid="copy-link-button" className="copy-button" onClick={copyLink}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Tautan disalin" : "Salin tautan undangan"}</button></div></div></section>
        <section className="wishes section"><div className="section-kicker">04 / WISHES</div><div className="wishes-grid"><div><p className="script gold-text">Leave a note</p><h2>Doa baik<br /><em>untuk kami.</em></h2><form onSubmit={submitWish} className="wish-form"><input data-testid="wish-name-input" value={wish.name} onChange={e => setWish({...wish, name:e.target.value})} placeholder="Nama Anda" required /><select data-testid="wish-attendance-select" value={wish.attendance} onChange={e => setWish({...wish, attendance:e.target.value})}><option>Hadir</option><option>Berhalangan hadir</option></select><textarea data-testid="wish-message-input" value={wish.message} onChange={e => setWish({...wish, message:e.target.value})} placeholder="Tulis ucapan dan doa..." required /><button data-testid="wish-submit-button" className="gold-button" type="submit">Kirim ucapan <Send size={15} /></button></form></div><div className="wish-list">{wishes.length ? wishes.slice(0, 4).map(w => <article key={w.id} data-testid="wish-card"><div><strong>{w.name}</strong><span>{w.attendance}</span></div><p>{w.message}</p></article>) : <div className="empty-wishes"><Heart size={25} /><p>Jadilah yang pertama<br />mengirimkan doa untuk kami.</p></div>}</div></div></section>
        <section className="music-section"><Music2 size={18} /><div><strong>Musik undangan</strong><p>Tambahkan lagu pilihanmu kapan saja dengan menempel URL audio.</p></div><input data-testid="music-url-input" value={musicUrl} onChange={e => saveMusic(e.target.value)} placeholder="https://.../lagu.mp3" />{musicUrl && <audio ref={audioRef} src={musicUrl} loop onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}</section>
      </main><footer><div className="brand">L<span>&</span>F</div><p>Dengan cinta, Lira & Febi</p><div><Instagram size={16} /><span>01 · 11 · 2026</span></div></footer>
      {lightbox && <div className="lightbox" onClick={() => setLightbox(null)}><button data-testid="close-lightbox-button" onClick={() => setLightbox(null)}><X /></button><img src={lightbox} alt="Foto Lira dan Febi" /></div>}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
