import { pool } from '../db/pool.js';

export async function audit({ userId = null, action, details = {}, ip = null }) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, details, ip_address)
     VALUES ($1, $2, $3, $4)`,
    [userId, action, JSON.stringify(details), ip]
  );
}
