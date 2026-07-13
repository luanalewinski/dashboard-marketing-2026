import { useState } from 'react';

type ViewMode = 'mural' | 'ranking';
type PostType = 'Reels' | 'Carrossel' | 'Feed';
type Category = 'Crédito' | 'Finanças' | 'Lifestyle' | 'Fintech';

interface Post {
  id: number; profile: string; handle: string; type: PostType; category: Category;
  text: string; hashtags: string[]; likes: number; comments: number; date: string;
  grad: [string, string];
}

const POSTS: Post[] = [
  { id: 1,  profile: 'Nubank',    handle: '@nubank',       type: 'Reels',     category: 'Fintech',   text: '5 dicas para organizar suas finanças e sair do vermelho em 2026', hashtags: ['#financas', '#nubank', '#dinheiro'], likes: 15400, comments: 892, date: '10/07', grad: ['#8B00FF', '#4B0082'] },
  { id: 2,  profile: 'Nubank',    handle: '@nubank',       type: 'Carrossel', category: 'Crédito',   text: 'Portabilidade de crédito: como transferir sua dívida e economizar', hashtags: ['#credito', '#portabilidade'], likes: 8200,  comments: 341, date: '08/07', grad: ['#7B00E0', '#3D0070'] },
  { id: 3,  profile: 'Nubank',    handle: '@nubank',       type: 'Feed',      category: 'Fintech',   text: 'Taxa zero pra sempre? Veja o que mudou nas tarifas bancárias', hashtags: ['#nubank', '#taxazero', '#banco'], likes: 22100, comments: 1540, date: '05/07', grad: ['#9000FF', '#5500CC'] },
  { id: 4,  profile: 'Itaú',      handle: '@itau',         type: 'Reels',     category: 'Crédito',   text: 'Crédito consignado: quem pode contratar e como solicitar online', hashtags: ['#consignado', '#credito', '#itau'], likes: 9300,  comments: 412, date: '09/07', grad: ['#FF6B00', '#CC4400'] },
  { id: 5,  profile: 'Itaú',      handle: '@itau',         type: 'Carrossel', category: 'Crédito',   text: 'Como funciona o empréstimo pessoal? Tire todas as suas dúvidas', hashtags: ['#emprestimo', '#itau', '#pessoal'], likes: 6100,  comments: 289, date: '07/07', grad: ['#FF5500', '#BB3300'] },
  { id: 6,  profile: 'Itaú',      handle: '@itau',         type: 'Feed',      category: 'Finanças',  text: 'Financiamento em até 60 parcelas com as menores taxas do mercado', hashtags: ['#financiamento', '#taxa'], likes: 4800,  comments: 178, date: '04/07', grad: ['#FF7700', '#DD5500'] },
  { id: 7,  profile: 'Bradesco',  handle: '@bradesco',     type: 'Reels',     category: 'Finanças',  text: 'Renegociação de dívidas: como limpar o nome e recuperar o crédito', hashtags: ['#renegociacao', '#nome_limpo'], likes: 7500,  comments: 623, date: '11/07', grad: ['#CC0000', '#880000'] },
  { id: 8,  profile: 'Bradesco',  handle: '@bradesco',     type: 'Carrossel', category: 'Crédito',   text: 'Score de crédito: 7 atitudes que aumentam sua pontuação rapidamente', hashtags: ['#score', '#credito', '#serasa'], likes: 12400, comments: 891, date: '06/07', grad: ['#DD0000', '#990000'] },
  { id: 9,  profile: 'Bradesco',  handle: '@bradesco',     type: 'Feed',      category: 'Crédito',   text: 'Empréstimo pessoal aprovado em minutos: 100% digital, sem filas', hashtags: ['#digital', '#emprestimo'], likes: 3200,  comments: 145, date: '03/07', grad: ['#BB0000', '#770000'] },
  { id: 10, profile: 'Inter',     handle: '@bancoint',     type: 'Reels',     category: 'Fintech',   text: 'Sem burocracia, sem complicação: crédito na hora pelo app Inter', hashtags: ['#inter', '#credito', '#fintech'], likes: 19800, comments: 1203, date: '12/07', grad: ['#FF8C00', '#CC5500'] },
  { id: 11, profile: 'Inter',     handle: '@bancoint',     type: 'Carrossel', category: 'Lifestyle', text: 'Aprovação de crédito 100% online: veja como funciona o processo', hashtags: ['#online', '#aprovacao'], likes: 11300, comments: 534, date: '09/07', grad: ['#FF9500', '#DD6600'] },
  { id: 12, profile: 'Inter',     handle: '@bancoint',     type: 'Feed',      category: 'Fintech',   text: 'Cashback em todo empréstimo: quanto você já deixou de ganhar?', hashtags: ['#cashback', '#inter', '#ganhe'], likes: 8700,  comments: 398, date: '07/07', grad: ['#FFA500', '#EE7700'] },
];

const RANKING = [
  { profile: 'Nubank',   handle: '@nubank',   posts: 3, avgLikes: 15233, topPost: 22100, eng: '6.2%', color: '#8B00FF' },
  { profile: 'Inter',    handle: '@bancoint', posts: 3, avgLikes: 13267, topPost: 19800, eng: '5.8%', color: '#FF8C00' },
  { profile: 'Bradesco', handle: '@bradesco', posts: 3, avgLikes: 7700,  topPost: 12400, eng: '4.1%', color: '#CC0000' },
  { profile: 'Itaú',     handle: '@itau',     posts: 3, avgLikes: 6733,  topPost: 9300,  eng: '3.7%', color: '#FF6B00' },
];

const TYPE_COLORS: Record<PostType, string> = { Reels: '#3D7BFF', Carrossel: '#4ADE80', Feed: '#FBBF24' };
const CAT_COLORS: Record<Category, string>  = { Crédito: '#3D7BFF', Finanças: '#4ADE80', Lifestyle: '#FBBF24', Fintech: '#A000FF' };

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

export default function Benchmarking() {
  const [view, setView]      = useState<ViewMode>('mural');
  const [typeF, setTypeF]    = useState<PostType | 'Todos'>('Todos');
  const [profileF, setProfileF] = useState<string>('Todos');
  const [catF, setCatF]      = useState<Category | 'Todos'>('Todos');

  const profiles = ['Todos', ...Array.from(new Set(POSTS.map(p => p.profile)))];
  const types: (PostType | 'Todos')[] = ['Todos', 'Reels', 'Carrossel', 'Feed'];
  const cats: (Category | 'Todos')[]  = ['Todos', 'Crédito', 'Finanças', 'Lifestyle', 'Fintech'];

  const filtered = POSTS.filter(p =>
    (typeF    === 'Todos' || p.type === typeF) &&
    (profileF === 'Todos' || p.profile === profileF) &&
    (catF     === 'Todos' || p.category === catF)
  );

  const totalLikes    = POSTS.reduce((s, p) => s + p.likes, 0);
  const avgLikes      = Math.round(totalLikes / POSTS.length);
  const leader        = RANKING[0];

  const selBtn = (active: boolean, color = '#3D7BFF'): React.CSSProperties => ({
    padding: '5px 12px', borderRadius: 20, border: active ? `1px solid ${color}44` : '1px solid rgba(255,255,255,.07)',
    background: active ? `${color}14` : 'transparent', color: active ? color : 'rgba(238,242,248,.4)',
    fontSize: '.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header + view switcher */}
      <div style={{ background: '#0C0F1C', borderRadius: 22, padding: '16px 20px', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>Benchmarking</div>
          <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.4)' }}>Mural de análise da concorrência · crédito pessoal</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 3 }}>
          {(['mural', 'ranking'] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '6px 16px', borderRadius: 9, border: 'none', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s', background: view === v ? 'rgba(61,123,255,.18)' : 'transparent', color: view === v ? '#3D7BFF' : 'rgba(238,242,248,.35)' }}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
          <button style={{ padding: '6px 16px', borderRadius: 9, border: 'none', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', background: 'transparent', color: 'rgba(238,242,248,.35)' }}>
            Prompt IA
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Perfis coletados',     val: '4',       color: 'rgba(238,242,248,.7)' },
          { label: 'Likes médios',         val: fmt(avgLikes), color: '#3D7BFF' },
          { label: 'Líder em engajamento', val: leader.profile, color: '#4ADE80' },
          { label: 'Posts monitorados',    val: String(POSTS.length), color: '#FBBF24' },
        ].map(k => (
          <div key={k.label} style={{ background: '#0C0F1C', borderRadius: 20, padding: '18px 20px', border: '1px solid rgba(255,255,255,.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${k.color}, transparent)`, opacity: .7 }} />
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: k.color, lineHeight: 1, letterSpacing: '-.03em' }}>{k.val}</div>
          </div>
        ))}
      </div>

      {view === 'ranking' ? (
        /* Ranking view */
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 28px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 20 }}>Ranking de engajamento</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {RANKING.map((r, i) => (
              <div key={r.handle} style={{ display: 'grid', gridTemplateColumns: '28px 120px 1fr 80px 80px 60px', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.04)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: i === 0 ? '#FBBF24' : 'rgba(238,242,248,.3)' }}>#{i + 1}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${r.color}20`, border: `1.5px solid ${r.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: r.color, flexShrink: 0 }}>{r.profile.slice(0, 2).toUpperCase()}</div>
                  <div><div style={{ fontSize: '.8rem', fontWeight: 700, color: '#EEF2F8' }}>{r.profile}</div><div style={{ fontSize: '.65rem', color: 'rgba(238,242,248,.35)' }}>{r.handle}</div></div>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${(r.avgLikes / RANKING[0].avgLikes) * 100}%`, height: '100%', background: r.color, borderRadius: 3 }} />
                </div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '.6rem', color: 'rgba(238,242,248,.3)', marginBottom: 2 }}>Likes médios</div><div style={{ fontSize: '.9rem', fontWeight: 800, color: '#EEF2F8' }}>{fmt(r.avgLikes)}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '.6rem', color: 'rgba(238,242,248,.3)', marginBottom: 2 }}>Top post</div><div style={{ fontSize: '.9rem', fontWeight: 800, color: r.color }}>{fmt(r.topPost)}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '.6rem', color: 'rgba(238,242,248,.3)', marginBottom: 2 }}>Eng.</div><div style={{ fontSize: '.9rem', fontWeight: 800, color: '#4ADE80' }}>{r.eng}</div></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Mural view */
        <>
          {/* Filters */}
          <div style={{ background: '#0C0F1C', borderRadius: 18, padding: '14px 18px', border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', flexShrink: 0 }}>Filtros</span>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {types.map(t => <button key={t} onClick={() => setTypeF(t)} style={selBtn(typeF === t, TYPE_COLORS[t as PostType] ?? '#3D7BFF')}>{t}</button>)}
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.08)' }} />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {profiles.map(p => <button key={p} onClick={() => setProfileF(p)} style={selBtn(profileF === p)}>{p}</button>)}
            </div>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.08)' }} />
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {cats.map(c => <button key={c} onClick={() => setCatF(c)} style={selBtn(catF === c, CAT_COLORS[c as Category] ?? '#3D7BFF')}>{c}</button>)}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '.68rem', color: 'rgba(238,242,248,.3)', fontWeight: 600 }}>{filtered.length} posts</span>
          </div>

          {/* Post grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {filtered.map(post => (
              <div key={post.id} style={{ background: '#0C0F1C', borderRadius: 18, border: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>
                {/* Mock image */}
                <div style={{ height: 140, background: `linear-gradient(135deg, ${post.grad[0]}33, ${post.grad[1]}55)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${post.grad[0]}22 0%, ${post.grad[1]}44 100%)` }} />
                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${post.grad[0]}44`, border: `2px solid ${post.grad[0]}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 800, color: '#EEF2F8' }}>
                      {post.profile.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: 20, background: `${TYPE_COLORS[post.type]}22`, border: `1px solid ${TYPE_COLORS[post.type]}44`, fontSize: '.62rem', fontWeight: 700, color: TYPE_COLORS[post.type] }}>{post.type}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: '.6rem', color: 'rgba(238,242,248,.4)', fontWeight: 600 }}>{post.date}</div>
                </div>

                {/* Content */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#EEF2F8' }}>{post.handle}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 20, background: `${CAT_COLORS[post.category]}12`, border: `1px solid ${CAT_COLORS[post.category]}25`, fontSize: '.6rem', fontWeight: 700, color: CAT_COLORS[post.category] }}>{post.category}</span>
                  </div>
                  <p style={{ fontSize: '.73rem', color: 'rgba(238,242,248,.7)', lineHeight: 1.45, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.text}</p>
                  <div style={{ fontSize: '.62rem', color: 'rgba(238,242,248,.28)', marginBottom: 10 }}>{post.hashtags.join(' ')}</div>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#FF6B6B' }}>♥ {fmt(post.likes)}</span>
                    <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.35)' }}>💬 {fmt(post.comments)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
