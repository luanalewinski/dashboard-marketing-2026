import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export const tasksRouter = Router();
const prisma = new PrismaClient();

// ── PATCH /api/tasks/:id — editar uma tarefa (nome, desc, prioridade, data, opcional) ──
tasksRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, priority, isOptional, dueDate, tags } = req.body as {
      name?: string;
      description?: string;
      priority?: 'alta' | 'media' | 'baixa';
      isOptional?: boolean;
      dueDate?: string | null;
      tags?: string[];
    };

    if (priority && !['alta', 'media', 'baixa'].includes(priority)) {
      res.status(400).json({ error: 'Prioridade inválida. Use: alta | media | baixa' });
      return;
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(isOptional !== undefined && { isOptional }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(tags !== undefined && { tags: tags.join(',') }),
      },
      include: { subtasks: true },
    });

    res.json({ task });
  } catch (err) {
    console.error('[PATCH /api/tasks/:id]', err);
    res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
});

// ── DELETE /api/tasks/:id — remover tarefa ────────────────────────────
tasksRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.subtask.deleteMany({ where: { taskId: req.params.id } });
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/tasks/:id]', err);
    res.status(500).json({ error: 'Erro ao remover tarefa.' });
  }
});

// ── POST /api/tasks/:id/subtasks — adicionar subtarefa ───────────────
tasksRouter.post('/:id/subtasks', async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name?.trim()) {
      res.status(400).json({ error: 'Nome da subtarefa é obrigatório.' });
      return;
    }
    const subtask = await prisma.subtask.create({
      data: { taskId: req.params.id, name: name.trim() },
    });
    res.status(201).json({ subtask });
  } catch (err) {
    console.error('[POST /api/tasks/:id/subtasks]', err);
    res.status(500).json({ error: 'Erro ao adicionar subtarefa.' });
  }
});

// ── DELETE /api/tasks/subtasks/:subtaskId — remover subtarefa ────────
tasksRouter.delete('/subtasks/:subtaskId', async (req: Request, res: Response) => {
  try {
    await prisma.subtask.delete({ where: { id: req.params.subtaskId } });
    res.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/tasks/subtasks/:subtaskId]', err);
    res.status(500).json({ error: 'Erro ao remover subtarefa.' });
  }
});
