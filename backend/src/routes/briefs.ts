import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { interpretBrief } from '../services/aiInterpreter';

export const briefsRouter = Router();
const prisma = new PrismaClient();

// ── POST /api/briefs — salvar um novo brief ───────────────────────────
briefsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { rawBrief, sourceType = 'text' } = req.body as {
      rawBrief?: string;
      sourceType?: string;
    };

    if (!rawBrief || rawBrief.trim().length < 10) {
      res.status(400).json({ error: 'O brief precisa ter pelo menos 10 caracteres.' });
      return;
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: 'Campanha sem nome', // será atualizado após interpretação
        rawBrief: rawBrief.trim(),
        sourceType: sourceType === 'audio' ? 'audio' : 'text',
        status: 'draft',
      },
    });

    res.status(201).json({ campaign });
  } catch (err) {
    console.error('[POST /api/briefs]', err);
    res.status(500).json({ error: 'Erro ao salvar o brief.' });
  }
});

// ── GET /api/briefs — listar campanhas ───────────────────────────────
briefsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tasks: { select: { id: true, status: true } } },
    });
    res.json({ campaigns });
  } catch (err) {
    console.error('[GET /api/briefs]', err);
    res.status(500).json({ error: 'Erro ao listar campanhas.' });
  }
});

// ── GET /api/briefs/:id — buscar campanha com tarefas ────────────────
briefsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: {
          include: { subtasks: true, production: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campanha não encontrada.' });
      return;
    }

    res.json({ campaign });
  } catch (err) {
    console.error('[GET /api/briefs/:id]', err);
    res.status(500).json({ error: 'Erro ao buscar campanha.' });
  }
});

// ── POST /api/briefs/:id/interpret — IA interpreta e cria tarefas ────
briefsRouter.post('/:id/interpret', async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campanha não encontrada.' });
      return;
    }

    // Chamar a IA
    const interpretation = await interpretBrief(campaign.rawBrief);

    // Atualizar nome e objetivo da campanha
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        name: interpretation.campaignName,
        objective: interpretation.objective,
        status: 'draft',
      },
    });

    // Apagar tarefas anteriores (reinterpretação)
    await prisma.subtask.deleteMany({
      where: { task: { campaignId: campaign.id } },
    });
    await prisma.task.deleteMany({
      where: { campaignId: campaign.id },
    });

    // Criar as tarefas + subtarefas retornadas pela IA
    const createdTasks = await Promise.all(
      interpretation.tasks.map(async (aiTask) => {
        const task = await prisma.task.create({
          data: {
            campaignId: campaign.id,
            name: aiTask.name,
            description: aiTask.description,
            priority: aiTask.priority,
            isOptional: aiTask.isOptional,
            dueDate: aiTask.dueDate ? new Date(aiTask.dueDate) : null,
            tags: aiTask.tags.join(','),
            status: 'pending',
            subtasks: {
              create: aiTask.subtasks.map((name) => ({ name })),
            },
          },
          include: { subtasks: true },
        });
        return task;
      })
    );

    res.json({
      campaign: { ...campaign, name: interpretation.campaignName, objective: interpretation.objective },
      tasks: createdTasks,
      interpretation,
    });
  } catch (err: unknown) {
    console.error('[POST /api/briefs/:id/interpret]', err);
    const message = err instanceof Error ? err.message : 'Erro ao interpretar o brief com IA.';
    res.status(500).json({ error: message });
  }
});
