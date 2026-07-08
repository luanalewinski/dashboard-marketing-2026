import { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { BrandConfig } from '../../lib/brands';
import { brandCardStyle } from '../../lib/brands';
import {
  BRAND_IG_DATA, BRAND_GROWTH, HEATMAP_DATA,
  IG_DAYS, IG_HOURS, DEMO_GENERO, DEMO_IDADE,
  type IgPeriodo,
} from '../../lib/brandData';

// ── Helpers ────────────────────────────────────────────────────────────────────
function num(n: number) { return n.toLocaleString('pt-BR'); }
function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + ' mil';
  return n.toLocaleString('pt-BR');
}

function TipAlcance({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0C0E18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '7px 12px', fontSize: '.7rem' }}>
      <div style={{ color: 'rgba(238,242,248,.4)', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#3D7BFF', fontWeight: 700 }}>{fmt(payload[0].value)} contas</div>
    </div>
  );
}
function TipGrowth({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0C0E18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '7px 12px', fontSize: '.7rem' }}>
      <div style={{ color: 'rgba(238,242,248,.4)', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#4ADE80', fontWeight: 700 }}>{num(payload[0].value)} seguidores</div>
    </div>
  );
}

interface Props { brand: BrandConfig; }

export default function BrandInstagram({ brand }: Props) {
  const [periodo, setPeriodo] = useState<IgPeriodo>('30');
  const d        = BRAND_IG_DATA[brand.slug][periodo];
  const growth   = BRAND_GROWTH[brand.slug];
  const genero   = DEMO_GENERO[brand.slug];
  const engRate  = ((d.interacoes / d.alcancadas) * 100).toFixed(2);
  const maxViz   = Math.max(...d.vizTipo.map(x => x.valor));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

        {/* Seguidores */}
        <div style={{ background: '#0C0F1C', borderRadius: 20, padding: '22px 24px', border: '1px solid rgba(74,222,128,.12)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #4ADE80, transparent)', borderRadius: '20px 20px 0 0' }} />
          <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Seguidores</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.045em', lineHeight: 1, marginBottom: 10 }}>{num(d.seguidores)}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.18)', borderRadius: 20, padding: '3px 10px', fontSize: '.67rem', fontWeight: 700, color: '#4ADE80' }}>
            ↑ {d.deltaSeguidores} · {d.deltaPctSeg}
          </div>
        </div>

        {/* Visualizações */}
        <div style={{ background: '#0C0F1C', borderRadius: 20, padding: '22px 24px', border: '1px solid rgba(61,123,255,.12)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #3D7BFF, transparent)', borderRadius: '20px 20px 0 0' }} />
          <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(61,123,255,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(61,123,255,.1)', border: '1px solid rgba(61,123,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Visualizações</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.045em', lineHeight: 1, marginBottom: 10 }}>{fmt(d.visualizacoes)}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(61,123,255,.1)', border: '1px solid rgba(61,123,255,.22)', borderRadius: 20, padding: '3px 10px', fontSize: '.67rem', fontWeight: 700, color: '#3D7BFF' }}>
            ↑ {d.deltaViz} vs período anterior
          </div>
        </div>

        {/* Publicações */}
        <div style={{ background: '#0C0F1C', borderRadius: 20, padding: '22px 24px', border: '1px solid rgba(255,107,107,.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #FF6B6B, transparent)', borderRadius: '20px 20px 0 0' }} />
          <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Publicações</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.045em', lineHeight: 1, marginBottom: 10 }}>{num(d.publicacoes)}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.2)', borderRadius: 20, padding: '3px 10px', fontSize: '.67rem', fontWeight: 700, color: '#FF6B6B' }}>
            ↓ {d.deltaPub} vs período anterior
          </div>
        </div>
      </div>

      {/* ── HEATMAP + CRESCIMENTO ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 12 }}>

        {/* Heatmap */}
        <div style={{ ...brandCardStyle(brand), borderRadius: 22, padding: '24px 28px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Horários mais ativos</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#EEF2F8' }}>Atividade da audiência por dia e hora</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 22 }}>
              {IG_DAYS.map(d => (
                <div key={d} style={{ height: 22, display: 'flex', alignItems: 'center', fontSize: '.6rem', fontWeight: 600, color: 'rgba(238,242,248,.3)' }}>{d}</div>
              ))}
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', marginBottom: 6 }}>
                {IG_HOURS.map(h => (
                  <div key={h} style={{ fontSize: '.58rem', fontWeight: 600, color: 'rgba(238,242,248,.25)', textAlign: 'center' }}>{h}</div>
                ))}
              </div>
              {HEATMAP_DATA.map((row, di) => (
                <div key={di} style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5, marginBottom: 5 }}>
                  {row.map((val, hi) => {
                    const intensity = val / 10;
                    const bg = intensity < 0.15
                      ? 'rgba(255,255,255,.04)'
                      : `rgba(61,123,255,${(intensity * 0.72).toFixed(2)})`;
                    return (
                      <div key={hi} style={{ height: 22, borderRadius: 6, background: bg, border: `1px solid ${intensity > 0.7 ? 'rgba(61,123,255,.4)' : 'rgba(255,255,255,.04)'}`, transition: 'transform .1s', cursor: 'default' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
            <span style={{ fontSize: '.58rem', color: 'rgba(238,242,248,.25)', fontWeight: 600 }}>Baixa</span>
            {[0.08, 0.2, 0.35, 0.5, 0.65, 0.8].map((op, i) => (
              <div key={i} style={{ width: 16, height: 10, borderRadius: 3, background: `rgba(61,123,255,${op})`, border: '1px solid rgba(255,255,255,.04)' }} />
            ))}
            <span style={{ fontSize: '.58rem', color: 'rgba(238,242,248,.25)', fontWeight: 600 }}>Alta</span>
          </div>
        </div>

        {/* Crescimento */}
        <div style={{ ...brandCardStyle(brand), borderRadius: 22, padding: '24px 28px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Crescimento de seguidores</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.03em' }}>{num(d.seguidores)}</span>
              <span style={{ fontSize: '.7rem', fontWeight: 600, color: '#4ADE80' }}>
                ↑ +{num(d.seguidores - growth[0].seg)} no ano
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={196}>
            <LineChart data={growth} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)' }} axisLine={false} tickLine={false} width={48}
                domain={['auto', 'auto']}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip content={<TipGrowth />} cursor={{ stroke: 'rgba(74,222,128,.25)', strokeWidth: 1 }} />
              <Line type="monotone" dataKey="seg" stroke="#4ADE80" strokeWidth={2.5}
                dot={{ r: 4, fill: '#4ADE80', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#4ADE80', strokeWidth: 2, stroke: 'rgba(74,222,128,.3)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ALCANCE POR DIA ────────────────────────────────────────────── */}
      <div style={{ ...brandCardStyle(brand), borderRadius: 22, padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Alcance por dia</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.03em' }}>
                {fmt(d.alcanceDia.reduce((s, x) => s + x.valor, 0))}
              </span>
              <span style={{ fontSize: '.8rem', color: 'rgba(238,242,248,.3)' }}>contas alcançadas no período</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {[
              { label: 'Alcance',    val: fmt(d.alcancadas), color: '#3D7BFF'  },
              { label: 'Interações', val: num(d.interacoes), color: '#FBBF24'  },
              { label: 'Eng. rate',  val: `${engRate}%`,     color: '#4ADE80'  },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: s.color, letterSpacing: '-.02em' }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={d.alcanceDia} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`alcGrad-${brand.slug}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3D7BFF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3D7BFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.05)" vertical={false} />
            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)', fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)' }} axisLine={false} tickLine={false} width={42}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
            <Tooltip content={<TipAlcance />} cursor={{ stroke: 'rgba(61,123,255,.3)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="valor" stroke="#3D7BFF" strokeWidth={2}
              fill={`url(#alcGrad-${brand.slug})`} dot={false} activeDot={{ r: 4, fill: '#3D7BFF', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── DEMOGRAFIA ─────────────────────────────────────────────────── */}
      <div style={{ ...brandCardStyle(brand), borderRadius: 22, padding: '24px 28px' }}>
        <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 20 }}>Perfil da audiência</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ fontSize: '.825rem', fontWeight: 700, color: '#EEF2F8', marginBottom: 18 }}>Distribuição por gênero</div>
            {genero.map(g => (
              <div key={g.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                  <span style={{ fontSize: '.8rem', fontWeight: 500, color: 'rgba(238,242,248,.7)' }}>{g.label}</span>
                  <span style={{ fontSize: '.875rem', fontWeight: 800, color: g.color }}>{g.pct}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 5, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${g.pct}%`, height: '100%', background: g.color, borderRadius: 5, transition: 'width .6s ease', opacity: .85 }} />
                </div>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
              {[
                { label: 'Visitas ao perfil', val: num(d.visitas),    color: '#6F9BFF' },
                { label: 'Engajamento',       val: num(d.engajamento), color: '#FBBF24' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,.03)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,.05)' }}>
                  <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, letterSpacing: '-.03em', lineHeight: 1 }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '.825rem', fontWeight: 700, color: '#EEF2F8', marginBottom: 18 }}>Faixa etária</div>
            {DEMO_IDADE.map((item, i) => {
              const colors = ['#3D7BFF', '#4ADE80', '#FBBF24', '#6F9BFF', 'rgba(238,242,248,.3)'];
              const color = colors[i] ?? '#3D7BFF';
              return (
                <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '46px 1fr 36px', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.5)', textAlign: 'right' }}>{item.label}</span>
                  <div style={{ height: 8, borderRadius: 5, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: color, borderRadius: 5, transition: 'width .6s ease', opacity: .8 }} />
                  </div>
                  <span style={{ fontSize: '.72rem', fontWeight: 800, color, textAlign: 'right' }}>{item.pct}%</span>
                </div>
              );
            })}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 12 }}>Visualizações por formato</div>
              {d.vizTipo.map((item, i) => {
                const accents = ['#3D7BFF', '#4ADE80', '#FBBF24', '#6F9BFF'];
                return (
                  <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 80px', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: '.7rem', fontWeight: 600, color: 'rgba(238,242,248,.5)' }}>{item.label}</span>
                    <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${(item.valor / maxViz) * 100}%`, height: '100%', background: accents[i] ?? '#3D7BFF', borderRadius: 3, opacity: .75 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', gap: 5 }}>
                      <span style={{ fontSize: '.7rem', fontWeight: 700, color: '#EEF2F8' }}>{fmt(item.valor)}</span>
                      <span style={{ fontSize: '.62rem', color: 'rgba(238,242,248,.28)' }}>{item.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <div style={{ background: '#0C0F1C', borderRadius: 16, padding: '14px 18px', border: '1px solid rgba(61,123,255,.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(61,123,255,.1)', border: '1px solid rgba(61,123,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <span style={{ fontSize: '.75rem', fontWeight: 600, color: '#EEF2F8' }}>Dados mockados · {brand.handle} · </span>
          <span style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.4)' }}>Integração Meta API em desenvolvimento — conexão ativa na próxima fase.</span>
        </div>
        {/* Period selector — bottom right */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: 3 }}>
          {(['7', '14', '30'] as IgPeriodo[]).map(p => (
            <button key={p} onClick={() => setPeriodo(p)} style={{
              padding: '.25rem .65rem', borderRadius: 7, border: 'none',
              fontSize: '.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
              background: periodo === p ? 'rgba(61,123,255,.18)' : 'transparent',
              color: periodo === p ? '#3D7BFF' : 'rgba(238,242,248,.35)',
            }}>
              {p}d
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
