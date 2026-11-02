import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL. Configúrala en el archivo .env o en las variables del servicio.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool PostgreSQL:', err.message);
});
