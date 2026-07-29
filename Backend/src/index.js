import cors from 'cors';
import express from 'express';
import { optionalAuth, requireAuth } from './auth.js';
import { databasePath } from './db.js';
import authRouter from './routes/auth.js';
import messagesRouter from './routes/messages.js';
import moodsRouter from './routes/moods.js';
import therapyRouter from './routes/therapy.js';
import usersRouter from './routes/users.js';
import { runSeed } from './seed.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', databasePath });
});

app.get('/api/db/info', (_req, res) => {
  res.json({
    provider: 'sqlite',
    databasePath,
  });
});

app.use('/api/auth', authRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/therapy', requireAuth, therapyRouter);
app.use('/api/moods', optionalAuth, moodsRouter);
app.use('/api/messages', requireAuth, messagesRouter);

runSeed();

app.listen(PORT, () => {
  console.log(`Mood tracker API running on http://localhost:${PORT}`);
  console.log(`SQLite database: ${databasePath}`);
});
