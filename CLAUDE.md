# CLAUDE.md — Sistema de Captura de Campanhas com IA + ClickUp

> Este arquivo é para o Claude Code. Ele descreve o sistema completo, o que já foi construído e o que falta implementar. Continue exatamente de onde parou, sem alterar o que já existe.

---

## 0. Contexto do projeto

Aplicação web local para uma equipe de design/marketing da Nova Promotora. Fluxo:

1. Designer cola o brief de uma campanha (texto livre).
2. IA (claude-sonnet-4-6) segmenta em tarefas e subtarefas priorizadas.
3. Designer revisa e edita a proposta.
4. Tarefas confirmadas são sincronizadas com o ClickUp via API oficial.
5. Ao encerrar cada tarefa, registra-se modo de produção (IA / híbrido / manual) e tempo economizado.
6. Dashboard exibe métricas agregadas.

---

## 1. Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express 4 + TypeScript |
| Banco | SQLite via Prisma ORM |
| IA | Anthropic API — modelo `claude-sonnet-4-6` |
| Integração | ClickUp API v2 (Personal API Token) |
| Transcrição (Fase 7) | OpenAI Whisper (`whisper-1`) |
| Ícones (frontend) | **SOMENTE lucide-react** — nenhum outro pacote de ícones |
| Gráficos (frontend) | **Recharts** — sempre azul `#3D7BFF` |
| Fonte | **Sora** (400/500/600/700) — única fonte permitida |

---

## 2. Estrutura de pastas

```
campaign-system/
├── CLAUDE.md                        ← este arquivo
├── README.md
├── .gitignore
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts                   ✅ pronto
│       ├── server.ts                ✅ pronto
│       ├── prisma/
│       │   └── schema.prisma        ✅ pronto
│       ├── routes/
│       │   ├── briefs.ts            ✅ pronto (Fase 2)
│       │   ├── tasks.ts             ✅ pronto (Fase 2)
│       │   ├── clickup.ts           🔜 stub — implementar Fase 4
│       │   ├── production.ts        🔜 stub — implementar Fase 5
│       │   └── dashboard.ts         🔜 stub — implementar Fase 6
│       └── services/
│           ├── aiInterpreter.ts     ✅ pronto (Fase 2)
│           ├── clickupClient.ts     🔜 stub — implementar Fase 4
│           └── transcription.ts    🔜 stub — implementar Fase 7
└── frontend/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── postcss.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.tsx                 ✅ pronto
        ├── App.tsx                  ✅ pronto
        ├── index.css                ✅ pronto (Nova DS tokens)
        ├── api/
        │   └── client.ts            ✅ pronto (todos os tipos + chamadas)
        ├── components/
        │   └── Layout.tsx           ✅ pronto (sidebar + topbar Nova DS)
        └── pages/
            ├── BriefCapture.tsx     ✅ pronto (Fase 3)
            ├── TaskReview.tsx       ✅ pronto (Fase 3)
            ├── SyncConfirmation.tsx 🔜 stub — implementar Fase 4
            ├── TaskClose.tsx        🔜 stub — implementar Fase 5
            └── Dashboard.tsx        🔜 stub — implementar Fase 6
```

---

## 3. Modelo de dados (Prisma — já migrado)

```prisma
model Campaign {
  id            String   @id @default(cuid())
  name          String
  objective     String?
  sourceType    String   // "text" | "audio"
  rawBrief      String
  status        String   @default("draft") // draft | reviewed | synced
  clickupListId String?
  createdAt     DateTime @default(now())
  tasks         Task[]
}

model Task {
  id            String        @id @default(cuid())
  campaignId    String
  campaign      Campaign      @relation(fields: [campaignId], references: [id])
  name          String
  description   String?
  priority      String        // "alta" | "media" | "baixa"
  isOptional    Boolean       @default(false)
  dueDate       DateTime?
  tags          String?       // CSV simples: "design,copy,aprovação"
  clickupTaskId String?
  status        String        @default("pending") // pending | synced | closed
  subtasks      Subtask[]
  production    ProductionLog?
}

model Subtask {
  id     String @id @default(cuid())
  taskId String
  task   Task   @relation(fields: [taskId], references: [id])
  name   String
  status String @default("pending")
}

model ProductionLog {
  id                    String   @id @default(cuid())
  taskId                String   @unique
  task                  Task     @relation(fields: [taskId], references: [id])
  mode                  String   // "ia" | "hibrido" | "manual"
  estimatedSavedMinutes Int      @default(0)
  actualMinutes         Int?
  closedAt              DateTime @default(now())
}
```

O `schema.prisma` fica em `backend/src/prisma/schema.prisma`. O `package.json` do backend já tem `"prisma": { "schema": "src/prisma/schema.prisma" }`.

---

## 4. Variáveis de ambiente

Arquivo: `backend/.env` (nunca commitado — já está no `.gitignore`).
Modelo em `backend/.env.example`:

```
ANTHROPIC_API_KEY=        # obrigatório desde a Fase 2
CLICKUP_API_TOKEN=        # obrigatório na Fase 4
CLICKUP_SPACE_ID=         # obrigatório na Fase 4
CLICKUP_LIST_ID=          # opcional — criado automaticamente se vazio
OPENAI_API_KEY=           # opcional — só para Fase 7 (Whisper)
PORT=4000
DATABASE_URL="file:./dev.db"
```

---

## 5. Como rodar

```bash
# Backend
cd backend
npm install
cp .env.example .env      # preencher as keys reais
npx prisma migrate dev --name init
npm run dev               # http://localhost:4000

# Verificar
curl http://localhost:4000/health
# → {"status":"ok","timestamp":"..."}

# Frontend (outro terminal)
cd frontend
npm install
npm run dev               # http://localhost:5173
```

---

## 6. Endpoints implementados (Fases 1–3)

### Backend

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/briefs` | Criar campanha com brief bruto |
| GET | `/api/briefs` | Listar campanhas |
| GET | `/api/briefs/:id` | Buscar campanha + tarefas + subtarefas |
| POST | `/api/briefs/:id/interpret` | Acionar IA e salvar tarefas no banco |
| PATCH | `/api/tasks/:id` | Editar tarefa (nome, desc, prioridade, data, tags, opcional) |
| DELETE | `/api/tasks/:id` | Remover tarefa |
| POST | `/api/tasks/:id/subtasks` | Adicionar subtarefa |
| DELETE | `/api/tasks/subtasks/:subtaskId` | Remover subtarefa |

### Frontend

| Rota | Página | Status |
|---|---|---|
| `/` | BriefCapture | ✅ |
| `/review/:campaignId` | TaskReview | ✅ |
| `/sync/:campaignId` | SyncConfirmation | 🔜 Fase 4 |
| `/close/:taskId` | TaskClose | 🔜 Fase 5 |
| `/dashboard` | Dashboard | 🔜 Fase 6 |

---

## 7. Nova Design System — regras obrigatórias

**Todo código de frontend novo deve seguir estas regras sem exceção.**

### Tokens CSS (já definidos em `frontend/src/index.css`)

```css
/* Dark (padrão) */
--nova-bg: #080B12
--nova-bg-elev: #0E1421
--nova-bg-elev-2: #1A2B40
--nova-border: #22304A
--nova-blue: #3D7BFF
--nova-red: #CF190F
--nova-text: #EEF2F8
--nova-text-muted: #9AA6BA
--nova-text-dim: #5D6880
--glass: rgba(255,255,255,.05)
--glass-brd: rgba(255,255,255,.10)
--c-success: #4ADE80
--c-warning: #FBBF24
--c-danger: #FF6B6B
--c-info: #6F9BFF

/* Light (classe .light no <html>) */
--nova-bg: #EEF1F7
--nova-bg-elev: #FFFFFF
--nova-blue: #2B62D6
--nova-text: #10182A
/* ... (ver index.css completo) */
```

### Glassmorphism (padrão para todos os cards/painéis)

```css
background: var(--glass);
border: 1px solid var(--glass-brd);
backdrop-filter: blur(18px) saturate(120%);
border-radius: 1.125rem; /* ou 18-20px */
```

Hover: `background: var(--glass-hover)` + `transform: translateY(-2px)` + sombra suave.

### Botões (usar as classes já definidas em `index.css`)

| Classe | Uso |
|---|---|
| `.btn-primary` | CTA padrão — glass neutro |
| `.btn-blue` | Ação confirmação — azul com borda |
| `.btn-red` | Ação destrutiva — vermelho com borda |
| `.btn-ghost` | Ação secundária — transparente |

**Nunca** usar degradê em botões. **Nunca** usar cor fora dos tokens.

### Inputs

Usar classes `.nova-input` e `.nova-textarea` já definidas em `index.css`.

### Badges

| Classe | Uso |
|---|---|
| `.badge-alta` | Prioridade alta (vermelho) |
| `.badge-media` | Prioridade média (amarelo) |
| `.badge-baixa` | Prioridade baixa (azul claro) |
| `.badge-synced` | Status sincronizado (verde) |
| `.badge-optional` | Tarefa opcional (neutro) |

### Tipografia

- Fonte: **Sora** (já importada no `index.css`)
- H1: 22–28px / 700
- H2: 18–22px / 600
- Body: 15px / 400
- Caption: 11–13px / 500 uppercase

### Proibido

- Degradê em botões
- Ícones que não sejam `lucide-react`
- Gráficos que não sejam Recharts
- Cores fora dos tokens (roxo, laranja, neon)
- Texto branco em fundo claro
- Bordas pretas (usar `var(--nova-border)`)

### Acessibilidade

- Tema dark/light alternável (botão no topbar do Layout — já implementado)
- Escala A/A+/A++ via `font-size` no `<html>` (já implementado no Layout)
- Tudo em `rem`/`em` — nunca `px` fixo para fontes
- `focus-visible` com `outline: 2px solid var(--nova-blue)`

---

## 8. Lógica de IA (já implementada — não alterar)

Arquivo: `backend/src/services/aiInterpreter.ts`

- Modelo: `claude-sonnet-4-6`
- O system prompt força JSON puro sem markdown
- Detecta condicionais → `isOptional: true`, `priority: "baixa"`
- Detecta urgência → `priority: "alta"`
- `dueDate: null` quando não mencionado — nunca inventa datas
- Sanitiza o input (remove delimitadores, limita a 8.000 chars)
- Faz parse defensivo com extração de JSON via regex
- Normaliza valores de `priority` para garantir `alta | media | baixa`

---

## 9. Fases pendentes — o que implementar

### Fase 4 — Integração com o ClickUp

**⚠️ IMPORTANTE: antes de executar qualquer sync real, confirmar com o usuário que está usando um Space de TESTES no ClickUp, não o de produção.**

**Arquivos a implementar:**
- `backend/src/services/clickupClient.ts`
- `backend/src/routes/clickup.ts`
- `frontend/src/pages/SyncConfirmation.tsx`

**Endpoint:** `POST /api/clickup/sync/:campaignId`

Lógica:
1. Se a campanha não tiver `clickupListId`, criar uma Lista nova no `CLICKUP_SPACE_ID` via `POST /api/v2/space/{space_id}/list`.
2. Para cada `Task` com status `pending`:
   - Criar via `POST /api/v2/list/{list_id}/task` com `name`, `description`, `priority` (mapeamento: alta=1, media=3, baixa=4), e `due_date` (Unix ms) se existir.
   - Salvar o `id` retornado em `clickupTaskId`.
   - Para cada subtarefa, criar uma task com `parent` = `clickupTaskId` da tarefa pai.
3. Verificar/criar Custom Fields na lista:
   - **"Modo de produção"** — tipo `drop_down`, opções: "IA 100%", "Híbrido", "Manual 100%"
   - **"Tempo economizado (min)"** — tipo `number`
   - Documentar que pode exigir permissão de admin do Space.
4. Atualizar `Campaign.clickupListId` e `Task.status = "synced"`.
5. Retornar as tasks com `url` do ClickUp para exibição na `SyncConfirmation.tsx`.

**`SyncConfirmation.tsx`:**
- Exibir resumo das tarefas criadas com link direto para cada uma (campo `url` da resposta do ClickUp)
- Botão para ir ao Dashboard

---

### Fase 5 — Encerramento de tarefa e registro de produção

**Arquivos a implementar:**
- `backend/src/routes/production.ts`
- `frontend/src/pages/TaskClose.tsx`

**Endpoint:** `POST /api/production/:taskId`

Body: `{ mode: "ia" | "hibrido" | "manual", estimatedSavedMinutes: number }`

Lógica:
1. Criar `ProductionLog` no banco.
2. Atualizar Custom Fields no ClickUp da task correspondente via `POST /api/v2/task/{task_id}/field/{field_id}`.
3. Atualizar `Task.status = "closed"`.
4. Tratar erros da API do ClickUp com mensagens claras (token inválido, rate limit, etc.) sem quebrar o servidor.

**`TaskClose.tsx`:**
- Seletor de modo (3 botões: IA / Híbrido / Manual)
- Slider de tempo economizado (0–480 min, exibir em horas)
- Botão salvar
- Redirecionar ao Dashboard após salvar

---

### Fase 6 — Dashboard

**Arquivos a implementar:**
- `backend/src/routes/dashboard.ts`
- `frontend/src/pages/Dashboard.tsx`

**Endpoint:** `GET /api/dashboard/summary`

Deve retornar:
```json
{
  "totalSavedHours": 127.5,
  "modeDistribution": {
    "ia": 68,
    "hibrido": 20,
    "manual": 12
  },
  "savedByCampaign": [
    { "campaignName": "Black Friday", "savedHours": 42 }
  ],
  "deadlineCompliance": {
    "onTime": 84,
    "late": 16
  }
}
```

**`Dashboard.tsx`** — seguir exatamente o design já aprovado (protótipo construído e aprovado pelo usuário):
- 4 KPI cards no topo com sparklines (SVG) em azul `#3D7BFF`
- Tabela de campanhas com badges de status
- Gráfico de barras de horas por campanha — **Recharts**, azul
- Donut de modo de produção — **Recharts**, azul/info/navy
- Cards de cumprimento de prazos (verde/vermelho)

---

### Fase 7 — Transcrição de áudio (opcional)

**Arquivos a implementar:**
- `backend/src/services/transcription.ts`
- Atualizar `BriefCapture.tsx` para aceitar upload de áudio

**Lógica:**
- Se `OPENAI_API_KEY` estiver no `.env`, ativar o campo de upload de áudio em `BriefCapture.tsx`
- Se não estiver, exibir a mensagem já presente: "Transcrição não configurada — adicione `OPENAI_API_KEY` no `.env`"
- Endpoint de transcrição: `POST /api/briefs/transcribe` — recebe arquivo de áudio via `multer`, chama `whisper-1`, retorna o texto transcrito
- O texto transcrito é colocado no textarea do brief e o fluxo normal continua

---

## 10. Módulo de Eventos — spec completa

### Contexto
A equipe realiza eventos recorrentes (ex: Missão Coordenação, Convenção de Vendas) todo ano. Hoje os materiais ficam espalhados — Drive, Figma, formulários — sem histórico unificado. O módulo centraliza tudo: histórico por edição, checklist com barra de progresso e links agregados.

### Rotas frontend novas (adicionar em App.tsx)
```
/eventos                         → EventosList   (lista + detalhe lado a lado)
/eventos/:eventId                → EventosList   (mesmo componente, evento selecionado)
/eventos/:eventId/:year          → EventosList   (edição específica selecionada)
```

### Arquivos a criar
```
frontend/src/pages/eventos/
  EventosList.tsx        ← layout de duas colunas: lista à esquerda + detalhe à direita
  
backend/src/routes/
  eventos.ts             ← CRUD de eventos, edições, checklist, links

backend/src/prisma/
  schema.prisma          ← adicionar 4 novos models (ver abaixo)
```

### Modelos Prisma a ADICIONAR (não remover os existentes)
```prisma
model Evento {
  id          String         @id @default(cuid())
  name        String
  description String?
  category    String?        // "institucional" | "treinamento" | "comercial" | "outro"
  isRecurring Boolean        @default(true)
  createdAt   DateTime       @default(now())
  editions    EventoEdicao[]
}

model EventoEdicao {
  id            String               @id @default(cuid())
  eventoId      String
  evento        Evento               @relation(fields: [eventoId], references: [id])
  year          Int
  status        String               @default("planejamento") // planejamento | em_andamento | concluido
  notes         String?
  clickupListId String?
  createdAt     DateTime             @default(now())
  checklist     EventoChecklistItem[]
  links         EventoLink[]

  @@unique([eventoId, year])
}

model EventoChecklistItem {
  id        String       @id @default(cuid())
  edicaoId  String
  edicao    EventoEdicao @relation(fields: [edicaoId], references: [id])
  name      String
  done      Boolean      @default(false)
  category  String?      // "design" | "copy" | "logistica" | "aprovacao" | "outro"
  order     Int          @default(0)
}

model EventoLink {
  id       String       @id @default(cuid())
  edicaoId String
  edicao   EventoEdicao @relation(fields: [edicaoId], references: [id])
  type     String       // "drive" | "figma" | "form" | "site" | "social" | "outro"
  label    String
  url      String
}
```

### Endpoints backend — `backend/src/routes/eventos.ts`

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/eventos` | Listar todos os eventos com contagem de edições |
| POST | `/api/eventos` | Criar evento |
| GET | `/api/eventos/:id` | Detalhe do evento com todas as edições |
| GET | `/api/eventos/:id/:year` | Edição específica com checklist + links |
| POST | `/api/eventos/:id/edicoes` | Criar nova edição (body: `{ year }`) |
| PATCH | `/api/eventos/edicoes/:edicaoId` | Atualizar status/notes da edição |
| POST | `/api/eventos/edicoes/:edicaoId/checklist` | Adicionar item ao checklist |
| PATCH | `/api/eventos/checklist/:itemId` | Marcar done/undone ou editar nome |
| DELETE | `/api/eventos/checklist/:itemId` | Remover item |
| POST | `/api/eventos/edicoes/:edicaoId/links` | Adicionar link (body: `{ type, label, url }`) |
| DELETE | `/api/eventos/links/:linkId` | Remover link |
| POST | `/api/eventos/edicoes/:edicaoId/copiar-checklist/:fromYear` | Copiar checklist de edição anterior (todos os itens com done=false) |

### Integração com ClickUp (opcional por edição)
- Endpoint: `POST /api/eventos/edicoes/:edicaoId/sync-clickup`
- Cria uma Lista no ClickUp dentro do `CLICKUP_SPACE_ID` com nome `"{nomeEvento} {year}"`
- Cria uma tarefa por item do checklist
- Salva `clickupListId` na edição
- Mesma lógica de tratamento de erros dos outros endpoints de ClickUp

### Frontend — `EventosList.tsx`
Layout de duas colunas (igual ao protótipo aprovado):
- **Coluna esquerda (260px):** lista de eventos com badge "Anual"/"Único", busca, botão "Novo Evento"
- **Coluna direita:** detalhe do evento selecionado com:
  1. **Timeline horizontal** de edições (anos) — clicável para trocar de edição
     - Ano concluído: círculo verde com ✓
     - Ano ativo/atual: círculo azul com o ano
     - Ano futuro: círculo cinza
  2. **3 KPI cards** (% checklist concluído, itens pendentes, links cadastrados)
  3. **Checklist com barra de progresso** — itens clicáveis para marcar done/undone, badge por categoria (Design/Copy/Logística/Aprovação), botão para adicionar item
  4. **Grid de links** — cards com ícone por tipo (Drive=G verde, Figma=F azul, Form=F info, Site/Social=S amarelo), link externo, botão adicionar
  5. **Botão "Copiar checklist do ano anterior"** — aparece quando a edição não tem itens ainda

### Design
Seguir exatamente o Nova Design System (seção 7 deste arquivo). O protótipo visual foi aprovado pelo usuário — replicar fielmente a estrutura de duas colunas, as cores dos badges de categoria e o layout dos cards de link.

---

## 11. Estado atual dos arquivos (atualizado)

O Claude Code (ou o usuário via linter) já modificou os seguintes arquivos além do que foi gerado nas Fases 1–3. **Não reverter essas mudanças:**

- `frontend/src/App.tsx` — novas rotas: `/sprints`, `/time/social`, `/time/benchmarking`, `/time/atendimento`, `/time/design`
- `frontend/src/components/Layout.tsx` — sidebar expandida com seções "Planejamento" (Sprints) e "Times" (Social, Benchmarking, Atendimento, Design) com dots coloridos
- `frontend/src/pages/BriefCapture.tsx` — versão mock (navega para `/review/mock-campaign-01` sem chamar o backend) — **manter assim até o backend estar rodando**
- `frontend/src/pages/TaskReview.tsx` — versão mock com dados da Black Friday — **manter assim até o backend estar rodando**
- `frontend/src/pages/Dashboard.tsx`, `TaskClose.tsx`, `SyncConfirmation.tsx` — modificados pelo Claude Code, verificar conteúdo atual antes de alterar

Páginas stub que ainda precisam ser criadas (o App.tsx já as importa e vai quebrar se não existirem):
- `frontend/src/pages/Sprints.tsx`
- `frontend/src/pages/teams/Social.tsx`
- `frontend/src/pages/teams/Benchmarking.tsx`
- `frontend/src/pages/teams/Atendimento.tsx`
- `frontend/src/pages/teams/Design.tsx`

Criar essas páginas como stubs simples (glass-card com título + "em construção") para o app compilar sem erros.

---

## 12. Regras de segurança

- **Nunca** hardcodar API keys no código-fonte
- `.env` já está no `.gitignore` do backend e da raiz
- Validar e sanitizar inputs antes de inserir em prompts de IA (já feito em `aiInterpreter.ts`)
- Endpoints de ClickUp e produção devem ter `try/catch` com mensagens de erro claras ao frontend
- Nunca retornar stack traces para o cliente — logar no servidor, devolver mensagem genérica

---

## 11. Notas importantes

- O usuário é da área de marketing — não é desenvolvedor. Explicar os comandos de forma simples.
- A integração com ClickUp (Fase 4) só deve ser executada após confirmação explícita do usuário de que está usando um Space de testes.
- O design segue o **Nova Design System** da Nova Promotora — qualquer tela nova deve usar os tokens CSS e classes de `index.css`, ícones `lucide-react` e gráficos Recharts azul.
- O protótipo do Dashboard já foi aprovado visualmente pelo usuário e deve ser implementado fielmente na Fase 6.
