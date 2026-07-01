import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Tipos ────────────────────────────────────────────────────────────
export interface AISubtask {
  name: string;
}

export interface AITask {
  name: string;
  description: string;
  priority: 'alta' | 'media' | 'baixa';
  isOptional: boolean;
  dueDate: string | null; // "YYYY-MM-DD" ou null
  tags: string[];
  subtasks: string[];
}

export interface AIInterpretation {
  campaignName: string;
  objective: string;
  tasks: AITask[];
}

// ── Sanitização básica de input (evita injeção de prompt) ─────────────
function sanitizeBrief(text: string): string {
  return text
    .replace(/<\|/g, '') // remove delimitadores de sistema
    .replace(/\|>/g, '')
    .trim()
    .slice(0, 8000); // teto de caracteres
}

// ── System prompt ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Você é um gestor de projetos sênior especializado em campanhas de design e marketing.
Sua única tarefa é analisar o brief de campanha fornecido e devolver um JSON VÁLIDO — sem nenhum texto antes ou depois — com esta estrutura exata:

{
  "campaignName": "string",
  "objective": "string",
  "tasks": [
    {
      "name": "string",
      "description": "string",
      "priority": "alta | media | baixa",
      "isOptional": false,
      "dueDate": "YYYY-MM-DD ou null",
      "tags": ["string"],
      "subtasks": ["string"]
    }
  ]
}

REGRAS OBRIGATÓRIAS:
1. Detecte condicionais ("se der tempo", "se for possível", "seria bom ter", "idealmente", "talvez") → marque com isOptional: true e priority: "baixa".
2. Se uma data não for mencionada nem puder ser razoavelmente inferida, use dueDate: null. NUNCA invente datas.
3. Use priority "alta" quando o brief contiver palavras como "urgente", "o quanto antes", "prioridade máxima" ou uma data explícita próxima (≤7 dias).
4. Use priority "media" como padrão quando não houver indicação de urgência ou baixa prioridade.
5. NUNCA crie tarefas que não se desprendam diretamente do texto do brief.
6. As tags devem ser palavras-chave curtas relacionadas à tarefa (ex.: "design", "copy", "aprovação").
7. Subtasks devem ser strings simples com o nome da subtarefa.
8. O campo "objective" deve ser um resumo do objetivo central da campanha em 1-2 frases.
9. Devolva APENAS o JSON — sem markdown, sem bloco de código, sem explicações.`;

// ── Função principal ──────────────────────────────────────────────────
export async function interpretBrief(rawBrief: string): Promise<AIInterpretation> {
  const sanitized = sanitizeBrief(rawBrief);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analise o seguinte brief de campanha e devolva o JSON estruturado:\n\n${sanitized}`,
      },
    ],
  });

  // Extrair texto da resposta
  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('A API da Anthropic retornou um tipo de conteúdo inesperado.');
  }

  const raw = content.text.trim();

  // Tentar extrair JSON mesmo se vier com markdown acidental
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`A IA não retornou um JSON válido. Resposta recebida: ${raw.slice(0, 200)}`);
  }

  let parsed: AIInterpretation;
  try {
    parsed = JSON.parse(jsonMatch[0]) as AIInterpretation;
  } catch {
    throw new Error(`Falha ao fazer parse do JSON retornado pela IA: ${jsonMatch[0].slice(0, 200)}`);
  }

  // Validação mínima da estrutura
  if (!parsed.campaignName || !Array.isArray(parsed.tasks)) {
    throw new Error('O JSON retornado pela IA não tem a estrutura esperada (campaignName + tasks).');
  }

  // Normalizar prioridade para garantir valores válidos
  parsed.tasks = parsed.tasks.map((t) => ({
    ...t,
    priority: (['alta', 'media', 'baixa'].includes(t.priority) ? t.priority : 'media') as 'alta' | 'media' | 'baixa',
    tags: Array.isArray(t.tags) ? t.tags : [],
    subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
    isOptional: Boolean(t.isOptional),
    dueDate: t.dueDate ?? null,
  }));

  return parsed;
}
