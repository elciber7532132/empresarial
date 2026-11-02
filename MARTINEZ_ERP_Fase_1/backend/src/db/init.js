import { pool } from './pool.js';
import { ensureSchema } from './schema.js';

try {
  await ensureSchema();
  console.log('Esquema MARTÍNEZ ERP inicializado correctamente.');
} catch (error) {
  console.error('No se pudo inicializar la base de datos:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
