import { Router } from 'express';

export const productionRouter = Router();

// Fase 5: implementar registro de modo de produção e tempo economizado
productionRouter.get('/ping', (_req, res) => {
  res.json({ route: 'production', status: 'stub — implementado na Fase 5' });
});
