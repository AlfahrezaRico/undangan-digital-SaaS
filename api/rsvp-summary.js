const { getDb, ensureTables } = require('./_db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = getDb();
  if (!sql) {
    return res.status(200).json({ hadir: 0, berhalangan: 0, total: 0 });
  }

  try {
    await ensureTables(sql);
    const counts = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE attendance ILIKE '%hadir%' AND attendance NOT ILIKE '%berhalangan%') AS hadir,
        COUNT(*) FILTER (WHERE attendance ILIKE '%berhalangan%') AS berhalangan,
        COUNT(*) AS total
      FROM wishes;
    `;
    const result = counts[0] || { hadir: 0, berhalangan: 0, total: 0 };
    return res.status(200).json({
      hadir: parseInt(result.hadir || 0, 10),
      berhalangan: parseInt(result.berhalangan || 0, 10),
      total: parseInt(result.total || 0, 10)
    });
  } catch (err) {
    console.error('Error fetching rsvp-summary:', err);
    return res.status(200).json({ hadir: 0, berhalangan: 0, total: 0 });
  }
};
