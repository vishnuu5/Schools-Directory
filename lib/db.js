import mysql from "mysql2/promise";

let pool;

function getEnv(key, fallbacks = []) {
  if (process.env[key] && process.env[key] !== "") return process.env[key];
  for (const alt of fallbacks) {
    if (process.env[alt] && process.env[alt] !== "") return process.env[alt];
  }
  return undefined;
}

function assertDbEnv() {
  // Support both DATABASE_* and DB_* naming
  const host = getEnv("DATABASE_HOST", ["DB_HOST"]);
  const user = getEnv("DATABASE_USER", ["DB_USER"]);
  const password = getEnv("DATABASE_PASSWORD", ["DB_PASSWORD"]);
  const database = getEnv("DATABASE_NAME", ["DB_NAME"]);
  const portRaw = getEnv("DATABASE_PORT", ["DB_PORT"]);
  const port = portRaw ? Number(portRaw) : 3306;

  const missing = [];
  if (!host) missing.push("DATABASE_HOST or DB_HOST");
  if (!user) missing.push("DATABASE_USER or DB_USER");
  if (!password) missing.push("DATABASE_PASSWORD or DB_PASSWORD");
  if (!database) missing.push("DATABASE_NAME or DB_NAME");

  if (missing.length) {
    const err = new Error(
      `Missing database environment variables: ${missing.join(
        ", "
      )}. Set them in .env.local for dev or your hosting provider settings for prod.`
    );
    err.code = "DB_CONFIG_MISSING";
    throw err;
  }

  return { host, user, password, database, port };
}

export function getDb() {
  if (!pool) {
    const { host, user, password, database, port } = assertDbEnv();
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function ensureSchoolsTable() {
  const { host, user, password, database, port } = assertDbEnv();

  // Create the database if missing using a temporary server-level connection (no database specified)
  const serverConn = await mysql.createConnection({
    host,
    user,
    password,
    port,
  });
  try {
    await serverConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await serverConn.end();
  }

  // Initialize pool (once) now that the database is guaranteed to exist
  if (!pool) {
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  // Ensure the schools table exists (idempotent)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      contact VARCHAR(20) NOT NULL,
      image TEXT,
      email_id TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
