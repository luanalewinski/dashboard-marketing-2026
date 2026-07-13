import { useState } from 'react';

type ViewMode = 'mural' | 'ranking' | 'prompt';
type PostType = 'Reels' | 'Carrossel' | 'Foto';
type Semana = 'Semana 1' | 'Semana 2' | 'Semana 3' | 'Todas';

interface Competitor {
  handle: string;
  name: string;
  semana: 'Semana 1' | 'Semana 2' | 'Semana 3';
  color: string;
  avgLikes: number;
  avgComments: number;
  pctReels: number;
  topPost: number;
  eng: string;
}

interface Post {
  id: number;
  handle: string;
  name: string;
  semana: 'Semana 1' | 'Semana 2' | 'Semana 3';
  type: PostType;
  text: string;
  hashtags: string[];
  likes: number;
  comments: number;
  date: string;
  color: string;
}

const COMPETITORS: Competitor[] = [
  { handle: '@credfranco',               name: 'CredFranco',              semana: 'Semana 1', color: '#3D7BFF', avgLikes: 312,  avgComments: 28, pctReels: 67, topPost: 890,  eng: '3.2%' },
  { handle: '@bevioficial',              name: 'Bevi',                    semana: 'Semana 1', color: '#4ADE80', avgLikes: 541,  avgComments: 47, pctReels: 78, topPost: 1430, eng: '4.8%' },
  { handle: '@adpromotora',              name: 'AD Promotora',            semana: 'Semana 1', color: '#FBBF24', avgLikes: 189,  avgComments: 19, pctReels: 44, topPost: 520,  eng: '2.1%' },
  { handle: '@gftpromotora',             name: 'GFT Promotora',           semana: 'Semana 1', color: '#A000FF', avgLikes: 278,  avgComments: 31, pctReels: 56, topPost: 740,  eng: '2.9%' },
  { handle: '@ciadocreditooficial',      name: 'CIA do Crédito',          semana: 'Semana 1', color: '#FF6B6B', avgLikes: 423,  avgComments: 38, pctReels: 89, topPost: 1120, eng: '3.8%' },
  { handle: '@dgpromotoraoficial',       name: 'DG Promotora',            semana: 'Semana 1', color: '#6F9BFF', avgLikes: 156,  avgComments: 14, pctReels: 33, topPost: 390,  eng: '1.7%' },
  { handle: '@capitaldois',              name: 'Capital Dois',            semana: 'Semana 2', color: '#FF8C00', avgLikes: 634,  avgComments: 58, pctReels: 72, topPost: 1890, eng: '5.2%' },
  { handle: '@credforyou',               name: 'CredForYou',              semana: 'Semana 2', color: '#4ADE80', avgLikes: 398,  avgComments: 41, pctReels: 61, topPost: 1050, eng: '3.5%' },
  { handle: '@conectpromotora',          name: 'Conect Promotora',        semana: 'Semana 2', color: '#3D7BFF', avgLikes: 221,  avgComments: 22, pctReels: 50, topPost: 610,  eng: '2.3%' },
  { handle: '@gvn.digital',             name: 'GVN Digital',             semana: 'Semana 2', color: '#FBBF24', avgLikes: 845,  avgComments: 76, pctReels: 94, topPost: 2310, eng: '6.7%' },
  { handle: '@unicapromotora',           name: 'Única Promotora',         semana: 'Semana 2', color: '#FF6B6B', avgLikes: 290,  avgComments: 27, pctReels: 44, topPost: 780,  eng: '2.8%' },
  { handle: '@agilizzapromotora',        name: 'Agilizza',                semana: 'Semana 2', color: '#A000FF', avgLikes: 167,  avgComments: 16, pctReels: 39, topPost: 430,  eng: '1.9%' },
  { handle: '@dinamopromotora',          name: 'Dínamo Promotora',        semana: 'Semana 3', color: '#6F9BFF', avgLikes: 512,  avgComments: 45, pctReels: 83, topPost: 1560, eng: '4.4%' },
  { handle: '@grupogoldpromotora',       name: 'Grupo Gold',              semana: 'Semana 3', color: '#FBBF24', avgLikes: 378,  avgComments: 35, pctReels: 56, topPost: 980,  eng: '3.3%' },
  { handle: '@prospectapromotoraoficial',name: 'Prospecta',               semana: 'Semana 3', color: '#4ADE80', avgLikes: 203,  avgComments: 20, pctReels: 48, topPost: 560,  eng: '2.2%' },
  { handle: '@somos_lev',               name: 'Lev',                     semana: 'Semana 3', color: '#3D7BFF', avgLikes: 723,  avgComments: 65, pctReels: 77, topPost: 1980, eng: '5.8%' },
  { handle: '@glmpromotora',             name: 'GLM Promotora',           semana: 'Semana 3', color: '#FF6B6B', avgLikes: 141,  avgComments: 13, pctReels: 28, topPost: 340,  eng: '1.5%' },
  { handle: '@alcifmais',               name: 'Alcif+',                  semana: 'Semana 3', color: '#FF8C00', avgLikes: 287,  avgComments: 26, pctReels: 62, topPost: 740,  eng: '2.7%' },
];

const POSTS: Post[] = [
  { id: 1,  handle: '@credfranco',          name: 'CredFranco',     semana: 'Semana 1', type: 'Reels',    text: 'Empréstimo consignado aprovado em 24h — sem sair de casa', hashtags: ['#consignado', '#credito', '#aprovado'], likes: 890, comments: 71, date: '07/07', color: '#3D7BFF' },
  { id: 2,  handle: '@bevioficial',         name: 'Bevi',           semana: 'Semana 1', type: 'Carrossel',text: '5 motivos para portar seu crédito e reduzir a parcela hoje', hashtags: ['#portabilidade', '#bevi', '#economize'], likes: 1430, comments: 98, date: '08/07', color: '#4ADE80' },
  { id: 3,  handle: '@adpromotora',         name: 'AD Promotora',   semana: 'Semana 1', type: 'Foto',     text: 'INSS liberou nova margem! Consulte agora sem compromisso', hashtags: ['#inss', '#margem', '#credito'], likes: 520, comments: 39, date: '06/07', color: '#FBBF24' },
  { id: 4,  handle: '@gftpromotora',        name: 'GFT Promotora',  semana: 'Semana 1', type: 'Reels',    text: 'Como funciona o crédito consignado para aposentados do INSS?', hashtags: ['#aposentados', '#inss', '#gft'], likes: 740, comments: 62, date: '09/07', color: '#A000FF' },
  { id: 5,  handle: '@ciadocreditooficial', name: 'CIA do Crédito', semana: 'Semana 1', type: 'Reels',    text: 'Dívida no vermelho? Portabilidade resolve — veja como em 30 segundos', hashtags: ['#divida', '#portabilidade', '#credito'], likes: 1120, comments: 94, date: '10/07', color: '#FF6B6B' },
  { id: 6,  handle: '@dgpromotoraoficial',  name: 'DG Promotora',   semana: 'Semana 1', type: 'Carrossel',text: 'Simulador de parcelas: descubra o quanto cabe no seu bolso', hashtags: ['#simulador', '#parcelas', '#dg'], likes: 390, comments: 28, date: '05/07', color: '#6F9BFF' },
  { id: 7,  handle: '@capitaldois',         name: 'Capital Dois',   semana: 'Semana 2', type: 'Reels',    text: 'Refinanciamento do consignado: libere dinheiro sem aumentar parcela', hashtags: ['#refinanciamento', '#consignado', '#capital'], likes: 1890, comments: 143, date: '07/07', color: '#FF8C00' },
  { id: 8,  handle: '@credforyou',          name: 'CredForYou',     semana: 'Semana 2', type: 'Carrossel',text: 'Crédito em até 72x: veja as condições para servidor público', hashtags: ['#servidor', '#publico', '#credito'], likes: 1050, comments: 87, date: '08/07', color: '#4ADE80' },
  { id: 9,  handle: '@conectpromotora',     name: 'Conect',         semana: 'Semana 2', type: 'Foto',     text: 'Atendimento personalizado para sua familia: fale com um especialista', hashtags: ['#atendimento', '#credito', '#conect'], likes: 610, comments: 44, date: '09/07', color: '#3D7BFF' },
  { id: 10, handle: '@gvn.digital',        name: 'GVN Digital',    semana: 'Semana 2', type: 'Reels',    text: 'Score baixo? Ainda assim você pode ter crédito — saiba como', hashtags: ['#score', '#negativado', '#gvn'], likes: 2310, comments: 187, date: '10/07', color: '#FBBF24' },
  { id: 11, handle: '@unicapromotora',      name: 'Única',          semana: 'Semana 2', type: 'Reels',    text: 'Aposentado: você tem direito a até 35% da sua renda em crédito', hashtags: ['#aposentado', '#inss', '#unica'], likes: 780, comments: 61, date: '06/07', color: '#FF6B6B' },
  { id: 12, handle: '@agilizzapromotora',   name: 'Agilizza',       semana: 'Semana 2', type: 'Carrossel',text: '3 passos para contratar crédito consignado sem sair de casa', hashtags: ['#digital', '#consignado', '#agilizza'], likes: 430, comments: 33, date: '05/07', color: '#A000FF' },
  { id: 13, handle: '@dinamopromotora',     name: 'Dínamo',         semana: 'Semana 3', type: 'Reels',    text: 'Portabilidade com redução de até 40% na taxa de juros — comprove', hashtags: ['#portabilidade', '#taxa', '#dinamo'], likes: 1560, comments: 119, date: '11/07', color: '#6F9BFF' },
  { id: 14, handle: '@grupogoldpromotora',  name: 'Grupo Gold',     semana: 'Semana 3', type: 'Carrossel',text: 'Como escolher a melhor promotora de crédito? 6 critérios essenciais', hashtags: ['#promotora', '#credito', '#gold'], likes: 980, comments: 79, date: '09/07', color: '#FBBF24' },
  { id: 15, handle: '@prospectapromotoraoficial', name: 'Prospecta', semana: 'Semana 3', type: 'Foto',    text: 'Nova tabela de consignado disponível — margem ampliada para 2026', hashtags: ['#consignado', '#tabela', '#prospecta'], likes: 560, comments: 42, date: '08/07', color: '#4ADE80' },
  { id: 16, handle: '@somos_lev',          name: 'Lev',             semana: 'Semana 3', type: 'Reels',    text: 'Lev explica: portabilidade de crédito em 60 segundos', hashtags: ['#lev', '#portabilidade', '#explica'], likes: 1980, comments: 154, date: '12/07', color: '#3D7BFF' },
  { id: 17, handle: '@glmpromotora',        name: 'GLM',            semana: 'Semana 3', type: 'Foto',     text: 'Crédito para quem precisa, com atendimento humano e sem enrolação', hashtags: ['#credito', '#atendimento', '#glm'], likes: 340, comments: 24, date: '07/07', color: '#FF6B6B' },
  { id: 18, handle: '@alcifmais',          name: 'Alcif+',          semana: 'Semana 3', type: 'Reels',    text: 'Refinancie agora e use o saldo devedor para realizar seu sonho', hashtags: ['#refinanciamento', '#credito', '#alcif'], likes: 740, comments: 58, date: '10/07', color: '#FF8C00' },
];

const TYPE_COLORS: Record<PostType, string> = { Reels: '#3D7BFF', Carrossel: '#4ADE80', Foto: '#FBBF24' };

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

function buildPrompt() {
  const topRanking = [...COMPETITORS].sort((a, b) => b.avgLikes - a.avgLikes).slice(0, 5);
  const topPost = [...POSTS].sort((a, b) => b.likes - a.likes)[0];
  const totalPosts = POSTS.length;
  const avgLikesGlobal = Math.round(POSTS.reduce((s, p) => s + p.likes, 0) / POSTS.length);
  const reelPct = Math.round(POSTS.filter(p => p.type === 'Reels').length / totalPosts * 100);

  return `Você é um estrategista de conteúdo especializado em marketing financeiro para o setor de promotoras de crédito.

Analise os dados de benchmarking abaixo e entregue:

1. **Posicionamento dos top 5 concorrentes** — como cada um se diferencia no feed
2. **Lacunas de conteúdo** — temas e formatos que nenhum concorrente está explorando bem
3. **Recomendações para @nova.promotora** — 5 ideias de conteúdo concretas para as próximas 2 semanas, com formato sugerido (Reels/Carrossel/Foto) e gancho de abertura

---

DADOS COLETADOS — semana de 05/07 a 12/07/2026

Total de perfis monitorados: ${COMPETITORS.length}
Total de posts analisados: ${totalPosts}
Média de likes por post: ${avgLikesGlobal}
% de posts em formato Reels: ${reelPct}%
Post de maior engajamento: "${topPost.text}" (${topPost.handle}) — ${fmt(topPost.likes)} likes

TOP 5 POR ENGAJAMENTO MÉDIO:
${topRanking.map((c, i) => `${i + 1}. ${c.handle} — ${fmt(c.avgLikes)} likes médios · ${c.pctReels}% reels · eng ${c.eng}`).join('\n')}

POSTS MAIS CURTIDOS:
${[...POSTS].sort((a, b) => b.likes - a.likes).slice(0, 6).map(p => `- ${p.handle} [${p.type}] "${p.text}" → ${fmt(p.likes)} likes`).join('\n')}

TEMAS MAIS RECORRENTES NOS POSTS:
- Portabilidade de crédito (redução de parcela/taxa)
- Crédito consignado INSS para aposentados
- Processos digitais e sem burocracia
- Score baixo / negativado ainda pode contratar
- Refinanciamento para liberar margem

---

Responda em português, com foco em diferenciação e oportunidades reais para a @nova.promotora.`;
}

export default function Benchmarking() {
  const [view, setView]       = useState<ViewMode>('mural');
  const [typeF, setTypeF]     = useState<PostType | 'Todos'>('Todos');
  const [semanaF, setSemanaF] = useState<Semana>('Todas');
  const [copied, setCopied]   = useState(false);


  const filtered = POSTS.filter(p =>
    (typeF    === 'Todos' || p.type === typeF) &&
    (semanaF  === 'Todas' || p.semana === semanaF)
  );

  const rankedCompetitors = [...COMPETITORS].sort((a, b) => b.avgLikes - a.avgLikes);
  const leader = rankedCompetitors[0];
  const totalPostsMock = COMPETITORS.length * 9;
  const avgLikesAll = Math.round(COMPETITORS.reduce((s, c) => s + c.avgLikes, 0) / COMPETITORS.length);

  const selBtn = (active: boolean, color = '#3D7BFF'): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 20,
    border: active ? `1px solid ${color}44` : '1px solid rgba(255,255,255,.07)',
    background: active ? `${color}14` : 'transparent',
    color: active ? color : 'rgba(238,242,248,.4)',
    fontSize: '.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
  });

  const tabBtn = (v: ViewMode, label: string) => (
    <button onClick={() => setView(v)} style={{
      padding: '6px 16px', borderRadius: 9, border: 'none', fontSize: '.75rem', fontWeight: 700,
      cursor: 'pointer', transition: 'all .15s',
      background: view === v ? 'rgba(61,123,255,.18)' : 'transparent',
      color: view === v ? '#3D7BFF' : 'rgba(238,242,248,.35)',
    }}>{label}</button>
  );

  const prompt = buildPrompt();

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ background: '#0C0F1C', borderRadius: 22, padding: '16px 20px', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>Benchmarking · Instagram</div>
          <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.4)' }}>18 concorrentes monitorados · coleta automática via Apify</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 3 }}>
          {tabBtn('mural', 'Mural')}
          {tabBtn('ranking', 'Ranking')}
          {tabBtn('prompt', 'Prompt IA')}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Perfis monitorados', val: '18',            color: 'rgba(238,242,248,.7)', sub: '3 semanas de cobertura' },
          { label: 'Posts por semana',   val: String(totalPostsMock), color: '#3D7BFF',      sub: '18 perfis × 9 posts' },
          { label: 'Líder em engajamento', val: leader.handle, color: '#4ADE80',             sub: `${fmt(leader.avgLikes)} likes médios` },
          { label: 'Likes médios / post', val: fmt(avgLikesAll), color: '#FBBF24',           sub: 'todos os perfis' },
        ].map(k => (
          <div key={k.label} style={{ background: '#0C0F1C', borderRadius: 20, padding: '18px 20px', border: '1px solid rgba(255,255,255,.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${k.color}, transparent)`, opacity: .7 }} />
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: k.color, lineHeight: 1, letterSpacing: '-.03em', marginBottom: 4 }}>{k.val}</div>
            <div style={{ fontSize: '.6rem', color: 'rgba(238,242,248,.25)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {view === 'ranking' && (
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 28px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Ranking — likes médios por perfil</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['Todas', 'Semana 1', 'Semana 2', 'Semana 3'] as Semana[]).map(s => (
                <button key={s} onClick={() => setSemanaF(s)} style={selBtn(semanaF === s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rankedCompetitors.filter(c => semanaF === 'Todas' || c.semana === semanaF).map((c, i) => (
              <div key={c.handle} style={{ display: 'grid', gridTemplateColumns: '28px 180px 1fr 72px 72px 56px', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.04)' }}>
                <span style={{ fontSize: '.9rem', fontWeight: 800, color: i === 0 ? '#FBBF24' : 'rgba(238,242,248,.25)', textAlign: 'center' }}>#{i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${c.color}20`, border: `1.5px solid ${c.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.58rem', fontWeight: 800, color: c.color, flexShrink: 0 }}>
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#EEF2F8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.handle}</div>
                    <div style={{ fontSize: '.6rem', color: 'rgba(238,242,248,.3)' }}>{c.semana}</div>
                  </div>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${(c.avgLikes / rankedCompetitors[0].avgLikes) * 100}%`, height: '100%', background: c.color, borderRadius: 3, opacity: .8 }} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.58rem', color: 'rgba(238,242,248,.28)', marginBottom: 1 }}>Likes médios</div>
                  <div style={{ fontSize: '.85rem', fontWeight: 800, color: '#EEF2F8' }}>{fmt(c.avgLikes)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.58rem', color: 'rgba(238,242,248,.28)', marginBottom: 1 }}>% Reels</div>
                  <div style={{ fontSize: '.85rem', fontWeight: 800, color: c.color }}>{c.pctReels}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.58rem', color: 'rgba(238,242,248,.28)', marginBottom: 1 }}>Eng.</div>
                  <div style={{ fontSize: '.85rem', fontWeight: 800, color: '#4ADE80' }}>{c.eng}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'mural' && (
        <>
          {/* Filters */}
          <div style={{ background: '#0C0F1C', borderRadius: 18, padding: '14px 18px', border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', flexShrink: 0 }}>Filtros</span>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {(['Todos', 'Reels', 'Carrossel', 'Foto'] as (PostType | 'Todos')[]).map(t => (
                <button key={t} onClick={() => setTypeF(t)} style={selBtn(typeF === t, TYPE_COLORS[t as PostType] ?? '#3D7BFF')}>{t}</button>
              ))}
            </div>
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,.08)' }} />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {(['Todas', 'Semana 1', 'Semana 2', 'Semana 3'] as Semana[]).map(s => (
                <button key={s} onClick={() => setSemanaF(s)} style={selBtn(semanaF === s)}>{s}</button>
              ))}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '.68rem', color: 'rgba(238,242,248,.3)', fontWeight: 600 }}>{filtered.length} posts</span>
          </div>

          {/* Post grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filtered.map(post => (
              <div key={post.id} style={{ background: '#0C0F1C', borderRadius: 18, border: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>
                <div style={{ height: 130, background: `linear-gradient(135deg, ${post.color}22 0%, ${post.color}44 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${post.color}30`, border: `2px solid ${post.color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, color: '#EEF2F8' }}>
                      {post.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, background: `${TYPE_COLORS[post.type]}20`, border: `1px solid ${TYPE_COLORS[post.type]}44`, fontSize: '.6rem', fontWeight: 700, color: TYPE_COLORS[post.type] }}>{post.type}</span>
                  </div>
                  <div style={{ position: 'absolute', top: 8, left: 10, fontSize: '.6rem', color: 'rgba(238,242,248,.35)', fontWeight: 600 }}>{post.semana}</div>
                  <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: '.6rem', color: 'rgba(238,242,248,.4)', fontWeight: 600 }}>{post.date}</div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '.7rem', fontWeight: 700, color: post.color }}>{post.handle}</span>
                  </div>
                  <p style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.75)', lineHeight: 1.45, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.text}</p>
                  <div style={{ fontSize: '.6rem', color: 'rgba(238,242,248,.25)', marginBottom: 8 }}>{post.hashtags.join(' ')}</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#FF6B6B' }}>♥ {fmt(post.likes)}</span>
                    <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.3)' }}>💬 {fmt(post.comments)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'prompt' && (
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '28px 32px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Prompt IA</div>
              <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#EEF2F8' }}>Análise de posicionamento + recomendações de conteúdo</div>
              <div style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.4)', marginTop: 4 }}>Copie e cole no Claude para receber análise completa dos concorrentes</div>
            </div>
            <button onClick={handleCopy} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 14,
              border: copied ? '1px solid rgba(74,222,128,.4)' : '1px solid rgba(61,123,255,.35)',
              background: copied ? 'rgba(74,222,128,.1)' : 'rgba(61,123,255,.12)',
              color: copied ? '#4ADE80' : '#3D7BFF', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all .2s', flexShrink: 0,
            }}>
              {copied ? '✓ Copiado!' : '⎘ Copiar prompt'}
            </button>
          </div>

          <div style={{ background: '#080B12', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(255,255,255,.06)', fontFamily: 'monospace' }}>
            <pre style={{ margin: 0, fontSize: '.72rem', color: 'rgba(238,242,248,.7)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {prompt}
            </pre>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            {[
              { label: '18 perfis', color: '#3D7BFF' },
              { label: '162 posts / semana', color: '#4ADE80' },
              { label: 'Dados de 05–12/07/2026', color: '#FBBF24' },
            ].map(tag => (
              <span key={tag.label} style={{ padding: '4px 12px', borderRadius: 20, background: `${tag.color}10`, border: `1px solid ${tag.color}25`, fontSize: '.65rem', fontWeight: 700, color: tag.color }}>
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
