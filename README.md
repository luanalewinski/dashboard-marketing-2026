# Sistema de Captura de Campanhas com IA + ClickUp

Aplicação web local que captura briefs de campanha, usa IA para estruturá-los em tarefas, sincroniza com o ClickUp e exibe métricas de produção.

---

## Pré-requisitos

- Node.js 18+
- npm 9+

---

## Como rodar

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # preencher com as API keys reais
npx prisma migrate dev --name init
npm run dev             # sobe em http://localhost:4000
```

Verificar: `curl http://localhost:4000/health` deve retornar `{"status":"ok","timestamp":"..."}`.

### 2. Frontend (em outro terminal)

```bash
cd frontend
npm install
npm run dev              # sobe em http://localhost:5173
```

---

## Variáveis de ambiente (`.env`)

Copiar `.env.example` para `.env` e preencher:

| Variável | Descrição |
|---|---|
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic (claude-sonnet-4-6) |
| `CLICKUP_API_TOKEN` | Personal API Token do ClickUp |
| `CLICKUP_SPACE_ID` | ID do Space de destino no ClickUp |
| `CLICKUP_LIST_ID` | ID da lista padrão (opcional; pode ser criada automaticamente) |
| `OPENAI_API_KEY` | Chave da OpenAI para transcrição Whisper (opcional) |
| `PORT` | Porta do backend (padrão: 4000) |
| `DATABASE_URL` | Caminho do banco SQLite (padrão: `file:./dev.db`) |

> ⚠️ Nunca commitar o arquivo `.env`. Ele já está no `.gitignore`.

---

## Integração com o ClickUp — Custom Fields

Na Fase 4, o sistema verifica e cria automaticamente dois Custom Fields na lista do ClickUp:
- **"Modo de produção"** (dropdown: IA 100% / Híbrido / Manual 100%)
- **"Tempo economizado (min)"** (número)

> ⚠️ A criação de Custom Fields via API pode exigir permissão de **administrador do Space** no ClickUp. Se a operação falhar, crie os campos manualmente no ClickUp e o sistema os detectará automaticamente.

---

## Fases de implementação

| Fase | Status | Descrição |
|---|---|---|
| 1 | ✅ Concluída | Esqueleto, banco de dados, `/health` |
| 2 | 🔜 | Captura de brief + interpretação com IA |
| 3 | 🔜 | Frontend de captura e revisão |
| 4 | 🔜 | Integração com o ClickUp |
| 5 | 🔜 | Encerramento de tarefa e registro de produção |
| 6 | 🔜 | Dashboard |
| 7 | 🔜 | Transcrição de áudio (opcional) |
