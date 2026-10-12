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
      return res.status(200).json([]);
    }
    try {
      const rows = await sql`SELECT id, url, created_at FROM gallery_photos ORDER BY id ASC`;
      const urls = rows.map(r => r.url);
      return res.status(200).json(urls);
    } catch (err) {
      console.error('Error fetching gallery photos:', err);
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    const { url } = req.body || {};
    if (!url) {
      return res.status(400).json({ detail: 'Data foto diperlukan' });
    }

    if (!sql) {
      return res.status(200).json({ success: true, url });
    }

    try {
      const inserted = await sql`
        INSERT INTO gallery_photos (url)
        VALUES (${url})
        RETURNING id, url, created_at
      `;
      return res.status(200).json({ success: true, url: inserted[0]?.url || url });
    } catch (err) {
      console.error('Error saving gallery photo:', err);
      return res.status(500).json({ detail: 'Gagal menyimpan foto ke database' });
    }
  }

  return res.status(405).json({ detail: 'Method not allowed' });
};
