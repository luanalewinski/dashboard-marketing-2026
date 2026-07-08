import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { BrandConfig } from '../../lib/brands';
import { getMockBrandTasks, type BrandTask } from '../../lib/brandData';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CFG: Record<BrandTask['status'], { label: string; color: string; bg: string }> = {
  a_fazer:      { label: 'A fazer',      color: 'rgba(238,242,248,.3)',  bg: 'rgba(93,104,128,.15)'  },
  em_andamento: { label: 'Em andamento', color: '#3D7BFF',               bg: 'rgba(61,123,255,.12)'  },
  em_aprovacao: { label: 'Em aprovação', color: '#FBBF24',               bg: 'rgba(251,191,36,.12)'  },
  em_ajustes:   { label: 'Em ajustes',   color: '#FF6B6B',               bg: 'rgba(255,107,107,.12)' },
  concluido:    { label: 'Concluído',    color: '#4ADE80',               bg: 'rgba(74,222,128,.12)'  },
};
const PRI_COLOR: Record<BrandTask['priority'], string> = {
  alta:  '#FF6B6B',
  media: '#FBBF24',
  baixa: 'rgba(238,242,248,.2)',
};


function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0C0E18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '7px 12px', fontSize: '.7rem' }}>
      <div style={{ color: 'rgba(238,242,248,.4)', fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ color: '#3D7BFF', fontWeight: 700 }}>{payload[0].value} entregas</div>
    </div>
  );
}

// Gerar dados de entregas dos últimos 8 dias a partir das tasks concluídas
function buildDeliveryChart(tasks: BrandTask[]) {
  const today = new Date('2026-07-08');
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (7 - i));
    const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const isoDay = d.toISOString().slice(0, 10);
    const count = tasks.filter(t => t.status === 'concluido' && t.dateUpdated.startsWith(isoDay)).length;
    return { dia: label, valor: count };
  });
}

interface Props { brand: BrandConfig; }

export default function BrandOverview({ brand }: Props) {
  const tasks    = getMockBrandTasks(brand.slug);
  const total    = tasks.length;
  const done     = tasks.filter(t => t.status === 'concluido').length;
  const inProg   = tasks.filter(t => t.status === 'em_andamento').length;
  const highPri  = tasks.filter(t => t.priority === 'alta' && t.status !== 'concluido').length;
  const pctDone  = total ? Math.round(done / total * 100) : 0;
  const open     = tasks.filter(t => t.status !== 'concluido');
  const today    = new Date('2026-07-08');
  const overdue  = open.filter(t => t.dueDate && new Date(t.dueDate) < today);

  const deliveryData = buildDeliveryChart(tasks);

  // Contagem por assignee
  const assigneeMap: Record<string, number> = {};
  open.forEach(t => { if (t.assignee) { assigneeMap[t.assignee] = (assigneeMap[t.assignee] ?? 0) + 1; } });
  const assignees = Object.entries(assigneeMap).sort((a, b) => b[1] - a[1]);

  // Distribuição de status (apenas tasks abertas)
  const statusDist = Object.entries(STATUS_CFG).map(([key, cfg]) => ({
    status: key as BrandTask['status'],
    label: cfg.label,
    color: cfg.color,
    count: tasks.filter(t => t.status === key).length,
  })).filter(s => s.count > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── KPI ROW ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total de tarefas',  val: total,   color: 'rgba(238,242,248,.7)', bg: 'rgba(255,255,255,.03)', border: 'rgba(255,255,255,.05)' },
          { label: 'Concluídas',        val: done,    color: '#4ADE80',              bg: 'rgba(74,222,128,.05)', border: 'rgba(74,222,128,.14)' },
          { label: 'Em andamento',      val: inProg,  color: '#3D7BFF',              bg: 'rgba(61,123,255,.05)', border: 'rgba(61,123,255,.14)' },
          { label: 'Alta prioridade',   val: highPri, color: '#FF6B6B',              bg: 'rgba(255,107,107,.05)', border: 'rgba(255,107,107,.14)' },
        ].map(k => (
          <div key={k.label} style={{
            background: `#0C0F1C`, borderRadius: 20, padding: '20px 22px',
            border: `1px solid ${k.border}`, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${k.color}, transparent)`, borderRadius: '20px 20px 0 0', opacity: .7 }} />
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: k.color, lineHeight: 1, letterSpacing: '-.04em' }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* ── PROGRESS + ALERTS ─────────────────────────────────────────── */}
      <div style={{
        background: '#0C1425', borderRadius: 22, padding: '24px 28px',
        border: '1px solid rgba(255,255,255,.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Taxa de conclusão</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: brand.color, letterSpacing: '-.04em' }}>{pctDone}%</span>
              <span style={{ fontSize: '.75rem', color: 'rgba(238,242,248,.3)' }}>{done} de {total} tarefas concluídas</span>
            </div>
          </div>
          {overdue.length > 0 && (
            <div style={{ padding: '8px 14px', borderRadius: 12, background: 'rgba(255,107,107,.07)', border: '1px solid rgba(255,107,107,.18)' }}>
              <span style={{ fontSize: '.72rem', color: '#FF6B6B', fontWeight: 700 }}>⚠ {overdue.length} tarefa{overdue.length !== 1 ? 's' : ''} atrasada{overdue.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ width: `${pctDone}%`, height: '100%', background: brand.color, borderRadius: 4, transition: 'width .6s ease', opacity: .85 }} />
        </div>

        {/* Status distribution */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {statusDist.map(s => (
            <div key={s.status} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 11px', borderRadius: 20,
              background: `${s.color}10`, border: `1px solid ${s.color}25`,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: '.67rem', fontWeight: 700, color: s.color }}>{s.label}</span>
              <span style={{ fontSize: '.67rem', fontWeight: 800, color: 'rgba(238,242,248,.5)' }}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ENTREGAS + RESPONSÁVEIS ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 12 }}>

        {/* Gráfico de entregas */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 28px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
            Entregas recentes
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#EEF2F8', marginBottom: 20 }}>
            Volume de conclusões · últimos 8 dias
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={deliveryData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`brandGrad-${brand.slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={brand.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={brand.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)' }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: `${brand.color}40`, strokeWidth: 1 }} />
              <Area type="monotone" dataKey="valor" stroke={brand.color} strokeWidth={2}
                fill={`url(#brandGrad-${brand.slug})`} dot={false}
                activeDot={{ r: 4, fill: brand.color, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Responsáveis */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 22px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
            Responsáveis ativos
          </div>
          {assignees.length === 0 ? (
            <div style={{ fontSize: '.75rem', color: 'rgba(238,242,248,.2)', paddingTop: 8 }}>Sem responsáveis</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {assignees.map(([name, count]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: `${brand.color}18`, border: `1.5px solid ${brand.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.65rem', fontWeight: 800, color: brand.color,
                  }}>
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#EEF2F8', marginBottom: 3 }}>{name}</div>
                    <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min((count / open.length) * 100, 100)}%`, height: '100%', background: brand.color, borderRadius: 2, opacity: .7 }} />
                    </div>
                  </div>
                  <div style={{
                    fontSize: '.67rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20,
                    background: `${brand.color}12`, color: brand.color, border: `1px solid ${brand.color}20`,
                  }}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TAREFAS ABERTAS ──────────────────────────────────────────────── */}
      <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 28px', border: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Tarefas abertas
          </div>
          <span style={{ fontSize: '.67rem', color: 'rgba(238,242,248,.3)' }}>{open.length} tarefas</span>
        </div>

        {open.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(238,242,248,.2)', fontSize: '.78rem' }}>
            Nenhuma tarefa aberta
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {open.map(t => {
              const sc   = STATUS_CFG[t.status];
              const isLate = t.dueDate ? new Date(t.dueDate) < today : false;
              const dueFmt = t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : null;
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,.025)',
                  borderTop: '1px solid rgba(255,255,255,.04)',
                  borderRight: '1px solid rgba(255,255,255,.04)',
                  borderBottom: '1px solid rgba(255,255,255,.04)',
                  borderLeft: `3px solid ${PRI_COLOR[t.priority]}`,
                }}>
                  <span style={{ flex: 1, fontSize: '.78rem', fontWeight: 500, color: '#EEF2F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.title}
                  </span>
                  {t.assignee && (
                    <span style={{ fontSize: '.62rem', fontWeight: 600, color: 'rgba(238,242,248,.35)', flexShrink: 0 }}>
                      {t.assignee}
                    </span>
                  )}
                  {dueFmt && (
                    <span style={{ fontSize: '.62rem', fontWeight: 700, color: isLate ? '#FF6B6B' : 'rgba(238,242,248,.3)', flexShrink: 0 }}>
                      {isLate ? '⚠ ' : ''}{dueFmt}
                    </span>
                  )}
                  <span style={{
                    fontSize: '.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0,
                    color: sc.color, background: sc.bg, border: `1px solid ${sc.color}30`,
                  }}>
                    {sc.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

