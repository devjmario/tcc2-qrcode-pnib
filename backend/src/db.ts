import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
});

export async function testarConexao() {
  const result = await pool.query(
    "SELECT NOW() AS horario"
  );

  console.log(
    "PostgreSQL conectado:",
    result.rows[0].horario
  );
}