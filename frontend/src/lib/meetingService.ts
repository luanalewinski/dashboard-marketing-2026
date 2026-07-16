// ── Meeting Service — camada de abstração para processamento de transcrições ──
// Hoje: mock local que retorna estrutura fixa para demonstração.
// Futuro: trocar processMeeting() por chamada real à API (Anthropic, OpenAI, etc.)
//         sem alterar nenhum componente de UI.

export interface MeetingTask {
  title: string;
  responsible: string | null;
  deadline: string | null;
  priority: 'alta' | 'media' | 'baixa';
}

export interface MeetingEvent {
  title: string;
  date: string | null;
  type: string;
}

export interface MeetingResult {
  resumoExecutivo: string;
  decisoes: string[];
  tasks: MeetingTask[];
  proximosPassos: string[];
  eventos: MeetingEvent[];
  pontosDeAtencao: string[];
  duvidasPendentes: string[];
  ataFinal: string;
}

// Provedor configurável — substituir por 'anthropic' | 'openai' quando disponível
export type AIProvider = 'mock';

export interface ProcessOptions {
  provider?: AIProvider;
  context?: string; // contexto adicional (ex: "reunião de planejamento Q3")
}

export async function processMeeting(
  transcript: string,
  opts: ProcessOptions = {},
): Promise<MeetingResult> {
  const provider = opts.provider ?? 'mock';

  if (provider === 'mock') {
    return mockProcess(transcript);
  }

  // Ponto de extensão: adicionar provedores reais aqui
  // if (provider === 'anthropic') return anthropicProcess(transcript, opts);
  // if (provider === 'openai')    return openaiProcess(transcript, opts);

  throw new Error(`Provedor '${provider}' não suportado.`);
}

// ── Mock local — simula saída da IA com base no tamanho da transcrição ─────────
function mockProcess(transcript: string): MeetingResult {
  const words   = transcript.trim().split(/\s+/).length;
  const lines   = transcript.trim().split('\n').filter(Boolean).length;
  const preview = transcript.slice(0, 120).replace(/\n/g, ' ');

  return {
    resumoExecutivo:
      `Reunião com ${lines} tópicos discutidos (${words} palavras transcritas). ` +
      `Principais pontos abordaram alinhamento de sprint, prioridades de campanha e definição de próximos marcos. ` +
      `Contexto identificado: "${preview}…"`,

    decisoes: [
      'Aprovado o calendário de publicações para o Q3 2026.',
      'Definido prazo de entrega do KV principal para 18/07.',
      'Confirmada a identidade visual do evento Convenção 2026.',
      'Acordado que revisões passarão por aprovação via ClickUp antes de publicação.',
    ],

    tasks: [
      { title: 'Entregar KV principal campanha Q3',         responsible: 'Luana',   deadline: '18/07/2026', priority: 'alta'  },
      { title: 'Ajustar copy do carrossel conforme feedback', responsible: 'Douglas', deadline: '15/07/2026', priority: 'alta'  },
      { title: 'Montar deck de apresentação para gestão',   responsible: null,      deadline: null,         priority: 'media' },
      { title: 'Atualizar briefing das marcas no ClickUp',  responsible: 'Luana',   deadline: '16/07/2026', priority: 'media' },
      { title: 'Levantar referências para identidade 2026', responsible: null,      deadline: null,         priority: 'baixa' },
    ],

    proximosPassos: [
      'Validar materiais aprovados até quinta-feira.',
      'Agendar próxima reunião de acompanhamento para semana que vem.',
      'Compartilhar ata com toda a equipe via grupo de WhatsApp.',
      'Criar lista de tarefas no ClickUp com os itens definidos.',
    ],

    eventos: [
      { title: 'Convenção de Vendas 2026',  date: 'Agosto 2026',    type: 'Evento presencial' },
      { title: 'Black Friday',              date: 'Novembro 2026',  type: 'Campanha' },
      { title: 'Lançamento produto Q4',     date: 'Outubro 2026',   type: 'Lançamento' },
    ],

    pontosDeAtencao: [
      'Prazo apertado para entrega do KV — risco de não atender aprovação a tempo.',
      'Briefing de duas marcas ainda incompleto — pode travar produção.',
      'Alinhamento com equipe comercial pendente para campanha de conversão.',
    ],

    duvidasPendentes: [
      'Qual o orçamento disponível para mídia paga no Q3?',
      'A identidade da Convenção 2026 precisa de aprovação da diretoria?',
      'Haverá materiais impressos além do digital?',
    ],

    ataFinal:
`ATA DE REUNIÃO
Data: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
Participantes: Equipe de Marketing Nova Promotora

──────────────────────────────────────────────
RESUMO EXECUTIVO

Reunião de alinhamento de sprint com foco em entregas Q3 2026. Definidas prioridades, prazos e responsáveis para as principais campanhas das marcas. Equipe alinhada quanto ao fluxo de aprovação e uso do ClickUp como hub de acompanhamento.

──────────────────────────────────────────────
DECISÕES TOMADAS

• Calendário Q3 aprovado conforme apresentado.
• Prazo do KV principal: 18/07/2026 (Luana responsável).
• Identidade Convenção 2026 confirmada — seguir com produção.
• Aprovações obrigatoriamente registradas no ClickUp antes de publicação.

──────────────────────────────────────────────
TAREFAS DEFINIDAS

1. KV campanha Q3 — Luana — até 18/07 — ALTA PRIORIDADE
2. Ajuste de copy carrossel — Douglas — até 15/07 — ALTA PRIORIDADE
3. Deck de apresentação gestão — A definir — sem prazo — MÉDIA
4. Briefing das marcas no ClickUp — Luana — até 16/07 — MÉDIA
5. Referências identidade 2026 — A definir — sem prazo — BAIXA

──────────────────────────────────────────────
PRÓXIMOS PASSOS

• Validar materiais aprovados até quinta-feira.
• Agendar reunião de acompanhamento — próxima semana.
• Criar tasks no ClickUp com os itens desta ata.
• Distribuir ata para toda a equipe.

──────────────────────────────────────────────
PONTOS DE ATENÇÃO

⚠ Prazo apertado do KV — prioridade máxima.
⚠ Briefings incompletos podem travar a produção.
⚠ Alinhamento com equipe comercial ainda pendente.

──────────────────────────────────────────────
Documento gerado automaticamente pela plataforma I MKT · Nova Promotora`,
  };
}
