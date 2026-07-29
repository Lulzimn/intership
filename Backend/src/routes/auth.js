import bcrypt from 'bcryptjs';
import { Router } from 'express';
import db from '../db.js';
import { requireAuth, signAuthToken } from '../auth.js';

const router = Router();

function mapUser(row) {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    email: row.email,
    createdAt: row.created_at,
  };
}

router.post('/register', (req, res) => {
  const { role = 'patient', fullName, email, password, therapistId } = req.body || {};

  if (!['patient', 'therapist'].includes(role)) {
    return res.status(400).json({ error: 'role must be patient or therapist' });
  }

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email and password are required' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters' });
  }

  const parsedTherapistId = therapistId === undefined || therapistId === null || therapistId === ''
    ? null
    : Number(therapistId);

  if (role === 'patient' && !Number.isInteger(parsedTherapistId)) {
    return res.status(400).json({ error: 'therapistId is required for patient registration' });
  }

  if (role === 'patient') {
    const therapist = db
      .prepare("SELECT id FROM users WHERE id = ? AND role = 'therapist'")
      .get(parsedTherapistId);

    if (!therapist) {
      return res.status(404).json({ error: 'Selected therapist not found' });
    }
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const passwordHash = bcrypt.hashSync(String(password), 10);

  try {
    const createUser = db.transaction(() => {
      const result = db
        .prepare(
          `INSERT INTO users (role, full_name, email, password_hash)
           VALUES (?, ?, ?, ?)`
        )
        .run(role, String(fullName).trim(), cleanEmail, passwordHash);

      const userId = Number(result.lastInsertRowid);

      if (role === 'patient') {
        db.prepare(
          `INSERT OR IGNORE INTO therapist_patient_links (therapist_id, patient_id)
           VALUES (?, ?)`
        ).run(parsedTherapistId, userId);

        db.prepare(
          `INSERT INTO clients (user_id, therapist_id)
           VALUES (?, ?)`
        ).run(userId, parsedTherapistId);
      }

      return userId;
    });

    const createdUserId = createUser();

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(createdUserId);
    const authUser = {
      id: user.id,
      role: user.role,
      email: user.email,
      fullName: user.full_name,
    };

    return res.status(201).json({
      user: mapUser(user),
      token: signAuthToken(authUser),
    });
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/therapists', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, full_name AS fullName, email
       FROM users
       WHERE role = 'therapist'
       ORDER BY created_at DESC`
    )
    .all();

  return res.json(rows);
});

router.post('/reset-password', (req, res) => {
  const { email, newPassword } = req.body || {};

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'email and newPassword are required' });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: 'newPassword must be at least 6 characters' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const passwordHash = bcrypt.hashSync(String(newPassword), 10);

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, user.id);

  return res.json({ message: 'Password reset successfully' });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

  if (!user || !user.password_hash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = bcrypt.compareSync(String(password), user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const authUser = {
    id: user.id,
    role: user.role,
    email: user.email,
    fullName: user.full_name,
  };

  return res.json({
    user: mapUser(user),
    token: signAuthToken(authUser),
  });
});

router.get('/me', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  if (!row) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(mapUser(row));
});

export default router;
