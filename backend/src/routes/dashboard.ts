import { Router } from 'express';

export const dashboardRouter = Router();

// Fase 6: implementar endpoints agregados para métricas
dashboardRouter.get('/ping', (_req, res) => {
  res.json({ route: 'dashboard', status: 'stub — implementado na Fase 6' });
});
