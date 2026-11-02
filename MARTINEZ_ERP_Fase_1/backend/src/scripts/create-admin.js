import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';

dotenv.config();

const name = process.env.INITIAL_ADMIN_NAME;
const email = process.env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();
const password = process.env.INITIAL_ADMIN_PASSWORD;

if (!name || !email || !password || password.length < 12) {
  console.error('Configura INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL y una INITIAL_ADMIN_PASSWORD de al menos 12 caracteres.');
  process.exit(1);
}

try {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount) {
    console.log('Ya existe un usuario con ese correo. No se realizaron cambios.');
  } else {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')`,
      [name, email, hash]
    );
    console.log(`Administrador creado: ${email}`);
  }
} catch (error) {
  console.error('Error creando administrador:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
