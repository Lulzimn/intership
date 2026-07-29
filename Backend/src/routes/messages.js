import { Router } from 'express';
import db from '../db.js';

const router = Router();

function isLinkedTherapistPatient(userA, userB) {
  const first = db.prepare('SELECT id, role FROM users WHERE id = ?').get(userA);
  const second = db.prepare('SELECT id, role FROM users WHERE id = ?').get(userB);

  if (!first || !second) {
    return false;
  }

  const therapistId = first.role === 'therapist' ? first.id : second.role === 'therapist' ? second.id : null;
  const patientId = first.role === 'patient' ? first.id : second.role === 'patient' ? second.id : null;

  if (!therapistId || !patientId) {
    return false;
  }

  const linked = db
    .prepare(
      `SELECT 1 FROM therapist_patient_links
       WHERE therapist_id = ? AND patient_id = ?`
    )
    .get(therapistId, patientId);

  return Boolean(linked);
}

router.post('/', (req, res) => {
  const { senderId, receiverId, body } = req.body || {};

  if (req.user.role !== 'admin' && senderId !== req.user.id) {
    return res.status(403).json({ error: 'You can only send messages as yourself' });
  }

  if (!Number.isInteger(senderId) || !Number.isInteger(receiverId)) {
    return res.status(400).json({ error: 'senderId and receiverId must be integers' });
  }

  if (!body || !String(body).trim()) {
    return res.status(400).json({ error: 'Message body is required' });
  }

  const sender = db.prepare('SELECT id FROM users WHERE id = ?').get(senderId);
  const receiver = db.prepare('SELECT id FROM users WHERE id = ?').get(receiverId);

  if (!sender || !receiver) {
    return res.status(404).json({ error: 'Sender or receiver not found' });
  }

  if (req.user.role !== 'admin' && !isLinkedTherapistPatient(senderId, receiverId)) {
    return res.status(403).json({ error: 'Messaging allowed only between linked therapist and patient' });
  }

  const result = db
    .prepare(
      `INSERT INTO messages (sender_id, receiver_id, body)
       VALUES (?, ?, ?)`
    )
    .run(senderId, receiverId, String(body).trim());

  const message = db
    .prepare(
      `SELECT
         id,
         sender_id AS senderId,
         receiver_id AS receiverId,
         body,
         sent_at AS sentAt,
         read_at AS readAt
       FROM messages
       WHERE id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json(message);
});

router.get('/conversation', (req, res) => {
  const userA = Number(req.query.userA);
  const userB = Number(req.query.userB);
  const limit = Number(req.query.limit || 100);

  if (!Number.isInteger(userA) || !Number.isInteger(userB)) {
    return res.status(400).json({ error: 'userA and userB query params must be integers' });
  }

    if (req.user.role !== 'admin' && req.user.id !== userA && req.user.id !== userB) {
      return res.status(403).json({ error: 'You can only view your own conversations' });
    }

    if (req.user.role !== 'admin' && !isLinkedTherapistPatient(userA, userB)) {
      return res.status(403).json({ error: 'Conversation is not allowed for unlinked users' });
    }

  const rows = db
    .prepare(
      `SELECT
         id,
         sender_id AS senderId,
         receiver_id AS receiverId,
         body,
         sent_at AS sentAt,
         read_at AS readAt
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY sent_at DESC
       LIMIT ?`
    )
    .all(userA, userB, userB, userA, Number.isInteger(limit) ? limit : 100);

  res.json(rows.reverse());
});

router.patch('/:id/read', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Message id must be an integer' });
  }

  const existing = db
    .prepare('SELECT id, receiver_id AS receiverId, sender_id AS senderId, read_at AS readAt FROM messages WHERE id = ?')
    .get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Message not found' });
  }

  if (req.user.role !== 'admin' && existing.receiverId !== req.user.id) {
    return res.status(403).json({ error: 'Only receiver can mark a message as read' });
  }

  const result = db
    .prepare(
      `UPDATE messages
       SET read_at = datetime('now')
       WHERE id = ? AND read_at IS NULL`
    )
    .run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Message not found or already read' });
  }

  const row = db
    .prepare(
      `SELECT
         id,
         sender_id AS senderId,
         receiver_id AS receiverId,
         body,
         sent_at AS sentAt,
         read_at AS readAt
       FROM messages
       WHERE id = ?`
    )
    .get(id);

  res.json(row);
});

export default router;
