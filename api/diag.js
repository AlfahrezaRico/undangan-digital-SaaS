const { getDb } = require('./_db');

module.exports = async function handler(req, res) {
  const envKeys = Object.keys(process.env).filter(k => 
    k.includes('DATABASE') || k.includes('POSTGRES') || k.includes('NEON')
  );
  
  const hasDb = Boolean(getDb());
  
  let dbError = null;
  let dbConnected = false;
  if (hasDb) {
    try {
      const sql = getDb();
      const test = await sql`SELECT 1 as num`;
      dbConnected = Boolean(test && test[0] && test[0].num === 1);
    } catch (e) {
      dbError = e.message;
    }
  }

  return res.status(200).json({
    matchingEnvKeysFound: envKeys,
    hasDbUrl: hasDb,
    dbConnected,
    dbError
  });
};
