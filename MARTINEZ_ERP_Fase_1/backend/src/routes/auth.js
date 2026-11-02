import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../services/audit.js';

const router = Router();

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Ingresa correo y contraseña.' });

  try {
    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role, is_active
       FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];
    const valid = user && user.is_active && await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await audit({ action: 'LOGIN_FAILED', details: { email }, ip: req.ip });
      return res.status(401).json({ error: 'Credenciales incorrectas o usuario inactivo.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.full_name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    await audit({ userId: user.id, action: 'LOGIN_SUCCESS', ip: req.ip });
    res.json({
      token,
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'No se pudo iniciar sesión.' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT id, full_name, email, role, is_active FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!result.rowCount || !result.rows[0].is_active) {
    return res.status(401).json({ error: 'Usuario no disponible.' });
  }
  const u = result.rows[0];
  res.json({ user: { id: u.id, name: u.full_name, email: u.email, role: u.role } });
});

router.post('/logout', authenticate, async (req, res) => {
  await audit({ userId: req.user.id, action: 'LOGOUT', ip: req.ip });
  res.json({ message: 'Sesión cerrada.' });
});

export default router;
