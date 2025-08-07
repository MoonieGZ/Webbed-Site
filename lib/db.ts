import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "mnsydev",
  port: parseInt(process.env.DB_PORT || "3306"),
}

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default pool

export async function query(sql: string, params?: any[]) {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function queryOne(sql: string, params?: any[]) {
  const rows = await query(sql, params)
  return Array.isArray(rows) ? rows[0] : null
}
