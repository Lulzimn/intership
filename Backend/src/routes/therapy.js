import { Router } from 'express';
import db from '../db.js';

const router = Router();

const GOAL_TYPES = new Set(['breathing', 'meditation', 'sleep', 'hydration']);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isYesterdayDate(previousDate, currentDate) {
  const previous = new Date(`${previousDate}T12:00:00Z`);
  const current = new Date(`${currentDate}T12:00:00Z`);
  const diffDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function parseGoal(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    ownerFullName: row.owner_full_name ?? '',
    goalType: row.goal_type,
    title: row.title,
    description: row.description ?? '',
    reminderTime: row.reminder_time ?? '',
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastCompletedDate: row.last_completed_date,
    completedToday: row.completed_today === 1,
    completionCount: row.completion_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isTherapistLinkedToPatient(therapistId, patientId) {
  const linked = db
    .prepare(
      `SELECT 1
       FROM therapist_patient_links
       WHERE therapist_id = ? AND patient_id = ?`
    )
    .get(therapistId, patientId);

  return Boolean(linked);
}

function canTherapistManagePatient(reqUser, patientId) {
  if (reqUser.role === 'admin') {
    return true;
  }

  if (reqUser.role === 'therapist') {
    return isTherapistLinkedToPatient(reqUser.id, patientId);
  }

  return false;
}

router.post('/assign', (req, res) => {
  if (!['therapist', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only therapist or admin can assign links' });
  }

  const { therapistId, patientId } = req.body || {};

  if (!Number.isInteger(therapistId) || !Number.isInteger(patientId)) {
    return res.status(400).json({ error: 'therapistId and patientId must be integers' });
  }

  const therapist = db.prepare('SELECT id, role FROM users WHERE id = ?').get(therapistId);
  const patient = db.prepare('SELECT id, role FROM users WHERE id = ?').get(patientId);

  if (!therapist || therapist.role !== 'therapist') {
    return res.status(404).json({ error: 'Therapist not found' });
  }

  if (!patient || patient.role !== 'patient') {
    return res.status(404).json({ error: 'Patient not found' });
  }

  if (req.user.role === 'therapist' && therapistId !== req.user.id) {
    return res.status(403).json({ error: 'Therapist can only assign their own patients' });
  }

  db.prepare(
    `INSERT OR IGNORE INTO therapist_patient_links (therapist_id, patient_id)
     VALUES (?, ?)`
  ).run(therapistId, patientId);

  res.status(201).json({ therapistId, patientId, linked: true });
});

router.get('/therapist/:therapistId/patients', (req, res) => {
  const therapistId = Number(req.params.therapistId);

  if (!Number.isInteger(therapistId)) {
    return res.status(400).json({ error: 'therapistId must be an integer' });
  }

    if (req.user.role === 'therapist' && therapistId !== req.user.id) {
      return res.status(403).json({ error: 'Therapist can only view their own patients' });
    }

    if (req.user.role === 'patient') {
      return res.status(403).json({ error: 'Patients cannot access therapist patient lists' });
    }

  const rows = db
    .prepare(
      `SELECT u.id, u.full_name AS fullName, u.email, l.created_at AS linkedAt
       FROM therapist_patient_links l
       JOIN users u ON u.id = l.patient_id
       WHERE l.therapist_id = ?
       ORDER BY l.created_at DESC`
    )
    .all(therapistId);

  res.json(rows);
});

router.get('/patient/:patientId/therapists', (req, res) => {
  const patientId = Number(req.params.patientId);

  if (!Number.isInteger(patientId)) {
    return res.status(400).json({ error: 'patientId must be an integer' });
  }

    if (req.user.role === 'patient' && patientId !== req.user.id) {
      return res.status(403).json({ error: 'Patient can only view their own therapists' });
    }

    if (req.user.role === 'therapist') {
      const linked = db
        .prepare(
          `SELECT 1 FROM therapist_patient_links
           WHERE therapist_id = ? AND patient_id = ?`
        )
        .get(req.user.id, patientId);

      if (!linked) {
        return res.status(403).json({ error: 'Therapist is not linked to this patient' });
      }
    }

  const rows = db
    .prepare(
      `SELECT u.id, u.full_name AS fullName, u.email, l.created_at AS linkedAt
       FROM therapist_patient_links l
       JOIN users u ON u.id = l.therapist_id
       WHERE l.patient_id = ?
       ORDER BY l.created_at DESC`
    )
    .all(patientId);

  res.json(rows);
});

router.get('/my/contacts', (req, res) => {
  if (req.user.role === 'therapist') {
    const rows = db
      .prepare(
        `SELECT u.id, u.full_name AS fullName, u.email, u.role, l.created_at AS linkedAt
         FROM therapist_patient_links l
         JOIN users u ON u.id = l.patient_id
         WHERE l.therapist_id = ?
         ORDER BY l.created_at DESC`
      )
      .all(req.user.id);

    return res.json(rows);
  }

  if (req.user.role === 'patient') {
    const rows = db
      .prepare(
        `SELECT u.id, u.full_name AS fullName, u.email, u.role, l.created_at AS linkedAt
         FROM therapist_patient_links l
         JOIN users u ON u.id = l.therapist_id
         WHERE l.patient_id = ?
         ORDER BY l.created_at DESC`
      )
      .all(req.user.id);

    return res.json(rows);
  }

  if (req.user.role === 'admin') {
    const rows = db
      .prepare(
        `SELECT
           l.therapist_id AS therapistId,
           t.full_name AS therapistName,
           l.patient_id AS patientId,
           p.full_name AS patientName,
           l.created_at AS linkedAt
         FROM therapist_patient_links l
         JOIN users t ON t.id = l.therapist_id
         JOIN users p ON p.id = l.patient_id
         ORDER BY l.created_at DESC`
      )
      .all();

    return res.json(rows);
  }

  return res.json([]);
});

router.get('/goals', (req, res) => {
  const parsedPatientId = Number(req.query.patientId);
  const hasPatientId = Number.isInteger(parsedPatientId);

  let targetUserId = req.user.id;

  if (hasPatientId) {
    if (req.user.role === 'patient' && parsedPatientId !== req.user.id) {
      return res.status(403).json({ error: 'Patient can only view their own goals' });
    }

    if (['therapist', 'admin'].includes(req.user.role)) {
      const patient = db.prepare("SELECT id, role FROM users WHERE id = ? AND role = 'patient'").get(parsedPatientId);

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      if (!canTherapistManagePatient(req.user, parsedPatientId)) {
        return res.status(403).json({ error: 'Not allowed to manage this patient goals' });
      }
    }

    targetUserId = parsedPatientId;
  }

  const rows = db
    .prepare(
      `SELECT
         g.*,
         u.full_name AS owner_full_name,
         COUNT(c.id) AS completion_count,
         EXISTS(
           SELECT 1
           FROM therapy_goal_completions c2
           WHERE c2.goal_id = g.id AND c2.completed_date = ?
         ) AS completed_today
       FROM therapy_goals g
       JOIN users u ON u.id = g.user_id
       LEFT JOIN therapy_goal_completions c ON c.goal_id = g.id
       WHERE g.user_id = ?
       GROUP BY g.id
       ORDER BY g.created_at DESC, g.id DESC`
    )
    .all(todayISO(), targetUserId);

  res.json(rows.map(parseGoal));
});

router.post('/goals', (req, res) => {
  const { goalType, title, description = '', reminderTime = '', patientId } = req.body || {};

  if (!GOAL_TYPES.has(goalType)) {
    return res.status(400).json({ error: 'goalType must be breathing, meditation, sleep, or hydration' });
  }

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  if (description !== '' && typeof description !== 'string') {
    return res.status(400).json({ error: 'description must be a string' });
  }

  if (reminderTime !== '' && typeof reminderTime !== 'string') {
    return res.status(400).json({ error: 'reminderTime must be a string' });
  }

  let targetUserId = req.user.id;

  if (Number.isInteger(patientId)) {
    if (req.user.role === 'patient' && patientId !== req.user.id) {
      return res.status(403).json({ error: 'Patient can only create their own goals' });
    }

    if (['therapist', 'admin'].includes(req.user.role)) {
      const patient = db.prepare("SELECT id, role FROM users WHERE id = ? AND role = 'patient'").get(patientId);

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      if (!canTherapistManagePatient(req.user, patientId)) {
        return res.status(403).json({ error: 'Not allowed to manage this patient goals' });
      }

      targetUserId = patientId;
    }
  }

  const result = db
    .prepare(
      `INSERT INTO therapy_goals (user_id, goal_type, title, description, reminder_time)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(targetUserId, goalType, title.trim(), description.trim() || null, reminderTime.trim() || null);

  const row = db
    .prepare(
      `SELECT g.*, u.full_name AS owner_full_name
       FROM therapy_goals g
       JOIN users u ON u.id = g.user_id
       WHERE g.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json({ ...parseGoal({ ...row, completion_count: 0, completed_today: 0 }) });
});

router.post('/goals/:goalId/complete', (req, res) => {
  const goalId = Number(req.params.goalId);

  if (!Number.isInteger(goalId)) {
    return res.status(400).json({ error: 'goalId must be an integer' });
  }

  const goal = db.prepare('SELECT * FROM therapy_goals WHERE id = ?').get(goalId);

  if (!goal) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  if (req.user.role === 'patient' && goal.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Patients can only complete their own goals' });
  }

  if (req.user.role === 'therapist') {
    return res.status(403).json({ error: 'Therapists cannot complete patient goals' });
  }

  const completedDate = todayISO();
  const existingCompletion = db
    .prepare('SELECT id FROM therapy_goal_completions WHERE goal_id = ? AND completed_date = ?')
    .get(goalId, completedDate);

  if (!existingCompletion) {
    db.prepare(
      'INSERT INTO therapy_goal_completions (goal_id, completed_date) VALUES (?, ?)'
    ).run(goalId, completedDate);

    const currentStreak = goal.last_completed_date && isYesterdayDate(goal.last_completed_date, completedDate)
      ? goal.current_streak + 1
      : 1;
    const longestStreak = Math.max(goal.longest_streak, currentStreak);

    db.prepare(
      `UPDATE therapy_goals
       SET current_streak = ?, longest_streak = ?, last_completed_date = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(currentStreak, longestStreak, completedDate, goalId);
  }

  const row = db
    .prepare(
      `SELECT
         g.*,
         u.full_name AS owner_full_name,
         COUNT(c.id) AS completion_count,
         EXISTS(
           SELECT 1
           FROM therapy_goal_completions c2
           WHERE c2.goal_id = g.id AND c2.completed_date = ?
         ) AS completed_today
       FROM therapy_goals g
       JOIN users u ON u.id = g.user_id
       LEFT JOIN therapy_goal_completions c ON c.goal_id = g.id
       WHERE g.id = ?
       GROUP BY g.id`
    )
    .get(completedDate, goalId);

  res.json(parseGoal(row));
});

export default router;
