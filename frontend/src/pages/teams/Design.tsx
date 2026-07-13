import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const TEAM = [
  { name: 'Joana F.',   photo: 'JF', total: 30, comIA: 22, color: '#4ADE80' },
  { name: 'Luana L.',   photo: 'LL', total: 28, comIA: 21, color: '#3D7BFF' },
  { name: 'Fernanda R.', photo: 'FR', total: 24, comIA: 19, color: '#A000FF' },
  { name: 'Douglas M.', photo: 'DM', total: 18, comIA: 9,  color: '#FBBF24' },
];

const MONTHLY = [
  { mes: 'Jan', total: 12, comIA: 4  },
  { mes: 'Fev', total: 15, comIA: 7  },
  { mes: 'Mar', total: 18, comIA: 10 },
  { mes: 'Abr', total: 22, comIA: 15 },
  { mes: 'Mai', total: 28, comIA: 22 },
  { mes: 'Jun', total: 32, comIA: 27 },
  { mes: 'Jul', total: 35, comIA: 30 },
];

const TOOLS = [
  { name: 'Midjourney',  icon: 'MJ', uses: 142, color: '#3D7BFF', pct: 88 },
  { name: 'Claude',      icon: 'CL', uses: 118, color: '#4ADE80', pct: 73 },
  { name: 'ChatGPT',     icon: 'GP', uses: 96,  color: '#6F9BFF', pct: 60 },
  { name: 'Figma AI',    icon: 'FA', uses: 74,  color: '#FBBF24', pct: 46 },
  { name: 'Firefly',     icon: 'FF', uses: 51,  color: '#FF6B6B', pct: 32 },
  { name: 'Nano Banana', icon: 'NB', uses: 38,  color: '#A000FF', pct: 24 },
];

const totalMateriais = TEAM.reduce((s, m) => s + m.total, 0);
const totalIA        = TEAM.reduce((s, m) => s + m.comIA, 0);
const pctIA          = Math.round(totalIA / totalMateriais * 100);
const horasEco       = totalIA * 1.33; // média 80min economizados por material com IA
const economiaR      = Math.round(horasEco * 95); // R$ 95/hora estimado

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0C0E18', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, padding: '8px 12px', fontSize: '.7rem' }}>
      <div style={{ color: 'rgba(238,242,248,.4)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 700, marginBottom: 2 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

export default function Design() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ background: '#0C0F1C', borderRadius: 22, padding: '16px 20px', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>Design · Produtividade</div>
          <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.4)' }}>Impacto da Inteligência Artificial na equipe de criação</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.18)', borderRadius: 12, padding: '6px 14px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80' }} />
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#4ADE80' }}>{pctIA}% dos materiais com IA</span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Materiais produzidos',  val: String(totalMateriais), color: 'rgba(238,242,248,.7)', sub: 'no período' },
          { label: 'Produzidos com IA',     val: String(totalIA),        color: '#4ADE80',              sub: `${pctIA}% do total` },
          { label: 'Horas economizadas',    val: `${horasEco.toFixed(0)}h`, color: '#3D7BFF',           sub: '~80 min por material' },
          { label: 'Economia estimada',     val: `R$ ${economiaR.toLocaleString('pt-BR')}`, color: '#FBBF24', sub: 'a R$ 95/h' },
        ].map(k => (
          <div key={k.label} style={{ background: '#0C0F1C', borderRadius: 20, padding: '20px 22px', border: '1px solid rgba(255,255,255,.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${k.color}, transparent)`, opacity: .7 }} />
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>{k.label}</div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: k.color, lineHeight: 1, letterSpacing: '-.04em' }}>{k.val}</div>
            <div style={{ fontSize: '.62rem', color: 'rgba(238,242,248,.25)', marginTop: 6 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Team ranking + chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12 }}>

        {/* Ranking */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 24px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 20 }}>Ranking do time</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TEAM.sort((a, b) => (b.comIA / b.total) - (a.comIA / a.total)).map((m, i) => {
              const pct = Math.round(m.comIA / m.total * 100);
              return (
                <div key={m.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: '.75rem', fontWeight: 800, color: i === 0 ? '#FBBF24' : 'rgba(238,242,248,.3)', width: 16 }}>#{i + 1}</span>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${m.color}18`, border: `1.5px solid ${m.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: m.color, flexShrink: 0 }}>{m.photo}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#EEF2F8', marginBottom: 1 }}>{m.name}</div>
                      <div style={{ fontSize: '.65rem', color: 'rgba(238,242,248,.35)' }}>{m.total} materiais · {m.comIA} com IA</div>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: m.color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginLeft: 26 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: m.color, borderRadius: 3, opacity: .8 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly chart */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 28px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Evolução mensal</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#EEF2F8', marginBottom: 20 }}>Uso da IA por mês · total vs. com IA</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="32%">
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(238,242,248,.25)' }} axisLine={false} tickLine={false} width={24} allowDecimals={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
              <Legend wrapperStyle={{ fontSize: '.68rem', color: 'rgba(238,242,248,.4)', paddingTop: 12 }} />
              <Bar dataKey="total" name="Total" fill="rgba(61,123,255,.25)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comIA" name="Com IA" fill="#4ADE80" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tools + Savings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12 }}>

        {/* Tools */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 28px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 20 }}>Ferramentas utilizadas</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {TOOLS.map(tool => (
              <div key={tool.name} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 40px', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.04)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tool.color}15`, border: `1px solid ${tool.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.6rem', fontWeight: 800, color: tool.color }}>{tool.icon}</div>
                <div>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#EEF2F8', marginBottom: 4 }}>{tool.name}</div>
                  <div style={{ height: 4, borderRadius: 3, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                    <div style={{ width: `${tool.pct}%`, height: '100%', background: tool.color, borderRadius: 3, opacity: .8 }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.62rem', color: tool.color, fontWeight: 800 }}>{tool.pct}%</div>
                  <div style={{ fontSize: '.58rem', color: 'rgba(238,242,248,.25)' }}>{tool.uses}x</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings estimate */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '24px 24px', border: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Economia estimada</div>

          {[
            { label: 'Materiais com IA', val: String(totalIA),                     color: '#4ADE80' },
            { label: 'Tempo tradicional (média)', val: '2h por material',           color: 'rgba(238,242,248,.55)' },
            { label: 'Tempo com IA (média)',  val: '40min por material',            color: '#3D7BFF' },
            { label: 'Horas economizadas',    val: `${horasEco.toFixed(0)}h no total`, color: '#4ADE80' },
            { label: 'Valor hora estimado',   val: 'R$ 95,00',                     color: 'rgba(238,242,248,.55)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.25)', textTransform: 'uppercase', letterSpacing: '.09em' }}>{item.label}</div>
              <div style={{ fontSize: '.9rem', fontWeight: 700, color: item.color }}>{item.val}</div>
            </div>
          ))}

          <div style={{ marginTop: 'auto', padding: '16px 18px', borderRadius: 16, background: 'rgba(74,222,128,.06)', border: '1px solid rgba(74,222,128,.18)' }}>
            <div style={{ fontSize: '.62rem', fontWeight: 700, color: 'rgba(74,222,128,.7)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>Economia total</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ADE80', letterSpacing: '-.04em', lineHeight: 1 }}>R$ {economiaR.toLocaleString('pt-BR')}</div>
            <div style={{ fontSize: '.65rem', color: 'rgba(74,222,128,.5)', marginTop: 4 }}>estimativa no período</div>
          </div>
        </div>
      </div>
    </div>
  );
}
