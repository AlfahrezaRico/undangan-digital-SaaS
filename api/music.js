const { getDb, ensureTables } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getDb();
  if (sql) {
    await ensureTables(sql);
  }

  if (req.method === 'GET') {
    if (!sql) {
      return res.status(200).json({ url: null, filename: null });
    }
    try {
      const rows = await sql`SELECT value FROM settings WHERE key = 'wedding_music' LIMIT 1`;
      const nameRows = await sql`SELECT value FROM settings WHERE key = 'wedding_music_filename' LIMIT 1`;
      if (rows && rows.length && rows[0].value) {
        const fname = (nameRows && nameRows.length && nameRows[0].value) ? nameRows[0].value : 'Lagu Pernikahan';
        return res.status(200).json({ url: rows[0].value, filename: fname });
      }
      return res.status(200).json({ url: null, filename: null });
    } catch (err) {
      console.error('Error fetching music:', err);
      return res.status(200).json({ url: null, filename: null });
    }
  }

  if (req.method === 'POST') {
    const { url, filename } = req.body || {};
    if (!url) {
      return res.status(400).json({ detail: 'URL atau data audio diperlukan' });
    }

    const songTitle = filename || 'Lagu Pernikahan';

    if (!sql) {
      return res.status(200).json({ url, filename: songTitle });
    }

    try {
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('wedding_music', ${url})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
      await sql`
        INSERT INTO settings (key, value)
        VALUES ('wedding_music_filename', ${songTitle})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
      return res.status(200).json({ url, filename: songTitle });
    } catch (err) {
      console.error('Error saving music:', err);
      return res.status(500).json({ detail: 'Gagal menyimpan musik ke database' });
    }
  }

  return res.status(405).json({ detail: 'Method not allowed' });
};
