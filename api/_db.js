const { neon } = require('@neondatabase/serverless');

let tablesInitialized = false;

function getDb() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
  if (!url) return null;
  return neon(url);
}

async function ensureTables(sql) {
  if (tablesInitialized || !sql) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS wishes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        attendance TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS gallery_photos (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;
    tablesInitialized = true;
  } catch (err) {
    console.error("Neon init error:", err);
  }
}

module.exports = { getDb, ensureTables };
