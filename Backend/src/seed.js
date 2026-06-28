import bcrypt from 'bcryptjs';
import db, { databasePath } from './db.js';

function upsertUser(role, fullName, email, plainPassword) {
  const cleanEmail = String(email).trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);

  if (existing) {
    return existing.id;
  }

  const passwordHash = bcrypt.hashSync(String(plainPassword), 10);
  const result = db
    .prepare(
      `INSERT INTO users (role, full_name, email, password_hash)
       VALUES (?, ?, ?, ?)`
    )
    .run(role, fullName, cleanEmail, passwordHash);

  return Number(result.lastInsertRowid);
}

function ensureLink(therapistId, patientId) {
  db.prepare(
    `INSERT OR IGNORE INTO therapist_patient_links (therapist_id, patient_id)
     VALUES (?, ?)`
  ).run(therapistId, patientId);
}

function seedMood(patientId) {
  const date = new Date().toISOString().slice(0, 10);
  const existing = db
    .prepare('SELECT id FROM mood_entries WHERE patient_id = ? AND date = ?')
    .get(patientId, date);

  if (!existing) {
    db.prepare(
      `INSERT INTO mood_entries (patient_id, date, mood_score, tags, note)
       VALUES (?, ?, ?, ?, ?)`
    ).run(patientId, date, 7, JSON.stringify(['calm', 'hopeful']), 'Demo seeded mood entry');
  }
}

function seedMessage(senderId, receiverId, body) {
  const existing = db
    .prepare(
      `SELECT id FROM messages
       WHERE sender_id = ? AND receiver_id = ? AND body = ?`
    )
    .get(senderId, receiverId, body);

  if (!existing) {
    db.prepare(
      `INSERT INTO messages (sender_id, receiver_id, body)
       VALUES (?, ?, ?)`
    ).run(senderId, receiverId, body);
  }
}

function runSeed() {
  const therapistId = upsertUser('therapist', 'Demo Therapist', 'therapist@therapy.local', 'secret123');
  const patientId = upsertUser('patient', 'Demo Patient', 'patient@therapy.local', 'secret123');

  ensureLink(therapistId, patientId);
  seedMood(patientId);
  seedMessage(therapistId, patientId, 'Hello, how are you feeling today?');
  seedMessage(patientId, therapistId, 'I feel a bit better than yesterday.');

  console.log('Seed completed');
  console.log(`Database: ${databasePath}`);
  console.log('Therapist login: therapist@therapy.local / secret123');
  console.log('Patient login: patient@therapy.local / secret123');
}

runSeed();
