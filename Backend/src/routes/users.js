import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  if (req.user.role !== 'admin') {
    const me = db
      .prepare(
        `SELECT id, role, full_name AS fullName, email, created_at AS createdAt
         FROM users
         WHERE id = ?`
      )
      .get(req.user.id);

    return res.json(me ? [me] : []);
  }

  const { role } = req.query;

  const rows = role
    ? db
        .prepare(
          `SELECT id, role, full_name AS fullName, email, created_at AS createdAt
           FROM users
           WHERE role = ?
           ORDER BY created_at DESC`
        )
        .all(String(role))
    : db
        .prepare(
          `SELECT id, role, full_name AS fullName, email, created_at AS createdAt
           FROM users
           ORDER BY created_at DESC`
        )
        .all();

  res.json(rows);
});

router.post('/', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admin can create users from this endpoint' });
  }

  const { role, fullName, email, passwordHash = null } = req.body || {};

  if (!['patient', 'therapist', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'role must be patient, therapist, or admin' });
  }

  if (!fullName || !email) {
    return res.status(400).json({ error: 'fullName and email are required' });
  }

  try {
    const result = db
      .prepare(
        `INSERT INTO users (role, full_name, email, password_hash)
         VALUES (?, ?, ?, ?)`
      )
      .run(role, String(fullName).trim(), String(email).trim().toLowerCase(), passwordHash);

    const created = db
      .prepare(
        `SELECT id, role, full_name AS fullName, email, created_at AS createdAt
         FROM users
         WHERE id = ?`
      )
      .get(result.lastInsertRowid);

    return res.status(201).json(created);
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    return res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
