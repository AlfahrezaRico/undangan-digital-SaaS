const { getDb, ensureTables } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
      const rows = await sql`SELECT id, name, attendance, message, created_at FROM wishes ORDER BY id DESC LIMIT 100`;
      return res.status(200).json(rows);
    } catch (err) {
      console.error('Error fetching wishes:', err);
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    const { name, attendance, message } = req.body || {};
    if (!name || !message) {
      return res.status(400).json({ detail: 'Nama dan ucapan wajib diisi' });
    }

    const wishObj = {
      id: Date.now(),
      name: String(name).slice(0, 100),
      attendance: attendance === 'Berhalangan hadir' ? 'Berhalangan' : 'Hadir',
      message: String(message).slice(0, 1000),
      created_at: new Date().toISOString()
    };

    if (!sql) {
      return res.status(200).json(wishObj);
    }

    try {
      const inserted = await sql`
        INSERT INTO wishes (name, attendance, message)
        VALUES (${wishObj.name}, ${wishObj.attendance}, ${wishObj.message})
        RETURNING id, name, attendance, message, created_at
      `;
      return res.status(200).json(inserted[0] || wishObj);
    } catch (err) {
      console.error('Error saving wish:', err);
      return res.status(200).json(wishObj);
    }
  }

  return res.status(405).json({ detail: 'Method not allowed' });
};
