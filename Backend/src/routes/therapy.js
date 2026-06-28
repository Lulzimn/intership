import { Router } from 'express';
import db from '../db.js';

const router = Router();

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

export default router;
