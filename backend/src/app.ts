import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { briefsRouter } from './routes/briefs';
import { tasksRouter } from './routes/tasks';
import { clickupRouter } from './routes/clickup';
import { productionRouter } from './routes/production';
import { dashboardRouter } from './routes/dashboard';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

// ── Health check ──────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rotas da API ──────────────────────────────────────────────────────
app.use('/api/briefs', briefsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/clickup', clickupRouter);
app.use('/api/production', productionRouter);
app.use('/api/dashboard', dashboardRouter);

// ── Handler global de erros ───────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

export { app };
