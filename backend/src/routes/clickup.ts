import { Router } from 'express';

export const clickupRouter = Router();

// Fase 4: implementar sincronização com o ClickUp
clickupRouter.get('/ping', (_req, res) => {
  res.json({ route: 'clickup', status: 'stub — implementado na Fase 4' });
});
