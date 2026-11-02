import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { audit } from '../services/audit.js';

const router = Router();
router.use(authenticate, requireRole('admin'));

router.get('/', async (_req, res) => {
  const result = await pool.query(
    `SELECT id, full_name, email, role, is_active, created_at
     FROM users ORDER BY created_at DESC`
  );
  res.json({ users: result.rows });
});

router.post('/', async (req, res) => {
  const { fullName, email, password, role = 'user' } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();
  if (!fullName?.trim() || !normalizedEmail || !password || password.length < 12) {
    return res.status(400).json({ error: 'Completa nombre, correo y contraseña de al menos 12 caracteres.' });
  }
  if (!['admin', 'manager', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Rol no válido.' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, is_active, created_at`,
      [fullName.trim(), normalizedEmail, hash, role]
    );
    await audit({ userId: req.user.id, action: 'USER_CREATED', details: { targetUserId: result.rows[0].id }, ip: req.ip });
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ese correo ya está registrado.' });
    console.error(error.message);
    res.status(500).json({ error: 'No se pudo crear el usuario.' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const active = req.body.isActive;
  if (typeof active !== 'boolean') return res.status(400).json({ error: 'Envía isActive como true o false.' });
  if (Number(req.params.id) === Number(req.user.id) && !active) {
    return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta.' });
  }
  const result = await pool.query(
    `UPDATE users SET is_active = $1, updated_at = NOW()
     WHERE id = $2 RETURNING id, full_name, email, role, is_active`,
    [active, req.params.id]
  );
  if (!result.rowCount) return res.status(404).json({ error: 'Usuario no encontrado.' });
  await audit({ userId: req.user.id, action: 'USER_STATUS_CHANGED', details: { targetUserId: Number(req.params.id), isActive: active }, ip: req.ip });
  res.json({ user: result.rows[0] });
});

export default router;
