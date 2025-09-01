import mysql from "mysql2/promise"
import { neon } from "@neondatabase/serverless"

let _pool = null // MySQL pool
let _sql = null // Neon client
let _schemaEnsured = false

function isProd() {
  return process.env.NODE_ENV === "production" || !!process.env.VERCEL
}

function getEngine() {
  // Production (or if DATABASE_URL exists) => Postgres/Neon
  if (isProd() || process.env.DATABASE_URL) return "pg"
  // Otherwise default to MySQL for local development
  return "mysql"
}

// ----- MySQL (local) -----
function getMySQLConfig() {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "schools_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }
}

async function getMySQLPool() {
  if (_pool) return _pool
  const cfg = getMySQLConfig()
  _pool = mysql.createPool(cfg)
  return _pool
}

// ----- Neon (production) -----
function assertDatabaseUrl() {
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || ""
  if (!url) {
    const err = new Error(
      "Missing DATABASE_URL (Neon Postgres). Set it locally for dev Postgres or in Vercel for prod.",
    )
    err.code = "DB_CONFIG_MISSING"
    throw err
  }
  if (isProd() && /localhost|127\.0\.0\.1/i.test(url)) {
    const err = new Error("In production, DATABASE_URL must be a public Neon connection string (not localhost).")
    err.code = "DB_LOCALHOST_IN_PROD"
    throw err
  }
  return url
}

function getNeon() {
  if (_sql) return _sql
  const url = assertDatabaseUrl()
  _sql = neon(url)
  return _sql
}

// ----- Schema ensure for both engines -----
async function ensureSchema() {
  if (_schemaEnsured) return
  const engine = getEngine()
  if (engine === "pg") {
    const sql = getNeon()
    await sql`
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        contact VARCHAR(20) NOT NULL,
        image TEXT,
        email_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  } else {
    const pool = await getMySQLPool()
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
  }
  _schemaEnsured = true
}

// ----- DB-agnostic helpers -----
export async function listSchools() {
  await ensureSchema()
  const engine = getEngine()
  if (engine === "pg") {
    const sql = getNeon()
    const rows = await sql`
      SELECT id, name, address, city, image
      FROM schools
      ORDER BY id DESC
    `
    return rows
  } else {
    const pool = await getMySQLPool()
    const [rows] = await pool.query(`SELECT id, name, address, city, image FROM schools ORDER BY id DESC`)
    return rows
  }
}

export async function insertSchool({ name, address, city, state, contact, image, email_id }) {
  await ensureSchema()
  const engine = getEngine()
  if (engine === "pg") {
    const sql = getNeon()
    await sql`
      INSERT INTO schools (name, address, city, state, contact, image, email_id)
      VALUES (${name}, ${address}, ${city}, ${state}, ${contact}, ${image}, ${email_id})
    `
  } else {
    const pool = await getMySQLPool()
    await pool.execute(
      `INSERT INTO schools (name, address, city, state, contact, image, email_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, address, city, state, contact, image, email_id],
    )
  }
}

// Exported for route.js (compat/clarity)
export { ensureSchema as ensureSchoolsTable }
