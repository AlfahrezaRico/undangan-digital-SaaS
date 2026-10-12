const { getDb, ensureTables } = require('../_db');

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { pin } = req.body || {};
  const validPin = (process.env.MEMPELAI_PIN || 'LF011126').trim().toUpperCase();

  if (!pin || pin.trim().toUpperCase() !== validPin) {
    return res.status(401).json({ detail: 'PIN salah' });
  }

  // Token session
  return res.status(200).json({
    token: 'mempelai_token_' + Buffer.from(pin).toString('base64'),
    message: 'Login berhasil'
  });
};
