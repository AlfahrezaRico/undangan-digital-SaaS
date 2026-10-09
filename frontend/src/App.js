import { useEffect, useMemo, useRef, useState } from "react";
import "@/App.css";
import axios from "axios";
import Lenis from "lenis";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, BadgeCheck, CalendarDays, Check, ChevronDown, Clock3, Copy, Download, ExternalLink, Gift, Heart, Image as ImageIcon, Lock, MapPin, Music2, Send, Share2, Sparkles, Upload, Users, Volume2, VolumeX, X } from "lucide-react";
import { MaskLine, Reveal, Tilt } from "./components/motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const photos = [
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/5u3915fl_WhatsApp%20Image%202026-10-06%20at%2012.34.26%20%282%29.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/k84z72zq_WhatsApp%20Image%202026-10-06%20at%2012.34.26%20%281%29.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/vmrzlpkx_WhatsApp%20Image%202026-10-06%20at%2012.34.25.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/5lhyj9rx_WhatsApp%20Image%202026-10-06%20at%2012.34.25%20%283%29.jpeg",
  "https://customer-assets-4nw71qhi.emergentagent.net/job_e21eee82-41e5-497d-bbbb-3af56464b787/artifacts/dfhzkerh_WhatsApp%20Image%202026-10-06%20at%2012.34.26%20%283%29.jpeg",
  "/photos/momen-6.jpg",
  "/photos/momen-7.jpg",
];

const story = [
  { year: "MASA SEKOLAH", title: "Berjalan Sejajar", text: "Di bawah naungan sekolah yang sama, keduanya pernah berjalan sejajar tanpa saling menyapa, hingga takdir membawa mereka menempuh jalan masing-masing." },
  { year: "02 JULI 2026", title: "Dipertemukan Kembali", text: "Semesta mempertemukan mereka kembali. Lewat perkenalan yang lebih dalam, keduanya tersadar bahwa masa lalu hanyalah cara Tuhan menyiapkan waktu terbaik untuk saling menemukan." },
  { year: "03 OKTOBER 2026", title: "Sebuah Pinangan", text: "Berbekal ketulusan dan restu yang luruh dari doa orang tua, ia bersimpuh meminta Lira menjadi teman sehidup sematinya. Air mata haru menyambut kesungguhan itu, mengikat dua hati dalam kepastian." },
  { year: "01 NOVEMBER 2026", title: "Selamanya", text: "Kini, seluruh rindu dan penantian panjang itu bermuara pada satu hari yang paling dinanti: melangkah bersama menuju ikatan suci, merajut janji di hadapan-Nya untuk saling menggenggam selamanya." },
];

const banks = [
  { id: "bca", bank: "BCA", number: "1234 5678 90", name: "Lira Nuraulia Asdwiningtyas" },
  { id: "mandiri", bank: "MANDIRI", number: "9876 5432 10", name: "Febi Herlis Setiawan" },
];

const GCAL_URL = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Pernikahan%20Lira%20%26%20Febi&dates=20261101T030000Z/20261101T093000Z&details=Akad%20Nikah%2010.00%20WIB%20-%20selesai%2C%20dilanjutkan%20Resepsi%2013.00%20-%2016.30%20WIB&location=Balai%20Sarmili%2C%20Depok";

const Home = () => {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const coupleMode = params.get("mode") === "mempelai";
  const [opened, setOpened] = useState(false);
  const [guest, setGuest] = useState(params.get("to") || "");
  const [music, setMusic] = useState({ url: null, filename: null });
  const [localUrl, setLocalUrl] = useState(localStorage.getItem("lira-febi-music") || "");
  const [playing, setPlaying] = useState(false);
  const [lightbox, setLightbox] = useState(null);
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

  const activeMusicUrl = music.url ? `${BACKEND_URL}${music.url}` : localUrl;

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

  const fetchSummary = () => axios.get(`${API}/rsvp-summary`).then(r => setSummary(r.data)).catch(() => {});
  useEffect(() => {
    axios.get(`${API}/wishes`).then(r => setWishes(r.data)).catch(() => {});
    axios.get(`${API}/music`).then(r => { if (r.data?.url) setMusic(r.data); }).catch(() => {});
    fetchSummary();
  }, []);

  useEffect(() => {
    const tick = () => {
      const diff = new Date("2026-11-01T10:00:00+07:00") - new Date();
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
    setTimeout(() => { audioRef.current?.play().catch(() => {}); }, 400);
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
      setWishes([r.data, ...wishes]);
      setWish({ name: "", message: "", attendance: "Hadir" });
      fetchSummary();
    } catch (_) {}
  };
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  const copyLink = async () => {
    const link = guest ? `${window.location.origin}${window.location.pathname}?to=${encodeURIComponent(guest)}` : window.location.href;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const copyBank = async (bank) => {
    await navigator.clipboard.writeText(bank.number.replace(/\s/g, ""));
    setCopiedBank(bank.id);
    setTimeout(() => setCopiedBank(""), 1800);
  };
  const uploadMusic = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true); setUploadMsg("");
    const fd = new FormData();
    fd.append("file", f);
    try {
      const r = await axios.post(`${API}/music`, fd);
      setMusic(r.data);
      setUploadMsg(`Tersimpan: ${r.data.filename}`);
      setTimeout(() => audioRef.current?.play().catch(() => {}), 300);
    } catch (err) {
      setUploadMsg(err.response?.data?.detail || "Gagal mengunggah, coba lagi");
    }
    setUploading(false);
    e.target.value = "";
  };
  const downloadICS = () => {
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//LiraFebi//Undangan//ID", "BEGIN:VEVENT", "UID:lira-febi-2026@undangan", "DTSTAMP:20260701T000000Z", "DTSTART:20261101T030000Z", "DTEND:20261101T093000Z", "SUMMARY:Pernikahan Lira & Febi", "DESCRIPTION:Akad Nikah 10.00 WIB - selesai\\, dilanjutkan Resepsi 13.00 - 16.30 WIB", "LOCATION:Balai Sarmili\\, Depok", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Pernikahan-Lira-Febi.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const go = (e, target) => { e.preventDefault(); lenisRef.current?.scrollTo(target, { offset: -70 }); };

  return (
    <div className="invite-shell">
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
              {guest && <p className="cover-guest" data-testid="cover-guest-name">Kepada Yth.<br /><strong>{guest}</strong></p>}
              <input data-testid="guest-name-input" value={guest} onChange={e => setGuest(e.target.value)} placeholder="Nama tamu (opsional)" />
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
              <img data-testid="hero-couple-image" src={photos[2]} alt="Lira dan Febi mengenakan busana adat Bali" />
              <div className="image-frame" />
            </Tilt>
          </motion.div>
          <div className="hero-stamp">L<span>&</span>F<br /><small>2026</small></div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map(n => (
              <div className="marquee-group" key={n}>
                <span>LIRA <i>&</i> FEBI</span><b>✦</b><span>01 NOVEMBER 2026</span><b>✦</b><span>BALAI SARMILI · DEPOK</span><b>✦</b><span>ASSALAMU'ALAIKUM</span><b>✦</b><span>AKAD 10.00 WIB</span><b>✦</b><span>RESEPSI 13.00 — 16.30 WIB</span><b>✦</b>
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
            <Reveal><Tilt intensity={7} className="schedule-card" data-testid="akad-card"><span className="event-number">01</span><Clock3 /><h3>Akad Nikah</h3><p>10.00 WIB — selesai</p><div className="thin-line" /><span className="event-label">BALAI SARMILI, DEPOK</span></Tilt></Reveal>
            <Reveal delay={0.12}><Tilt intensity={7} className="schedule-card featured" data-testid="resepsi-card"><span className="event-number">02</span><Sparkles /><h3>Resepsi</h3><p>13.00 — 16.30 WIB</p><div className="thin-line" /><span className="event-label">BALAI SARMILI, DEPOK</span></Tilt></Reveal>
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
            {photos.map((photo, i) => (
              <Reveal key={photo} delay={0.06 * i} className={`photo-wrap photo-${i + 1}`}>
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
            <Reveal><Tilt intensity={6} className="video-card" data-testid="video-card-1"><video data-testid="video-1" src="/videos/momen-1.mp4" poster="/videos/poster-1.jpg" controls preload="metadata" playsInline /><span className="video-label">CUPLIKAN 01</span></Tilt></Reveal>
            <Reveal delay={0.12}><Tilt intensity={6} className="video-card portrait" data-testid="video-card-2"><video data-testid="video-2" src="/videos/momen-2.mp4" poster="/videos/poster-2.jpg" controls preload="metadata" playsInline /><span className="video-label">CUPLIKAN 02</span></Tilt></Reveal>
          </div>
        </section>

        <section className="gift section" id="gift">
          <Reveal className="section-kicker">06 / TANDA KASIH</Reveal>
          <div className="gift-box">
            <Reveal>
              <p className="script gold-text">With love</p>
              <h2>Kirim<br /><em>tanda kasih.</em></h2>
              <p className="body-copy">Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami. Namun jika Bapak/Ibu/Saudara/i berkenan berbagi tanda kasih, kami sediakan dengan penuh terima kasih.</p>
              <button className="gold-button gift-trigger" data-testid="gift-reveal-button" onClick={() => setGiftOpen(!giftOpen)}>
                <Gift size={15} /> {giftOpen ? "Tutup detail hadiah" : "Kirim Hadiah"}
              </button>
            </Reveal>
            <AnimatePresence>
              {giftOpen && (
                <motion.div className="bank-list" data-testid="gift-details" initial={{ opacity: 0, y: 26, rotateX: -12 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} exit={{ opacity: 0, y: 20, rotateX: -10 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="wishes section">
          <Reveal className="section-kicker">07 / WISHES & RSVP</Reveal>
          <div className="wishes-grid">
            <Reveal>
              <p className="script gold-text">Leave a note</p>
              <h2>Doa baik<br /><em>untuk kami.</em></h2>
              <div className="rsvp-chips" data-testid="rsvp-summary">
                <div className="chip" data-testid="rsvp-hadir-count"><BadgeCheck size={14} /><strong>{summary.hadir}</strong> Hadir</div>
                <div className="chip" data-testid="rsvp-berhalangan-count"><X size={14} /><strong>{summary.berhalangan}</strong> Berhalangan</div>
                <div className="chip" data-testid="rsvp-total-count"><Users size={14} /><strong>{summary.total}</strong> Respons</div>
              </div>
              <form onSubmit={submitWish} className="wish-form">
                <input data-testid="wish-name-input" value={wish.name} onChange={e => setWish({ ...wish, name: e.target.value })} placeholder="Nama Anda" required />
                <select data-testid="wish-attendance-select" value={wish.attendance} onChange={e => setWish({ ...wish, attendance: e.target.value })}><option>Hadir</option><option>Berhalangan hadir</option></select>
                <textarea data-testid="wish-message-input" value={wish.message} onChange={e => setWish({ ...wish, message: e.target.value })} placeholder="Tulis ucapan dan doa..." required />
                <button data-testid="wish-submit-button" className="gold-button" type="submit">Kirim ucapan <Send size={15} /></button>
              </form>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="wish-list">
                {wishes.length ? wishes.slice(0, 4).map(w => <article key={w.id} data-testid="wish-card"><div><strong>{w.name}</strong><span>{w.attendance}</span></div><p>{w.message}</p></article>) : <div className="empty-wishes"><Heart size={25} /><p>Jadilah yang pertama<br />mengirimkan doa untuk kami.</p></div>}
              </div>
            </Reveal>
          </div>
        </section>

        {coupleMode && (
          <section className="share-section section" data-testid="couple-area">
            <div className="couple-area-label"><Lock size={12} /> AREA MEMPELAI — tidak terlihat oleh tamu</div>
            <div className="share-card">
              <div>
                <p className="script">Share the joy</p>
                <h2>Ajak orang-orang<br /><em>tersayang.</em></h2>
                <p>Bagikan undangan ini kepada keluarga dan sahabat dengan nama tamu yang berbeda.</p>
              </div>
              <div className="share-actions">
                <input data-testid="share-guest-input" value={guest} onChange={e => setGuest(e.target.value)} placeholder="Nama tamu" />
                <button data-testid="whatsapp-share-button" className="whatsapp-button" onClick={shareWhatsApp}><Share2 size={17} /> Bagikan ke WhatsApp</button>
                <button data-testid="copy-link-button" className="copy-button" onClick={copyLink}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Tautan disalin" : "Salin tautan undangan"}</button>
              </div>
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
          </section>
        )}
      </main>

      <footer>
        <div className="brand">L<span>&</span>F</div>
        <p>Dengan cinta, Lira & Febi</p>
        <div className="footer-right">
          <span>01 · 11 · 2026</span>
          {!coupleMode && <a className="couple-link" href="?mode=mempelai" data-testid="couple-area-link"><Lock size={11} /> Area Mempelai</a>}
        </div>
      </footer>

      {activeMusicUrl && <audio ref={audioRef} src={activeMusicUrl} loop onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}

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
