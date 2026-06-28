import { Router } from 'express';
import db from '../db.js';

const router = Router();

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

function canAccessPatient(reqUser, patientId) {
  if (!Number.isInteger(patientId)) {
    return false;
  }

  if (!reqUser) {
    return false;
  }

  if (reqUser.role === 'admin') {
    return true;
  }

  if (reqUser.role === 'patient') {
    return reqUser.id === patientId;
  }

  if (reqUser.role === 'therapist') {
    return isTherapistLinkedToPatient(reqUser.id, patientId);
  }

  return false;
}

const parseEntry = (row) => ({
  id: row.id,
  patientId: row.patient_id ?? null,
  date: row.date,
  moodScore: row.mood_score,
  tags: JSON.parse(row.tags),
  note: row.note ?? '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.get('/', (req, res) => {
  const { limit = '30', patientId } = req.query;
  const safeLimit = Number(limit);
  const parsedPatientId = Number(patientId);

  if (Number.isInteger(parsedPatientId) && !canAccessPatient(req.user, parsedPatientId)) {
    return res.status(403).json({ error: 'Not allowed to view this patient moods' });
  }

  if (!Number.isInteger(parsedPatientId) && req.user?.role === 'patient') {
    return res.status(400).json({ error: 'patientId query is required for patient users' });
  }

  const rows = Number.isInteger(parsedPatientId)
    ? db
        .prepare(
          `SELECT * FROM mood_entries
           WHERE patient_id = ?
           ORDER BY date DESC
           LIMIT ?`
        )
        .all(parsedPatientId, safeLimit)
    : db
        .prepare(
          `SELECT * FROM mood_entries
           ORDER BY date DESC
           LIMIT ?`
        )
        .all(safeLimit);

  res.json(rows.map(parseEntry));
});

router.get('/:date', (req, res) => {
  const parsedPatientId = Number(req.query.patientId);

  if (Number.isInteger(parsedPatientId) && !canAccessPatient(req.user, parsedPatientId)) {
    return res.status(403).json({ error: 'Not allowed to view this patient mood entry' });
  }

  const row = Number.isInteger(parsedPatientId)
    ? db
        .prepare('SELECT * FROM mood_entries WHERE patient_id = ? AND date = ?')
        .get(parsedPatientId, req.params.date)
    : db
        .prepare('SELECT * FROM mood_entries WHERE patient_id IS NULL AND date = ?')
        .get(req.params.date);

  if (!row) {
    return res.status(404).json({ error: 'No mood entry for this date' });
  }

  res.json(parseEntry(row));
});

router.post('/', (req, res) => {
  const { date, patientId = null, moodScore, tags = [], note = '' } = req.body;

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
  }

  if (patientId !== null && !Number.isInteger(patientId)) {
    return res.status(400).json({ error: 'patientId must be an integer or null' });
  }

  if (Number.isInteger(patientId) && !canAccessPatient(req.user, patientId)) {
    return res.status(403).json({ error: 'Not allowed to create/update this patient mood entry' });
  }

  if (patientId === null && req.user?.role === 'patient') {
    return res.status(400).json({ error: 'patient users must submit patientId equal to their id' });
  }

  if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 10) {
    return res.status(400).json({ error: 'moodScore must be an integer between 1 and 10' });
  }

  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: 'tags must be an array of strings' });
  }

  const cleanTags = [...new Set(tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean))];

  const existing = patientId === null
    ? db.prepare('SELECT id FROM mood_entries WHERE patient_id IS NULL AND date = ?').get(date)
    : db.prepare('SELECT id FROM mood_entries WHERE patient_id = ? AND date = ?').get(patientId, date);

  if (patientId !== null) {
    const patient = db.prepare("SELECT id, role FROM users WHERE id = ? AND role = 'patient'").get(patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
  }

  if (existing) {
    if (patientId === null) {
      db.prepare(
        `UPDATE mood_entries
         SET mood_score = ?, tags = ?, note = ?, updated_at = datetime('now')
         WHERE patient_id IS NULL AND date = ?`
      ).run(moodScore, JSON.stringify(cleanTags), note || null, date);
    } else {
      db.prepare(
        `UPDATE mood_entries
         SET mood_score = ?, tags = ?, note = ?, updated_at = datetime('now')
         WHERE patient_id = ? AND date = ?`
      ).run(moodScore, JSON.stringify(cleanTags), note || null, patientId, date);
    }
  } else {
    db.prepare(
      `INSERT INTO mood_entries (patient_id, date, mood_score, tags, note)
       VALUES (?, ?, ?, ?, ?)`
    ).run(patientId, date, moodScore, JSON.stringify(cleanTags), note || null);
  }

  const row = patientId === null
    ? db.prepare('SELECT * FROM mood_entries WHERE patient_id IS NULL AND date = ?').get(date)
    : db.prepare('SELECT * FROM mood_entries WHERE patient_id = ? AND date = ?').get(patientId, date);
  res.status(existing ? 200 : 201).json(parseEntry(row));
});

router.delete('/:date', (req, res) => {
  const parsedPatientId = Number(req.query.patientId);

  if (Number.isInteger(parsedPatientId) && !canAccessPatient(req.user, parsedPatientId)) {
    return res.status(403).json({ error: 'Not allowed to delete this patient mood entry' });
  }

  if (!Number.isInteger(parsedPatientId) && req.user?.role === 'patient') {
    return res.status(400).json({ error: 'patientId query is required for patient users' });
  }

  const result = Number.isInteger(parsedPatientId)
    ? db.prepare('DELETE FROM mood_entries WHERE patient_id = ? AND date = ?').run(parsedPatientId, req.params.date)
    : db.prepare('DELETE FROM mood_entries WHERE patient_id IS NULL AND date = ?').run(req.params.date);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'No mood entry for this date' });
  }

  res.status(204).send();
});

export default router;
