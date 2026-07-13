import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BRANDS, getBrandConfig, brandCardStyle } from '../lib/brands';
import type { BrandConfig, BrandSlug } from '../lib/brands';
import { getMockBrandTasks, type BrandTask } from '../lib/brandData';
import BrandOverview from './marcas/BrandOverview';

type DashMode = 'geral' | BrandSlug;

const STATUS_CFG: Record<BrandTask['status'], { label: string; color: string; bg: string }> = {
  a_fazer:      { label: 'A fazer',      color: 'rgba(238,242,248,.3)',  bg: 'rgba(93,104,128,.15)'  },
  em_andamento: { label: 'Em andamento', color: '#3D7BFF',               bg: 'rgba(61,123,255,.12)'  },
  em_aprovacao: { label: 'Em aprovação', color: '#FBBF24',               bg: 'rgba(251,191,36,.12)'  },
  em_ajustes:   { label: 'Em ajustes',   color: '#FF6B6B',               bg: 'rgba(255,107,107,.12)' },
  concluido:    { label: 'Concluído',    color: '#4ADE80',               bg: 'rgba(74,222,128,.12)'  },
};
const PRI_COLOR: Record<BrandTask['priority'], string> = {
  alta: '#FF6B6B', media: '#FBBF24', baixa: 'rgba(238,242,248,.2)',
};

const NEUTRAL: BrandConfig = {
  slug: 'nova', name: 'GERAL', color: '#3D7BFF', color2: 'rgba(61,123,255,.12)',
  description: '', handle: '', borderGradient: null, borderOpacity: 0,
  filterStrategy: 'keyword', filterValue: '',
};

function buildChart(tasks: BrandTask[]) {
  const today = new Date('2026-07-08');
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (7 - i));
    const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const isoDay = d.toISOString().slice(0, 10);
    return { dia: label, valor: tasks.filter(t => t.status === 'concluido' && t.dateUpdated.startsWith(isoDay)).length };
  });
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0C0E18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '7px 12px', fontSize: '.7rem' }}>
      <div style={{ color: 'rgba(238,242,248,.4)', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#3D7BFF', fontWeight: 700 }}>{payload[0].value} entregas</div>
    </div>
  );
}

function GeralView() {
  const allTasks = BRANDS.flatMap(b => getMockBrandTasks(b.slug));
  const total    = allTasks.length;
  const done     = allTasks.filter(t => t.status === 'concluido').length;
  const inProg   = allTasks.filter(t => t.status === 'em_andamento').length;
  const highPri  = allTasks.filter(t => t.priority === 'alta' && t.status !== 'concluido').length;
  const open     = allTasks.filter(t => t.status !== 'concluido');
  const today    = new Date('2026-07-08');
  const overdue  = open.filter(t => t.dueDate && new Date(t.dueDate) < today);
  const delivery = buildChart(allTasks);

  const brandStats = BRANDS.map(b => {
    const bt   = getMockBrandTasks(b.slug);
    const bd   = bt.filter(t => t.status === 'concluido').length;
    const bip  = bt.filter(t => t.status === 'em_andamento').length;
    const bpct = bt.length ? Math.round(bd / bt.length * 100) : 0;
    return { brand: b, total: bt.length, done: bd, inProg: bip, pct: bpct };
  });

  // brand lookup for task labels
  const taskBrandMap = new Map<string, BrandConfig>();
  BRANDS.forEach(b => getMockBrandTasks(b.slug).forEach(t => taskBrandMap.set(t.id, b)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total de tarefas', val: total,   color: 'rgba(238,242,248,.7)' },
          { label: 'Concluídas',       val: done,    color: '#4ADE80' },
          { label: 'Em andamento',     val: inProg,  color: '#3D7BFF' },
          { label: 'Alta prioridade',  val: highPri, color: '#FF6B6B' },
        ].map(k => (
          <div key={k.label} style={{ ...brandCardStyle(NEUTRAL, '#0C0F1C'), borderRadius: 20, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${k.color}, transparent)`, borderRadius: '20px 20px 0 0', opacity: .7 }} />
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: k.color, lineHeight: 1, letterSpacing: '-.04em' }}>{k.val}</div>
            <div style={{ fontSize: '.62rem', color: 'rgba(238,242,248,.22)', marginTop: 6 }}>todas as marcas</div>
          </div>
        ))}
      </div>

      {/* Brand summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {brandStats.map(({ brand, total: bt, done: bd, inProg: bip, pct }) => (
          <div key={brand.slug} style={{ ...brandCardStyle(brand), borderRadius: 22, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: brand.color, flexShrink: 0 }} />
              <span style={{ fontSize: '.82rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '.04em' }}>{brand.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: '1.4rem', fontWeight: 800, color: brand.color, letterSpacing: '-.03em' }}>{pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: brand.color, borderRadius: 3, opacity: .8 }} />
            </div>
            <div style={{ display: 'flex', gap: 18 }}>
              {[{ label: 'Total', val: bt }, { label: 'Concluídas', val: bd }, { label: 'Andamento', val: bip }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: '.95rem', fontWeight: 800, color: '#EEF2F8' }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12 }}>
        <div style={{ ...brandCardStyle(NEUTRAL), borderRadius: 22, padding: '24px 28px' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Entregas consolidadas</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#EEF2F8', marginBottom: 20 }}>Volume de conclusões · últimos 8 dias</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={delivery} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="geralGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D7BFF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3D7BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)' }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: 'rgba(61,123,255,.3)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="valor" stroke="#3D7BFF" strokeWidth={2} fill="url(#geralGrad)" dot={false} activeDot={{ r: 4, fill: '#3D7BFF', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...brandCardStyle(NEUTRAL), borderRadius: 22, padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Alertas</div>
          {overdue.length > 0 ? (
            <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,107,107,.06)', border: '1px solid rgba(255,107,107,.18)' }}>
              <div style={{ fontSize: '.68rem', fontWeight: 700, color: '#FF6B6B', marginBottom: 4 }}>⚠ Tarefas atrasadas</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FF6B6B', letterSpacing: '-.04em', lineHeight: 1 }}>{overdue.length}</div>
            </div>
          ) : (
            <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(74,222,128,.05)', border: '1px solid rgba(74,222,128,.14)' }}>
              <div style={{ fontSize: '.68rem', fontWeight: 700, color: '#4ADE80' }}>✓ Sem atrasos</div>
              <div style={{ fontSize: '.62rem', color: 'rgba(238,242,248,.3)', marginTop: 2 }}>todas no prazo</div>
            </div>
          )}
          {[
            { label: 'Tarefas abertas',  val: String(open.length),   color: '#3D7BFF' },
            { label: 'Taxa de conclusão', val: `${total ? Math.round(done / total * 100) : 0}%`, color: '#4ADE80' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.04)' }}>
              <span style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.5)' }}>{s.label}</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Open tasks */}
      <div style={{ ...brandCardStyle(NEUTRAL), borderRadius: 22, padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Tarefas abertas · todas as marcas</div>
          <span style={{ fontSize: '.67rem', color: 'rgba(238,242,248,.3)' }}>{open.length} tarefas</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {open.slice(0, 14).map(t => {
            const sc = STATUS_CFG[t.status];
            const isLate = t.dueDate ? new Date(t.dueDate) < today : false;
            const dueFmt = t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : null;
            const tb = taskBrandMap.get(t.id);
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,.025)', borderTop: '1px solid rgba(255,255,255,.04)', borderRight: '1px solid rgba(255,255,255,.04)', borderBottom: '1px solid rgba(255,255,255,.04)', borderLeft: `3px solid ${PRI_COLOR[t.priority]}` }}>
                {tb && <span style={{ fontSize: '.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 20, background: `${tb.color}15`, color: tb.color, border: `1px solid ${tb.color}25`, flexShrink: 0 }}>{tb.name}</span>}
                <span style={{ flex: 1, fontSize: '.78rem', fontWeight: 500, color: '#EEF2F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                {t.assignee && <span style={{ fontSize: '.62rem', fontWeight: 600, color: 'rgba(238,242,248,.35)', flexShrink: 0 }}>{t.assignee}</span>}
                {dueFmt && <span style={{ fontSize: '.62rem', fontWeight: 700, color: isLate ? '#FF6B6B' : 'rgba(238,242,248,.3)', flexShrink: 0 }}>{isLate ? '⚠ ' : ''}{dueFmt}</span>}
                <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0, color: sc.color, background: sc.bg, border: `1px solid ${sc.color}30` }}>{sc.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [mode, setMode] = useState<DashMode>('geral');

  const modes: { key: DashMode; label: string; color: string }[] = [
    { key: 'geral',   label: 'GERAL',   color: '#3D7BFF' },
    { key: 'nova',    label: 'NOVA',    color: getBrandConfig('nova')!.color },
    { key: 'vendeai', label: 'VENDEAÍ', color: getBrandConfig('vendeai')!.color },
    { key: 'pronto',  label: 'PRONTO',  color: getBrandConfig('pronto')!.color },
  ];
  const activeColor = modes.find(m => m.key === mode)!.color;
  const activeBrand = mode !== 'geral' ? getBrandConfig(mode as BrandSlug) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Switcher */}
      <div style={{ background: '#0C0F1C', borderRadius: 22, padding: '16px 20px', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>Dashboard</div>
          <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.4)' }}>
            {mode === 'geral' ? 'Operação consolidada · NOVA · VENDEAÍ · PRONTO' : activeBrand?.description}
          </div>
        </div>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${activeColor}60, transparent)`, opacity: .5 }} />
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 4 }}>
          {modes.map(m => {
            const active = m.key === mode;
            return (
              <button key={m.key} onClick={() => setMode(m.key)} style={{
                padding: '7px 18px', borderRadius: 10,
                border: active ? `1px solid ${m.color}44` : '1px solid transparent',
                background: active ? `${m.color}18` : 'transparent',
                color: active ? m.color : 'rgba(238,242,248,.35)',
                fontSize: '.8rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '.03em', transition: 'all .15s',
              }}>
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === 'geral'
        ? <GeralView />
        : <BrandOverview brand={getBrandConfig(mode as BrandSlug)!} />
      }
    </div>
  );
}
