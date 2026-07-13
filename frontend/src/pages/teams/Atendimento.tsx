import { useState } from 'react';

interface Influencer {
  id: number; name: string; photo: string; instagram: string; tiktok: string;
  city: string; category: string; status: 'Ativa' | 'Negociação' | 'Proposta' | 'Encerrada';
  valorPost: number; contract: string; lastCampaign: string;
  kpis: { investido: number; receita: number; cliques: number; conversoes: number; cpa: number; roi: number };
  color: string;
}

const INFLUENCERS: Influencer[] = [
  { id: 1, name: 'Ana Paula Ribeiro', photo: 'AP', instagram: '@financas_com_ana', tiktok: '@ana.financas', city: 'São Paulo', category: 'Educação Financeira', status: 'Ativa', valorPost: 3500, contract: 'UGC + Feed', lastCampaign: 'Crédito Fácil Jun/26', color: '#4ADE80', kpis: { investido: 14000, receita: 89000, cliques: 4820, conversoes: 312, cpa: 44.87, roi: 535 } },
  { id: 2, name: 'Maicon Lima',        photo: 'ML', instagram: '@maicon_invest',    tiktok: '@maicon.invest',  city: 'Rio de Janeiro', category: 'Finanças Pessoais', status: 'Ativa', valorPost: 2800, contract: 'Reels + Stories', lastCampaign: 'Empréstimo 0% Mai/26', color: '#3D7BFF', kpis: { investido: 11200, receita: 61000, cliques: 3540, conversoes: 218, cpa: 51.37, roi: 445 } },
  { id: 3, name: 'Carla Mendes',       photo: 'CM', instagram: '@vivendo_bem_br',   tiktok: '@carla.vivebem', city: 'Curitiba',      category: 'Lifestyle',        status: 'Negociação', valorPost: 4200, contract: 'Em negociação', lastCampaign: '—', color: '#FBBF24', kpis: { investido: 0, receita: 0, cliques: 0, conversoes: 0, cpa: 0, roi: 0 } },
  { id: 4, name: 'Paulo Sérgio Costa', photo: 'PS', instagram: '@dinheiro_real',    tiktok: '@paulo.dinheiro', city: 'Belo Horizonte', category: 'Crédito/Invest.', status: 'Encerrada', valorPost: 1900, contract: 'Feed único', lastCampaign: 'Renegociação Mar/26', color: '#FF6B6B', kpis: { investido: 3800, receita: 18500, cliques: 1230, conversoes: 74, cpa: 51.35, roi: 387 } },
  { id: 5, name: 'Joana Ferreira',     photo: 'JF', instagram: '@fintalk_br',       tiktok: '@joana.fintalk',  city: 'Salvador',      category: 'Fintech',          status: 'Ativa', valorPost: 5100, contract: 'Pacote 3 meses', lastCampaign: 'App Pronto Jul/26', color: '#A000FF', kpis: { investido: 15300, receita: 104000, cliques: 6310, conversoes: 481, cpa: 31.81, roi: 579 } },
  { id: 6, name: 'Rafael Costa',       photo: 'RC', instagram: '@minha_carteira',   tiktok: '@rafael.carteira', city: 'Porto Alegre', category: 'Finanças',         status: 'Proposta', valorPost: 3000, contract: 'Aguardando aprovação', lastCampaign: '—', color: '#6F9BFF', kpis: { investido: 0, receita: 0, cliques: 0, conversoes: 0, cpa: 0, roi: 0 } },
];

const CLIENTES_MOCK = [
  { nome: 'Fernanda Alves',   data: '11/07/26', produto: 'Crédito Pessoal', status: 'Aprovado',  valor: 'R$ 8.000' },
  { nome: 'Carlos Mendonça',  data: '10/07/26', produto: 'Consignado',      status: 'Análise',   valor: 'R$ 15.000' },
  { nome: 'Marina Souza',     data: '09/07/26', produto: 'Crédito Pessoal', status: 'Aprovado',  valor: 'R$ 3.500' },
  { nome: 'João Paulo Lima',  data: '08/07/26', produto: 'Renegociação',    status: 'Concluído', valor: 'R$ 6.200' },
  { nome: 'Ana Beatriz Neto', data: '07/07/26', produto: 'Crédito Pessoal', status: 'Aprovado',  valor: 'R$ 5.000' },
];

const STATUS_STYLE: Record<Influencer['status'], { color: string; bg: string }> = {
  'Ativa':       { color: '#4ADE80', bg: 'rgba(74,222,128,.12)'  },
  'Negociação':  { color: '#FBBF24', bg: 'rgba(251,191,36,.12)'  },
  'Proposta':    { color: '#3D7BFF', bg: 'rgba(61,123,255,.12)'  },
  'Encerrada':   { color: 'rgba(238,242,248,.3)', bg: 'rgba(93,104,128,.1)' },
};

const CLIENTE_STATUS: Record<string, { color: string; bg: string }> = {
  'Aprovado':  { color: '#4ADE80', bg: 'rgba(74,222,128,.12)'  },
  'Análise':   { color: '#FBBF24', bg: 'rgba(251,191,36,.12)'  },
  'Concluído': { color: '#3D7BFF', bg: 'rgba(61,123,255,.12)'  },
};

function fmt(n: number, prefix = '') {
  if (n === 0) return '—';
  return `${prefix}${n >= 1000 ? (n / 1000).toFixed(0) + 'k' : n}`;
}
function fmtR(n: number) { if (n === 0) return '—'; return `R$ ${n.toLocaleString('pt-BR')}`; }

export default function Atendimento() {
  const [selected, setSelected] = useState<Influencer>(INFLUENCERS[0]);

  const totals = INFLUENCERS.filter(i => i.status === 'Ativa').reduce(
    (acc, i) => ({ investido: acc.investido + i.kpis.investido, receita: acc.receita + i.kpis.receita, cliques: acc.cliques + i.kpis.cliques, conversoes: acc.conversoes + i.kpis.conversoes }),
    { investido: 0, receita: 0, cliques: 0, conversoes: 0 }
  );
  const avgRoi = Math.round(INFLUENCERS.filter(i => i.kpis.roi > 0).reduce((s, i) => s + i.kpis.roi, 0) / INFLUENCERS.filter(i => i.kpis.roi > 0).length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ background: '#0C0F1C', borderRadius: 22, padding: '16px 20px', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>Atendimento · CRM</div>
          <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.4)' }}>Influenciadores PRONTO · gestão de parcerias e resultados</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {['Ativa', 'Negociação', 'Proposta', 'Encerrada'].map(s => {
            const st = STATUS_STYLE[s as Influencer['status']];
            const count = INFLUENCERS.filter(i => i.status === s).length;
            return (
              <span key={s} style={{ padding: '4px 10px', borderRadius: 20, background: st.bg, border: `1px solid ${st.color}30`, fontSize: '.67rem', fontWeight: 700, color: st.color }}>
                {s} · {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {[
          { label: 'Valor investido',  val: fmtR(totals.investido), color: '#3D7BFF' },
          { label: 'Receita gerada',   val: fmtR(totals.receita),   color: '#4ADE80' },
          { label: 'Cliques totais',   val: fmt(totals.cliques),    color: '#6F9BFF' },
          { label: 'Conversões',       val: fmt(totals.conversoes), color: '#FBBF24' },
          { label: 'ROI médio',        val: `${avgRoi}%`,           color: '#4ADE80' },
        ].map(k => (
          <div key={k.label} style={{ background: '#0C0F1C', borderRadius: 18, padding: '16px 18px', border: '1px solid rgba(255,255,255,.05)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${k.color}, transparent)`, opacity: .7 }} />
            <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: k.color, lineHeight: 1, letterSpacing: '-.03em' }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Main layout: list + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 12 }}>

        {/* Influencer list */}
        <div style={{ background: '#0C1425', borderRadius: 22, padding: '18px 14px', border: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, paddingLeft: 6 }}>Influenciadores</div>
          {INFLUENCERS.map(inf => {
            const active = inf.id === selected.id;
            const st = STATUS_STYLE[inf.status];
            return (
              <div key={inf.id} onClick={() => setSelected(inf)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, cursor: 'pointer', background: active ? `${inf.color}12` : 'transparent', border: active ? `1px solid ${inf.color}30` : '1px solid transparent', transition: 'all .15s' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${inf.color}20`, border: `1.5px solid ${inf.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: inf.color, flexShrink: 0 }}>{inf.photo}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#EEF2F8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inf.name}</div>
                  <div style={{ fontSize: '.62rem', color: 'rgba(238,242,248,.35)' }}>{inf.instagram}</div>
                </div>
                <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>{inf.status}</span>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Profile header */}
          <div style={{ background: '#0C1425', borderRadius: 22, padding: '22px 26px', border: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${selected.color}20`, border: `2px solid ${selected.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: selected.color, flexShrink: 0 }}>{selected.photo}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EEF2F8', marginBottom: 3 }}>{selected.name}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: '.7rem', color: selected.color, fontWeight: 600 }}>{selected.instagram}</span>
                  <span style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.35)' }}>{selected.tiktok}</span>
                </div>
              </div>
              <span style={{ padding: '6px 14px', borderRadius: 20, background: STATUS_STYLE[selected.status].bg, border: `1px solid ${STATUS_STYLE[selected.status].color}30`, fontSize: '.72rem', fontWeight: 700, color: STATUS_STYLE[selected.status].color }}>{selected.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Cidade',        val: selected.city },
                { label: 'Categoria',     val: selected.category },
                { label: 'Contrato',      val: selected.contract },
                { label: 'Valor/post',    val: selected.valorPost ? `R$ ${selected.valorPost.toLocaleString('pt-BR')}` : '—' },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.25)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#EEF2F8' }}>{f.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* KPI row */}
          {selected.kpis.investido > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
              {[
                { label: 'Investido',  val: fmtR(selected.kpis.investido),  color: '#3D7BFF' },
                { label: 'Receita',    val: fmtR(selected.kpis.receita),    color: '#4ADE80' },
                { label: 'Cliques',    val: fmt(selected.kpis.cliques),     color: '#6F9BFF' },
                { label: 'Conv.',      val: fmt(selected.kpis.conversoes),  color: '#FBBF24' },
                { label: 'CPA',        val: `R$ ${selected.kpis.cpa.toFixed(2)}`, color: 'rgba(238,242,248,.6)' },
                { label: 'ROI',        val: `${selected.kpis.roi}%`,        color: '#4ADE80' },
              ].map(k => (
                <div key={k.label} style={{ background: '#0C0F1C', borderRadius: 14, padding: '14px 14px', border: '1px solid rgba(255,255,255,.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.25)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 6 }}>{k.label}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: k.color }}>{k.val}</div>
                </div>
              ))}
            </div>
          )}

          {/* Clients table */}
          <div style={{ background: '#0C1425', borderRadius: 22, padding: '22px 26px', border: '1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>Clientes indicados</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {CLIENTES_MOCK.map((c, i) => {
                const cs = CLIENTE_STATUS[c.status] ?? { color: 'rgba(238,242,248,.35)', bg: 'rgba(93,104,128,.1)' };
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 140px 80px 80px', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.04)' }}>
                    <span style={{ fontSize: '.78rem', fontWeight: 600, color: '#EEF2F8' }}>{c.nome}</span>
                    <span style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.35)' }}>{c.data}</span>
                    <span style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.55)' }}>{c.produto}</span>
                    <span style={{ fontSize: '.67rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cs.bg, color: cs.color, textAlign: 'center' }}>{c.status}</span>
                    <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#4ADE80', textAlign: 'right' }}>{c.valor}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Last campaign */}
          <div style={{ background: '#0C0F1C', borderRadius: 16, padding: '14px 18px', border: '1px solid rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${selected.color}15`, border: `1px solid ${selected.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={selected.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <span style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.4)' }}>Última campanha: </span>
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#EEF2F8' }}>{selected.lastCampaign}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
