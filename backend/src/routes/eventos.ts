import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ── GET /api/eventos — listar todos com contagem de edições ───────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const eventos = await prisma.evento.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        editions: {
          orderBy: { year: 'desc' },
          include: {
            checklist: true,
            links: true,
          },
        },
      },
    });
    res.json({ eventos });
  } catch (err) {
    console.error('[eventos] GET /', err);
    res.status(500).json({ error: 'Erro ao listar eventos' });
  }
});

// ── POST /api/eventos — criar evento ─────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, category, isRecurring } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const evento = await prisma.evento.create({
      data: { name, description, category, isRecurring: isRecurring ?? true },
    });
    res.status(201).json({ evento });
  } catch (err) {
    console.error('[eventos] POST /', err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

// ── GET /api/eventos/:id — detalhe com edições ────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const evento = await prisma.evento.findUnique({
      where: { id: req.params.id },
      include: {
        editions: {
          orderBy: { year: 'desc' },
          include: { checklist: { orderBy: { order: 'asc' } }, links: true },
        },
      },
    });
    if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });
    res.json({ evento });
  } catch (err) {
    console.error('[eventos] GET /:id', err);
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
});

// ── GET /api/eventos/:id/:year — edição específica ────────────────────
router.get('/:id/:year', async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.params.year);
    if (isNaN(year)) return res.status(400).json({ error: 'Ano inválido' });
    const edicao = await prisma.eventoEdicao.findUnique({
      where: { eventoId_year: { eventoId: req.params.id, year } },
      include: {
        evento: true,
        checklist: { orderBy: { order: 'asc' } },
        links: true,
      },
    });
    if (!edicao) return res.status(404).json({ error: 'Edição não encontrada' });
    res.json({ edicao });
  } catch (err) {
    console.error('[eventos] GET /:id/:year', err);
    res.status(500).json({ error: 'Erro ao buscar edição' });
  }
});

// ── POST /api/eventos/:id/edicoes — nova edição ───────────────────────
router.post('/:id/edicoes', async (req: Request, res: Response) => {
  try {
    const { year } = req.body;
    if (!year) return res.status(400).json({ error: 'Ano é obrigatório' });
    const edicao = await prisma.eventoEdicao.create({
      data: { eventoId: req.params.id, year: parseInt(year) },
      include: { checklist: true, links: true },
    });
    res.status(201).json({ edicao });
  } catch (err: unknown) {
    console.error('[eventos] POST /:id/edicoes', err);
    const msg = (err as { code?: string }).code === 'P2002'
      ? `Edição ${req.body.year} já existe para este evento`
      : 'Erro ao criar edição';
    res.status(400).json({ error: msg });
  }
});

// ── PATCH /api/eventos/edicoes/:edicaoId — atualizar edição ──────────
router.patch('/edicoes/:edicaoId', async (req: Request, res: Response) => {
  try {
    const { status, notes, clickupListId } = req.body;
    const edicao = await prisma.eventoEdicao.update({
      where: { id: req.params.edicaoId },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(clickupListId !== undefined && { clickupListId }),
      },
      include: { checklist: { orderBy: { order: 'asc' } }, links: true },
    });
    res.json({ edicao });
  } catch (err) {
    console.error('[eventos] PATCH /edicoes/:edicaoId', err);
    res.status(500).json({ error: 'Erro ao atualizar edição' });
  }
});

// ── POST /api/eventos/edicoes/:edicaoId/checklist — adicionar item ────
router.post('/edicoes/:edicaoId/checklist', async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const count = await prisma.eventoChecklistItem.count({
      where: { edicaoId: req.params.edicaoId },
    });
    const item = await prisma.eventoChecklistItem.create({
      data: { edicaoId: req.params.edicaoId, name, category, order: count },
    });
    res.status(201).json({ item });
  } catch (err) {
    console.error('[eventos] POST /edicoes/:edicaoId/checklist', err);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

// ── PATCH /api/eventos/checklist/:itemId — marcar done / editar ───────
router.patch('/checklist/:itemId', async (req: Request, res: Response) => {
  try {
    const { done, name, category } = req.body;
    const item = await prisma.eventoChecklistItem.update({
      where: { id: req.params.itemId },
      data: {
        ...(done !== undefined && { done }),
        ...(name && { name }),
        ...(category !== undefined && { category }),
      },
    });
    res.json({ item });
  } catch (err) {
    console.error('[eventos] PATCH /checklist/:itemId', err);
    res.status(500).json({ error: 'Erro ao atualizar item' });
  }
});

// ── DELETE /api/eventos/checklist/:itemId ─────────────────────────────
router.delete('/checklist/:itemId', async (req: Request, res: Response) => {
  try {
    await prisma.eventoChecklistItem.delete({ where: { id: req.params.itemId } });
    res.json({ ok: true });
  } catch (err) {
    console.error('[eventos] DELETE /checklist/:itemId', err);
    res.status(500).json({ error: 'Erro ao remover item' });
  }
});

// ── POST /api/eventos/edicoes/:edicaoId/links — adicionar link ────────
router.post('/edicoes/:edicaoId/links', async (req: Request, res: Response) => {
  try {
    const { type, label, url } = req.body;
    if (!type || !label || !url) return res.status(400).json({ error: 'type, label e url são obrigatórios' });
    const link = await prisma.eventoLink.create({
      data: { edicaoId: req.params.edicaoId, type, label, url },
    });
    res.status(201).json({ link });
  } catch (err) {
    console.error('[eventos] POST /edicoes/:edicaoId/links', err);
    res.status(500).json({ error: 'Erro ao adicionar link' });
  }
});

// ── DELETE /api/eventos/links/:linkId ────────────────────────────────
router.delete('/links/:linkId', async (req: Request, res: Response) => {
  try {
    await prisma.eventoLink.delete({ where: { id: req.params.linkId } });
    res.json({ ok: true });
  } catch (err) {
    console.error('[eventos] DELETE /links/:linkId', err);
    res.status(500).json({ error: 'Erro ao remover link' });
  }
});

// ── POST /api/eventos/edicoes/:edicaoId/copiar-checklist/:fromYear ────
router.post('/edicoes/:edicaoId/copiar-checklist/:fromYear', async (req: Request, res: Response) => {
  try {
    const destEdicao = await prisma.eventoEdicao.findUnique({
      where: { id: req.params.edicaoId },
    });
    if (!destEdicao) return res.status(404).json({ error: 'Edição destino não encontrada' });

    const fromYear = parseInt(req.params.fromYear);
    const srcEdicao = await prisma.eventoEdicao.findUnique({
      where: { eventoId_year: { eventoId: destEdicao.eventoId, year: fromYear } },
      include: { checklist: { orderBy: { order: 'asc' } } },
    });
    if (!srcEdicao) return res.status(404).json({ error: 'Edição origem não encontrada' });

    const items = await prisma.$transaction(
      srcEdicao.checklist.map((item, i) =>
        prisma.eventoChecklistItem.create({
          data: {
            edicaoId: req.params.edicaoId,
            name: item.name,
            category: item.category,
            done: false,
            order: i,
          },
        })
      )
    );
    res.status(201).json({ copied: items.length, items });
  } catch (err) {
    console.error('[eventos] POST copiar-checklist', err);
    res.status(500).json({ error: 'Erro ao copiar checklist' });
  }
});

export { router as eventosRouter };
