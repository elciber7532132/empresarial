import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/summary', async (req, res) => {
  const users = await pool.query('SELECT COUNT(*)::int AS total FROM users WHERE is_active = TRUE');
  const recent = req.user.role === 'admin'
    ? await pool.query(
        `SELECT a.id, a.action, a.details, a.ip_address, a.created_at, u.full_name
         FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
         ORDER BY a.created_at DESC LIMIT 8`
      )
    : { rows: [] };

  res.json({
    indicators: { activeUsers: users.rows[0].total },
    recentActivity: recent.rows
  });
});

router.get('/audit', requireRole('admin'), async (req, res) => {
  const result = await pool.query(
    `SELECT a.id, a.action, a.details, a.ip_address, a.created_at, u.full_name, u.email
     FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC LIMIT 100`
  );
  res.json({ logs: result.rows });
});

export default router;
