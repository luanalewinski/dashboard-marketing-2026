import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ── Mock data ─────────────────────────────────────────────────────────
const DADOS = {
  '30': {
    seguidores: 24791, alcancadas: 12387, visualizacoes: 59192,
    interacoes: 735, engajamento: 284, visitas: 2213, toques: 14,
    deltaSeguidores: '+312', deltaPct: '+1.3%',
    vizTipo: [
      { label: 'Stories',   valor: 37517, pct: 63.4 },
      { label: 'Carrossel', valor: 11667, pct: 19.7 },
      { label: 'Reels',     valor:  7732, pct: 13.1 },
      { label: 'Posts',     valor:  2272, pct:  3.8 },
    ],
    vizPublico: [
      { label: 'Seguidores',     valor: 37985, pct: 64.2 },
      { label: 'Não seguidores', valor: 20977, pct: 35.4 },
      { label: 'Desconhecido',   valor:   230, pct:  0.4 },
    ],
    interFormato: [
      { label: 'Stories', valor: 357, pct: 48.6 },
      { label: 'Posts',   valor: 238, pct: 32.4 },
      { label: 'Reels',   valor: 140, pct: 19.0 },
    ],
    alcanceDia: [
      { dia: '03/06', valor: 1820 }, { dia: '05/06', valor: 120 },
      { dia: '07/06', valor: 1100 }, { dia: '09/06', valor: 440 },
      { dia: '11/06', valor: 2400 }, { dia: '13/06', valor: 90 },
      { dia: '15/06', valor: 1980 }, { dia: '17/06', valor: 300 },
      { dia: '19/06', valor: 40 },   { dia: '21/06', valor: 60 },
      { dia: '23/06', valor: 90 },   { dia: '25/06', valor: 3780 },
      { dia: '27/06', valor: 400 },  { dia: '29/06', valor: 980 },
      { dia: '01/07', valor: 180 },
    ],
  },
  '14': {
    seguidores: 24791, alcancadas: 6840, visualizacoes: 31200,
    interacoes: 382, engajamento: 148, visitas: 1104, toques: 7,
    deltaSeguidores: '+148', deltaPct: '+0.6%',
    vizTipo: [
      { label: 'Stories',   valor: 19800, pct: 63.5 },
      { label: 'Carrossel', valor:  6150, pct: 19.7 },
      { label: 'Reels',     valor:  4100, pct: 13.1 },
      { label: 'Posts',     valor:  1150, pct:  3.7 },
    ],
    vizPublico: [
      { label: 'Seguidores',     valor: 20100, pct: 64.4 },
      { label: 'Não seguidores', valor: 10980, pct: 35.2 },
      { label: 'Desconhecido',   valor:   120, pct:  0.4 },
    ],
    interFormato: [
      { label: 'Stories', valor: 186, pct: 48.7 },
      { label: 'Posts',   valor: 124, pct: 32.5 },
      { label: 'Reels',   valor:  72, pct: 18.8 },
    ],
    alcanceDia: [
      { dia: '19/06', valor: 40 },  { dia: '21/06', valor: 60 },
      { dia: '23/06', valor: 90 },  { dia: '25/06', valor: 3780 },
      { dia: '27/06', valor: 400 }, { dia: '29/06', valor: 980 },
      { dia: '01/07', valor: 180 },
    ],
  },
  '7': {
    seguidores: 24791, alcancadas: 3210, visualizacoes: 14800,
    interacoes: 188, engajamento: 72, visitas: 540, toques: 3,
    deltaSeguidores: '+74', deltaPct: '+0.3%',
    vizTipo: [
      { label: 'Stories',   valor: 9400, pct: 63.5 },
      { label: 'Carrossel', valor: 2920, pct: 19.7 },
      { label: 'Reels',     valor: 1940, pct: 13.1 },
      { label: 'Posts',     valor:  540, pct:  3.7 },
    ],
    vizPublico: [
      { label: 'Seguidores',     valor: 9510, pct: 64.3 },
      { label: 'Não seguidores', valor: 5200, pct: 35.1 },
      { label: 'Desconhecido',   valor:   90, pct:  0.6 },
    ],
    interFormato: [
      { label: 'Stories', valor: 91, pct: 48.4 },
      { label: 'Posts',   valor: 61, pct: 32.4 },
      { label: 'Reels',   valor: 36, pct: 19.2 },
    ],
    alcanceDia: [
      { dia: '26/06', valor: 1200 }, { dia: '27/06', valor: 400 },
      { dia: '28/06', valor: 80 },   { dia: '29/06', valor: 980 },
      { dia: '30/06', valor: 600 },  { dia: '01/07', valor: 180 },
    ],
  },
};

type Periodo = '7' | '14' | '30';

function num(n: number) {
  return n.toLocaleString('pt-BR');
}
function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' mil';
  return n.toLocaleString('pt-BR');
}

// ── Barra horizontal premium ──────────────────────────────────────────
function Barra({ label, valor, pct, max, accent = '#3D7BFF' }: {
  label: string; valor: number; pct: number; max: number; accent?: string;
}) {
  const w = max > 0 ? (valor / max) * 100 : 0;
  return (
    <div style={{ marginBottom: '1.125rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '.375rem' }}>
        <span style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--nova-text)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '.5rem' }}>
          <span style={{ fontSize: '.875rem', fontWeight: 700, color: 'var(--nova-text)' }}>{fmt(valor)}</span>
          <span style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
        <div style={{ width: `${w}%`, height: '100%', background: accent, borderRadius: 3, transition: 'width .6s ease' }} />
      </div>
    </div>
  );
}

// ── Tooltip do gráfico ────────────────────────────────────────────────
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0C1425', border: '1px solid rgba(255,255,255,.08)', borderRadius: '.75rem', padding: '.625rem .875rem', fontSize: '.75rem' }}>
      <div style={{ color: 'rgba(238,242,248,.4)', marginBottom: '.25rem', fontWeight: 600 }}>{label}</div>
      <div style={{ color: '#3D7BFF', fontWeight: 700 }}>{fmt(payload[0].value)} contas</div>
    </div>
  );
}

// ── KPI card pequeno ──────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent = '#3D7BFF' }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: '#0C0F1C', borderRadius: 16, padding: '1.125rem 1.25rem',
      border: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', gap: '.375rem',
    }}>
      <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.09em' }}>{label}</div>
      <div style={{ fontSize: '1.625rem', fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: '-.03em' }}>
        {typeof value === 'number' ? num(value) : value}
      </div>
      {sub && <div style={{ fontSize: '.6875rem', color: 'rgba(238,242,248,.25)', fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────
export default function Instagram() {
  const [periodo, setPeriodo] = useState<Periodo>('30');
  const [vizFiltro, setVizFiltro] = useState<'tudo' | 'seguidores' | 'nao'>('tudo');
  const d = DADOS[periodo];

  const maxViz   = Math.max(...d.vizTipo.map(x => x.valor));
  const maxPub   = Math.max(...d.vizPublico.map(x => x.valor));
  const maxInter = Math.max(...d.interFormato.map(x => x.valor));
  const engRate  = ((d.interacoes / d.alcancadas) * 100).toFixed(2);

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ══ HERO ROW ══════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 12, height: 240 }}>

        {/* Hero card — seguidores */}
        <div style={{
          flex: '0 0 calc(58% - 6px)', background: '#0C1425', borderRadius: 22,
          padding: '28px 32px', display: 'flex', flexDirection: 'column',
          border: '1px solid rgba(255,255,255,.05)', position: 'relative', overflow: 'hidden',
        }}>
          {/* topo accent */}
          <div style={{ position: 'absolute', top: 0, left: 32, right: 32, height: 1, background: 'linear-gradient(90deg, transparent, rgba(225,48,108,.35), transparent)' }} />

          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/>
                  <circle cx="12" cy="12" r="3"/><circle cx="17.5" cy="6.5" r="1"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.09em' }}>Instagram · @nova.promotora</div>
                <div style={{ fontSize: '.75rem', color: 'rgba(238,242,248,.5)' }}>Última sync: 02/07/2026</div>
              </div>
            </div>

            {/* Período */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(['7', '14', '30'] as Periodo[]).map(p => (
                <button key={p} onClick={() => setPeriodo(p)} style={{
                  padding: '.25rem .625rem', borderRadius: 8, border: '1px solid',
                  fontSize: '.6875rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                  background: periodo === p ? 'rgba(225,48,108,.15)' : 'transparent',
                  borderColor: periodo === p ? 'rgba(225,48,108,.4)' : 'rgba(255,255,255,.08)',
                  color: periodo === p ? '#fd1d1d' : 'rgba(238,242,248,.35)',
                }}>
                  {p}d
                </button>
              ))}
            </div>
          </div>

          {/* big number */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flex: 1 }}>
            <div>
              <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Seguidores</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: '3.25rem', fontWeight: 800, color: '#EEF2F8', lineHeight: 1, letterSpacing: '-.045em' }}>{num(d.seguidores)}</span>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.18)', borderRadius: 20, padding: '3px 10px', fontSize: '.68rem', fontWeight: 700, color: '#4ADE80' }}>
                ↑ {d.deltaSeguidores} · {d.deltaPct}
              </div>
            </div>

            {/* mini stats coluna */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'right', paddingBottom: 4 }}>
              {[
                { label: 'Alcance',     val: fmt(d.alcancadas) },
                { label: 'Interações',  val: num(d.interacoes) },
                { label: 'Eng. rate',   val: `${engRate}%` },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '.6rem', fontWeight: 600, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{s.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#EEF2F8' }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right stack — 3 mini cards */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <KpiCard label="Visualizações" value={d.visualizacoes} sub={`últimos ${periodo} dias`} accent="#3D7BFF" />
          <KpiCard label="Visitas ao perfil" value={d.visitas} sub={`últimos ${periodo} dias`} accent="#6F9BFF" />
          <KpiCard label="Contas c/ engajamento" value={d.engajamento} sub={`últimos ${periodo} dias`} accent="#FBBF24" />
        </div>
      </div>

      {/* ══ MIDDLE ROW — 2 painéis ════════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Visualizações por tipo */}
        <div style={{ background: '#F5F7FA', borderRadius: 20, padding: '1.375rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.125rem' }}>
            <span style={{ fontSize: '.9rem', fontWeight: 700, color: '#111827' }}>Visualizações por tipo</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { k: 'tudo',       l: 'Tudo' },
                { k: 'seguidores', l: 'Seguid.' },
                { k: 'nao',        l: 'Não seg.' },
              ].map(f => (
                <button key={f.k} onClick={() => setVizFiltro(f.k as any)} style={{
                  padding: '.2rem .55rem', borderRadius: 6, border: '1px solid',
                  fontSize: '.65rem', fontWeight: 600, cursor: 'pointer',
                  background: vizFiltro === f.k ? '#111827' : 'transparent',
                  borderColor: vizFiltro === f.k ? '#111827' : 'rgba(0,0,0,.15)',
                  color: vizFiltro === f.k ? '#fff' : '#6B7280',
                }}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>
          {d.vizTipo.map(item => (
            <div key={item.label} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '.35rem' }}>
                <span style={{ fontSize: '.875rem', fontWeight: 500, color: '#374151' }}>{item.label}</span>
                <div style={{ display: 'flex', gap: '.4rem', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#111827' }}>{fmt(item.valor)}</span>
                  <span style={{ fontSize: '.75rem', color: '#9CA3AF' }}>{item.pct}%</span>
                </div>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: 'rgba(0,0,0,.07)', overflow: 'hidden' }}>
                <div style={{ width: `${(item.valor / maxViz) * 100}%`, height: '100%', background: '#3D7BFF', borderRadius: 3, transition: 'width .5s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Visualizações por público + interações */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* por público */}
          <div style={{ background: '#F5F7FA', borderRadius: 20, padding: '1.375rem 1.5rem', flex: 1 }}>
            <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#111827', marginBottom: '1.125rem' }}>Visualizações por público</div>
            {d.vizPublico.map(item => (
              <div key={item.label} style={{ marginBottom: '.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '.35rem' }}>
                  <span style={{ fontSize: '.875rem', fontWeight: 500, color: '#374151' }}>{item.label}</span>
                  <div style={{ display: 'flex', gap: '.4rem', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#111827' }}>{fmt(item.valor)}</span>
                    <span style={{ fontSize: '.75rem', color: '#9CA3AF' }}>{item.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(0,0,0,.07)', overflow: 'hidden' }}>
                  <div style={{ width: `${(item.valor / maxPub) * 100}%`, height: '100%', background: '#3D7BFF', borderRadius: 3, transition: 'width .5s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* interações por formato */}
          <div style={{ background: '#0C0F1C', borderRadius: 20, padding: '1.125rem 1.25rem', border: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: '.875rem' }}>
              Interações por formato
            </div>
            {d.interFormato.map(item => (
              <Barra key={item.label} label={item.label} valor={item.valor} pct={item.pct} max={maxInter} />
            ))}
          </div>
        </div>
      </div>

      {/* ══ ALCANCE POR DIA ════════════════════════════════════════════ */}
      <div style={{ background: '#0C1425', borderRadius: 22, padding: '1.5rem 1.75rem', border: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 4 }}>Alcance por dia</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.03em' }}>
              {fmt(d.alcanceDia.reduce((s, x) => s + x.valor, 0))}
              <span style={{ fontSize: '.875rem', fontWeight: 500, color: 'rgba(238,242,248,.3)', marginLeft: 6 }}>total no período</span>
            </div>
          </div>
          <div style={{ fontSize: '.6875rem', color: 'rgba(238,242,248,.25)' }}>últimos {periodo} dias</div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={d.alcanceDia} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3D7BFF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3D7BFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.05)" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)' }} axisLine={false} tickLine={false} width={42}
              tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
            <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(61,123,255,.3)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="valor" stroke="#3D7BFF" strokeWidth={2}
              fill="url(#igGrad)" dot={false} activeDot={{ r: 4, fill: '#3D7BFF', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ══ BOTTOM ROW — toques + nota ════════════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 12 }}>
        <KpiCard label="Toques no endereço" value={d.toques} sub={`últimos ${periodo} dias`} accent="#4ADE80" />
        <div style={{ background: '#F5F7FA', borderRadius: 20, padding: '1.125rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(61,123,255,.1)', border: '1px solid rgba(61,123,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '.8125rem', fontWeight: 600, color: '#111827', marginBottom: '.2rem' }}>Dados mockados — integração Meta API em breve</div>
            <div style={{ fontSize: '.75rem', color: '#6B7280' }}>
              Os dados acima são simulados com base nas métricas reais de junho/2026. A conexão com a Meta Business API será ativada na próxima fase.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
