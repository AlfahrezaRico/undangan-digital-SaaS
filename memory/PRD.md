# PRD — Undangan Digital Bali Lira & Febi

## Original problem statement
buatkan Undangan digital dengan tema bali untuk dibagikan di whatsapp

## Product details
- Mempelai: Lira Nuraulia Asdwiningtyas, S.Psi. & Febi Herlis Setiawan, S.Ak.
- Acara: 01 November 2026 di Balai Sarmili, Depok.
- Akad: 10.00 WIB - selesai.
- Resepsi: 13.00 - 16.30 WIB.
- Kebutuhan utama: undangan dapat dibagikan berulang via WhatsApp dan lagu bisa ditambahkan kemudian.

## Architecture decisions
- React single-page invitation with responsive mobile-first layout.
- FastAPI + MongoDB endpoint for wishes/guestbook persistence.
- Uploaded couple photos are used as gallery assets.
- Music is user-provided through a URL and persisted locally in the browser.
- WhatsApp share uses a generated message with optional guest name and current invitation URL.

## Implemented
- Balinese royal visual system: obsidian, deep red, gold, geometric textile-inspired pattern, Cormorant Garamond typography.
- Opening cover with guest-name personalization and invitation reveal.
- Hero, couple profiles, countdown, Akad/Resepsi schedule, Google Maps link.
- Five-photo gallery with lightbox viewer.
- WhatsApp share and copy-link actions.
- Wishes form with attendance selection and persisted backend guestbook.
- Music URL input and playback toggle.
- Responsive layout verified on desktop and mobile with no horizontal overflow.

## Backlog
- P0: None.
- P1: Add RSVP summary dashboard for the couple.
- P1: Add a dedicated audio upload flow for guests who do not have a public song URL.
- P2: Add downloadable calendar event (.ics) and a QR code for printed cards.