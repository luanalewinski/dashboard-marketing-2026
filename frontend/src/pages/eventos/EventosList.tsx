import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getListTasks, CUTask, getStatusStyle } from '../../lib/clickup';

// ── Tipos ─────────────────────────────────────────────────────────────
interface ChecklistItem {
  id: string;
  name: string;
  done: boolean;
  category: string;
  order_index: number;
}

interface EventoLink {
  id: string;
  type: string;
  label: string;
  url: string;
}

interface Edicao {
  id: string;
  evento_id: string;
  year: number;
  status: 'planejamento' | 'em_andamento' | 'concluido';
  notes: string | null;
  clickup_list_id: string | null;
  checklist: ChecklistItem[];
  links: EventoLink[];
}

interface Evento {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_recurring: boolean;
  editions: Edicao[];
}

// ── Config visual ─────────────────────────────────────────────────────
const STATUS_CFG = {
  planejamento: { label: 'Planejamento', color: 'var(--nova-text-dim)', bg: 'rgba(93,104,128,.15)' },
  em_andamento: { label: 'Em andamento', color: '#3D7BFF',             bg: 'rgba(61,123,255,.12)' },
  concluido:    { label: 'Concluído',    color: '#4ADE80',             bg: 'rgba(74,222,128,.12)' },
};

const CAT_CFG: Record<string, { label: string; color: string }> = {
  design:    { label: 'Design',    color: '#3D7BFF' },
  copy:      { label: 'Copy',      color: '#6F9BFF' },
  logistica: { label: 'Logística', color: '#FBBF24' },
  aprovacao: { label: 'Aprovação', color: '#4ADE80' },
  outro:     { label: 'Outro',     color: '#9AA6BA' },
};

const LINK_CFG: Record<string, { label: string; color: string; letter: string }> = {
  drive:  { label: 'Drive',  color: '#4ADE80', letter: 'G' },
  figma:  { label: 'Figma',  color: '#3D7BFF', letter: 'F' },
  form:   { label: 'Form',   color: '#6F9BFF', letter: 'F' },
  site:   { label: 'Site',   color: '#FBBF24', letter: 'S' },
  social: { label: 'Social', color: '#FBBF24', letter: 'S' },
  outro:  { label: 'Link',   color: '#9AA6BA', letter: '↗' },
};

const CATEGORIES = ['design', 'copy', 'logistica', 'aprovacao', 'outro'];
const LINK_TYPES  = ['drive', 'figma', 'form', 'site', 'social', 'outro'];

function pct(items: ChecklistItem[]) {
  if (!items.length) return 0;
  return Math.round((items.filter(i => i.done).length / items.length) * 100);
}

// ── Componente ────────────────────────────────────────────────────────
export default function EventosList() {
  const { eventId, year } = useParams<{ eventId?: string; year?: string }>();
  const navigate = useNavigate();

  const [eventos, setEventos]   = useState<Evento[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  // ClickUp tasks para edição com clickup_list_id
  const [cuTasks, setCuTasks]   = useState<CUTask[]>([]);
  const [cuLoading, setCuLoading] = useState(false);

  const activeEvento = eventId ? (eventos.find(e => e.id === eventId) ?? eventos[0]) : eventos[0];
  const activeYear   = year ? parseInt(year) : activeEvento?.editions[0]?.year;
  const activeEdicao = activeEvento?.editions.find(e => e.year === activeYear) ?? activeEvento?.editions[0] ?? null;

  // modais
  const [showNovoEvento, setShowNovoEvento] = useState(false);
  const [novoNome, setNovoNome]             = useState('');
  const [novoDesc, setNovoDesc]             = useState('');
  const [saving, setSaving]                 = useState(false);

  const [showNovaEdicao, setShowNovaEdicao] = useState(false);
  const [novoAno, setNovoAno]               = useState(new Date().getFullYear());

  const [novoItem, setNovoItem]     = useState('');
  const [novoItemCat, setNovoItemCat] = useState('outro');

  const [showNovoLink, setShowNovoLink] = useState(false);
  const [novoLinkType, setNovoLinkType]   = useState('drive');
  const [novoLinkLabel, setNovoLinkLabel] = useState('');
  const [novoLinkUrl, setNovoLinkUrl]     = useState('');

  // ── Carregar dados Supabase ───────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    const { data: evs, error } = await supabase
      .from('eventos')
      .select(`
        id, name, description, category, is_recurring,
        evento_edicoes (
          id, evento_id, year, status, notes, clickup_list_id,
          evento_checklist_items ( id, name, done, category, order_index ),
          evento_links            ( id, type, label, url )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    const mapped: Evento[] = (evs ?? []).map((ev: any) => ({
      ...ev,
      editions: (ev.evento_edicoes ?? [])
        .sort((a: any, b: any) => b.year - a.year)
        .map((ed: any) => ({
          ...ed,
          clickup_list_id: ed.clickup_list_id ?? null,
          checklist: (ed.evento_checklist_items ?? []).sort((a: any, b: any) => a.order_index - b.order_index),
          links:     ed.evento_links ?? [],
        })),
    }));

    setEventos(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Carregar tarefas ClickUp quando edição tem lista vinculada ────
  useEffect(() => {
    if (!activeEdicao?.clickup_list_id) { setCuTasks([]); return; }
    setCuLoading(true);
    getListTasks(activeEdicao.clickup_list_id, 0, true)
      .then(setCuTasks)
      .catch(console.error)
      .finally(() => setCuLoading(false));
  }, [activeEdicao?.clickup_list_id]);

  // ── CRUD Evento ───────────────────────────────────────────────────
  async function criarEvento() {
    if (!novoNome.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('eventos')
      .insert({ name: novoNome.trim(), description: novoDesc.trim() || null, is_recurring: true })
      .select('id')
      .single();
    setSaving(false);
    if (error) { alert('Erro ao criar evento: ' + error.message); return; }
    setShowNovoEvento(false); setNovoNome(''); setNovoDesc('');
    await load();
    navigate(`/eventos/${data.id}`);
  }

  // ── CRUD Edição ───────────────────────────────────────────────────
  async function criarEdicao() {
    if (!activeEvento) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('evento_edicoes')
      .insert({ evento_id: activeEvento.id, year: novoAno, status: 'planejamento' })
      .select('id')
      .single();
    setSaving(false);
    if (error) { alert('Edição ' + novoAno + ' já existe ou erro: ' + error.message); return; }
    setShowNovaEdicao(false);
    await load();
    navigate(`/eventos/${activeEvento.id}/${novoAno}`);
    return data;
  }

  // ── CRUD Checklist (manual — apenas edições sem ClickUp) ─────────
  async function adicionarItem() {
    if (!activeEdicao || !novoItem.trim() || activeEdicao.clickup_list_id) return;
    const nextOrder = activeEdicao.checklist.length;
    const { error } = await supabase
      .from('evento_checklist_items')
      .insert({ edicao_id: activeEdicao.id, name: novoItem.trim(), category: novoItemCat, order_index: nextOrder });
    if (error) { alert('Erro: ' + error.message); return; }
    setNovoItem('');
    await load();
  }

  async function toggleItem(item: ChecklistItem) {
    await supabase.from('evento_checklist_items').update({ done: !item.done }).eq('id', item.id);
    await load();
  }

  async function removerItem(itemId: string) {
    await supabase.from('evento_checklist_items').delete().eq('id', itemId);
    await load();
  }

  async function copiarChecklist() {
    if (!activeEvento || !activeEdicao) return;
    const anos = activeEvento.editions.map(e => e.year).filter(y => y !== activeEdicao.year);
    if (!anos.length) return;
    const src = activeEvento.editions.find(e => e.year === Math.max(...anos));
    if (!src?.checklist.length) return;
    const rows = src.checklist.map((i, idx) => ({
      edicao_id: activeEdicao.id, name: i.name, category: i.category, done: false, order_index: idx,
    }));
    const { error } = await supabase.from('evento_checklist_items').insert(rows);
    if (error) { alert('Erro ao copiar: ' + error.message); return; }
    await load();
  }

  // ── CRUD Links ────────────────────────────────────────────────────
  async function adicionarLink() {
    if (!activeEdicao || !novoLinkLabel.trim() || !novoLinkUrl.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from('evento_links')
      .insert({ edicao_id: activeEdicao.id, type: novoLinkType, label: novoLinkLabel.trim(), url: novoLinkUrl.trim() });
    setSaving(false);
    if (error) { alert('Erro: ' + error.message); return; }
    setShowNovoLink(false); setNovoLinkLabel(''); setNovoLinkUrl('');
    await load();
  }

  async function removerLink(linkId: string) {
    await supabase.from('evento_links').delete().eq('id', linkId);
    await load();
  }

  // ── Calcular progresso ────────────────────────────────────────────
  const isClickUp  = !!activeEdicao?.clickup_list_id;
  const cuDone     = cuTasks.filter(t => t.status.type === 'closed').length;
  const progresso  = isClickUp
    ? (cuTasks.length ? Math.round(cuDone / cuTasks.length * 100) : 0)
    : pct(activeEdicao?.checklist ?? []);
  const feitos     = isClickUp ? cuDone : (activeEdicao?.checklist.filter(i => i.done).length ?? 0);
  const pendentes  = isClickUp
    ? cuTasks.filter(t => t.status.type !== 'closed').length
    : (activeEdicao?.checklist.filter(i => !i.done).length ?? 0);
  const totalItems = isClickUp ? cuTasks.length : (activeEdicao?.checklist.length ?? 0);

  const filtered = eventos.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 5.5rem)', minHeight: 0 }}>

      {/* ── Coluna esquerda ── */}
      <aside style={{
        width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '.5rem',
        background: 'var(--nova-bg-elev)', border: '1px solid var(--nova-border)',
        borderRadius: '1rem', padding: '.875rem', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.25rem' }}>
          <span style={{ fontSize: '.6875rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Eventos</span>
          <button className="btn-blue" onClick={() => setShowNovoEvento(true)}
            style={{ padding: '.2rem .5rem', fontSize: '.6875rem', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="10" height="10">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo
          </button>
        </div>

        <input className="nova-input" placeholder="Buscar..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ fontSize: '.8125rem', marginBottom: '.25rem' }} />

        {loading ? (
          [1,2,3].map(i => (
            <div key={i} style={{ height: 56, borderRadius: '.75rem', background: 'rgba(255,255,255,.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--nova-text-dim)', fontSize: '.8125rem' }}>
            {search ? 'Nenhum resultado.' : 'Nenhum evento ainda.\nCrie o primeiro.'}
          </div>
        ) : (
          filtered.map(ev => {
            const last  = ev.editions[0];
            const active = activeEvento?.id === ev.id;
            const sCfg  = last ? STATUS_CFG[last.status] : null;
            const hasClickUp = ev.editions.some(e => e.clickup_list_id);
            return (
              <button key={ev.id} onClick={() => navigate(`/eventos/${ev.id}`)} style={{
                display: 'flex', flexDirection: 'column', gap: '.25rem',
                padding: '.625rem .75rem', borderRadius: '.75rem', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: active ? 'rgba(61,123,255,.1)' : 'rgba(255,255,255,.03)',
                borderLeft: `3px solid ${active ? '#3D7BFF' : 'transparent'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
                  <span style={{ fontSize: '.8125rem', fontWeight: 600, color: active ? '#3D7BFF' : 'var(--nova-text)' }}>
                    {ev.name}
                  </span>
                  <div style={{ display: 'flex', gap: '.25rem', flexShrink: 0 }}>
                    {hasClickUp && (
                      <span style={{ fontSize: '.5rem', fontWeight: 700, color: '#3D7BFF', background: 'rgba(61,123,255,.15)', padding: '.1rem .3rem', borderRadius: '2rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                        CU
                      </span>
                    )}
                    {ev.is_recurring && (
                      <span style={{ fontSize: '.5625rem', fontWeight: 700, color: 'var(--nova-text-dim)', background: 'rgba(93,104,128,.15)', padding: '.1rem .35rem', borderRadius: '2rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        Anual
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}>
                  <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>
                    {ev.editions.length} edição{ev.editions.length !== 1 ? 'ões' : ''}
                  </span>
                  {sCfg && (
                    <span style={{ fontSize: '.625rem', fontWeight: 600, color: sCfg.color, background: sCfg.bg, padding: '.1rem .4rem', borderRadius: '2rem', flexShrink: 0 }}>
                      {sCfg.label}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </aside>

      {/* ── Coluna direita ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>

        {!activeEvento && !loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: 360 }}>
              <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>🗓️</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--nova-text)', marginBottom: '.5rem' }}>Selecione um evento</div>
              <div style={{ fontSize: '.8125rem', color: 'var(--nova-text-dim)' }}>Clique em um evento na lista para ver edições e detalhes.</div>
            </div>
          </div>
        ) : activeEvento ? (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.25rem' }}>{activeEvento.name}</h1>
                {activeEvento.description && (
                  <p style={{ fontSize: '.875rem', color: 'var(--nova-text-dim)', maxWidth: 520 }}>{activeEvento.description}</p>
                )}
              </div>
              <button className="btn-primary" onClick={() => setShowNovaEdicao(true)} style={{ flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nova Edição
              </button>
            </div>

            {activeEvento.editions.length === 0 ? (
              <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '.9375rem', fontWeight: 600, color: 'var(--nova-text)', marginBottom: '.5rem' }}>Nenhuma edição cadastrada.</div>
                <button className="btn-blue" onClick={() => setShowNovaEdicao(true)} style={{ marginTop: '.75rem' }}>Criar primeira edição</button>
              </div>
            ) : (
              <>
                {/* Timeline horizontal */}
                <div className="glass-card" style={{ padding: '1.125rem 1.25rem' }}>
                  <div style={{ fontSize: '.6875rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.875rem' }}>
                    Edições
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: '.25rem' }}>
                    {[...activeEvento.editions].sort((a, b) => a.year - b.year).map((ed, i, arr) => {
                      const sel = activeEdicao?.id === ed.id;
                      const p   = pct(ed.checklist);
                      return (
                        <div key={ed.id} style={{ display: 'flex', alignItems: 'center' }}>
                          <button onClick={() => navigate(`/eventos/${activeEvento.id}/${ed.year}`)} style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.375rem',
                            background: 'none', border: 'none', cursor: 'pointer', padding: '.25rem .625rem',
                          }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '.75rem',
                              background: ed.status === 'concluido' ? 'rgba(74,222,128,.15)' : sel ? 'rgba(61,123,255,.18)' : 'rgba(93,104,128,.1)',
                              border: `2px solid ${ed.status === 'concluido' ? '#4ADE80' : sel ? '#3D7BFF' : 'var(--nova-border)'}`,
                              color:  ed.status === 'concluido' ? '#4ADE80' : sel ? '#3D7BFF' : 'var(--nova-text-dim)',
                            }}>
                              {ed.status === 'concluido' ? '✓' : String(ed.year).slice(2)}
                            </div>
                            <span style={{ fontSize: '.625rem', fontWeight: 600, color: sel ? '#3D7BFF' : 'var(--nova-text-dim)' }}>{ed.year}</span>
                            {ed.clickup_list_id
                              ? <span style={{ fontSize: '.5rem', color: '#3D7BFF', fontWeight: 700 }}>ClickUp</span>
                              : ed.checklist.length > 0 && <span style={{ fontSize: '.5625rem', color: 'var(--nova-text-dim)' }}>{p}%</span>
                            }
                          </button>
                          {i < arr.length - 1 && <div style={{ width: 32, height: 2, background: 'var(--nova-border)', flexShrink: 0 }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {activeEdicao && (
                  <>
                    {/* KPI cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      {[
                        { label: 'Checklist',       value: `${progresso}%`,  color: progresso === 100 ? '#4ADE80' : '#3D7BFF' },
                        { label: 'Itens pendentes', value: pendentes,         color: pendentes > 0 ? '#FBBF24' : '#4ADE80' },
                        { label: 'Links',           value: activeEdicao.links.length, color: '#6F9BFF' },
                      ].map(kpi => (
                        <div key={kpi.label} className="glass-card" style={{ padding: '1rem 1.125rem' }}>
                          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                          <div style={{ fontSize: '.6875rem', fontWeight: 600, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '.25rem' }}>{kpi.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Barra de progresso */}
                    <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.625rem', flexWrap: 'wrap', gap: '.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                          <span style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--nova-text)' }}>
                            {activeEvento.name} {activeEdicao.year}
                          </span>
                          <span style={{ fontSize: '.6875rem', fontWeight: 600, padding: '.2rem .625rem', borderRadius: '2rem', color: STATUS_CFG[activeEdicao.status].color, background: STATUS_CFG[activeEdicao.status].bg }}>
                            {STATUS_CFG[activeEdicao.status].label}
                          </span>
                          {isClickUp && (
                            <span style={{ fontSize: '.625rem', fontWeight: 700, color: '#3D7BFF', background: 'rgba(61,123,255,.12)', padding: '.15rem .5rem', borderRadius: '2rem' }}>
                              ao vivo do ClickUp
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)' }}>{feitos} de {totalItems} itens</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
                        <div style={{ width: `${progresso}%`, height: '100%', background: progresso === 100 ? '#4ADE80' : '#3D7BFF', borderRadius: 4, transition: 'width .4s ease' }} />
                      </div>
                    </div>

                    {/* Checklist */}
                    <div className="glass-card" style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)' }}>Checklist</span>
                          {isClickUp && (
                            <span style={{ fontSize: '.625rem', fontWeight: 700, color: '#3D7BFF', background: 'rgba(61,123,255,.1)', padding: '.15rem .5rem', borderRadius: '2rem', border: '1px solid rgba(61,123,255,.2)' }}>
                              ClickUp
                            </span>
                          )}
                        </div>
                        {isClickUp ? (
                          <a href={`https://app.clickup.com/36941541/v/l/${activeEdicao.clickup_list_id}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '.75rem', color: '#3D7BFF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Gerenciar no ClickUp
                          </a>
                        ) : (
                          activeEdicao.checklist.length === 0 && activeEvento.editions.length > 1 && (
                            <button className="btn-ghost" onClick={copiarChecklist} style={{ fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: '.375rem' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                                <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                              </svg>
                              Copiar do ano anterior
                            </button>
                          )
                        )}
                      </div>

                      {/* Modo ClickUp: tarefas ao vivo */}
                      {isClickUp ? (
                        cuLoading ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
                            {[1,2,3,4,5].map(i => (
                              <div key={i} style={{ height: 40, borderRadius: '.625rem', background: 'rgba(255,255,255,.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                            ))}
                          </div>
                        ) : cuTasks.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--nova-text-dim)', fontSize: '.8125rem' }}>
                            Nenhuma tarefa encontrada nessa lista do ClickUp.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
                            {cuTasks.map(task => {
                              const done = task.status.type === 'closed';
                              const st   = getStatusStyle(task);
                              return (
                                <div key={task.id} style={{
                                  display: 'flex', alignItems: 'center', gap: '.625rem',
                                  padding: '.5rem .75rem', borderRadius: '.625rem',
                                  background: done ? 'rgba(74,222,128,.04)' : 'rgba(255,255,255,.03)',
                                  border: `1px solid ${done ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.06)'}`,
                                }}>
                                  <div style={{
                                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                                    background: done ? '#4ADE80' : 'transparent',
                                    border: `2px solid ${done ? '#4ADE80' : 'var(--nova-border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    {done && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>}
                                  </div>
                                  <span style={{ flex: 1, fontSize: '.8125rem', color: done ? 'var(--nova-text-dim)' : 'var(--nova-text)', textDecoration: done ? 'line-through' : 'none' }}>
                                    {task.name}
                                  </span>
                                  <span style={{ fontSize: '.625rem', fontWeight: 600, color: st.color, padding: '.1rem .45rem', borderRadius: '2rem', background: st.bg, flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {st.label}
                                  </span>
                                  <a href={task.url} target="_blank" rel="noopener noreferrer"
                                    style={{ color: '#3D7BFF', display: 'flex', flexShrink: 0 }}
                                    title="Abrir no ClickUp">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                    </svg>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        )
                      ) : (
                        /* Modo manual: checklist Supabase */
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem', marginBottom: '1rem' }}>
                            {activeEdicao.checklist.length === 0 && (
                              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--nova-text-dim)', fontSize: '.8125rem' }}>
                                Nenhum item ainda. Adicione abaixo ou copie do ano anterior.
                              </div>
                            )}
                            {activeEdicao.checklist.map(item => {
                              const cat = CAT_CFG[item.category] ?? CAT_CFG.outro;
                              return (
                                <div key={item.id} style={{
                                  display: 'flex', alignItems: 'center', gap: '.625rem',
                                  padding: '.5rem .75rem', borderRadius: '.625rem',
                                  background: item.done ? 'rgba(74,222,128,.04)' : 'rgba(255,255,255,.03)',
                                  border: `1px solid ${item.done ? 'rgba(74,222,128,.15)' : 'rgba(255,255,255,.06)'}`,
                                }}>
                                  <button onClick={() => toggleItem(item)} style={{
                                    width: 18, height: 18, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                                    background: item.done ? '#4ADE80' : 'transparent',
                                    border: `2px solid ${item.done ? '#4ADE80' : 'var(--nova-border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    {item.done && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>}
                                  </button>
                                  <span style={{ flex: 1, fontSize: '.8125rem', color: item.done ? 'var(--nova-text-dim)' : 'var(--nova-text)', textDecoration: item.done ? 'line-through' : 'none' }}>
                                    {item.name}
                                  </span>
                                  <span style={{ fontSize: '.625rem', fontWeight: 600, color: cat.color, padding: '.1rem .45rem', borderRadius: '2rem', background: `${cat.color}18`, border: `1px solid ${cat.color}30`, flexShrink: 0 }}>
                                    {cat.label}
                                  </span>
                                  <button onClick={() => removerItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nova-text-dim)', display: 'flex', padding: '.1rem', flexShrink: 0 }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                            <input className="nova-input" placeholder="Novo item..." value={novoItem}
                              onChange={e => setNovoItem(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && adicionarItem()}
                              style={{ flex: 1, minWidth: 140, fontSize: '.8125rem' }} />
                            <select className="nova-input" value={novoItemCat} onChange={e => setNovoItemCat(e.target.value)} style={{ width: 'auto', fontSize: '.8125rem' }}>
                              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_CFG[c]?.label ?? c}</option>)}
                            </select>
                            <button className="btn-primary" onClick={adicionarItem} disabled={!novoItem.trim()}>Adicionar</button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Links */}
                    <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem' }}>
                        <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--nova-text)' }}>Links Centralizados</span>
                        <button className="btn-ghost" onClick={() => setShowNovoLink(true)} style={{ fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: '.375rem' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          Adicionar link
                        </button>
                      </div>

                      {activeEdicao.links.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--nova-text-dim)', fontSize: '.8125rem' }}>
                          Centralize aqui Drive, Figma, fotos e formulários do evento.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.75rem' }}>
                          {activeEdicao.links.map(link => {
                            const cfg = LINK_CFG[link.type] ?? LINK_CFG.outro;
                            return (
                              <div key={link.id} style={{
                                display: 'flex', alignItems: 'center', gap: '.75rem',
                                padding: '.75rem 1rem', borderRadius: '.75rem',
                                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                              }}>
                                <div style={{ width: 32, height: 32, borderRadius: '.5rem', flexShrink: 0, background: `${cfg.color}18`, border: `1.5px solid ${cfg.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 700, color: cfg.color }}>
                                  {cfg.letter}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '.8125rem', fontWeight: 600, color: 'var(--nova-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.label}</div>
                                  <div style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>{cfg.label}</div>
                                </div>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3D7BFF', display: 'flex', flexShrink: 0 }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                  </svg>
                                </a>
                                <button onClick={() => removerLink(link.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nova-text-dim)', display: 'flex', padding: '.1rem', flexShrink: 0 }}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                  </svg>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        ) : null}
      </div>

      {/* Modal: Novo Evento */}
      {showNovoEvento && (
        <Overlay onClose={() => setShowNovoEvento(false)}>
          <ModalBox title="Novo Evento">
            <LabelField label="Nome *">
              <input className="nova-input" value={novoNome} onChange={e => setNovoNome(e.target.value)}
                placeholder="Ex: Missão Coordenação" autoFocus onKeyDown={e => e.key === 'Enter' && criarEvento()} />
            </LabelField>
            <LabelField label="Descrição">
              <textarea className="nova-textarea" value={novoDesc} onChange={e => setNovoDesc(e.target.value)} rows={3} placeholder="Opcional..." />
            </LabelField>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.625rem' }}>
              <button className="btn-ghost" onClick={() => setShowNovoEvento(false)}>Cancelar</button>
              <button className="btn-blue" onClick={criarEvento} disabled={saving || !novoNome.trim()}>
                {saving ? 'Criando...' : 'Criar evento'}
              </button>
            </div>
          </ModalBox>
        </Overlay>
      )}

      {/* Modal: Nova Edição */}
      {showNovaEdicao && (
        <Overlay onClose={() => setShowNovaEdicao(false)}>
          <ModalBox title="Nova Edição">
            <LabelField label="Ano *">
              <input className="nova-input" type="number" value={novoAno}
                onChange={e => setNovoAno(parseInt(e.target.value))} min={2020} max={2040} autoFocus />
            </LabelField>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.625rem' }}>
              <button className="btn-ghost" onClick={() => setShowNovaEdicao(false)}>Cancelar</button>
              <button className="btn-blue" onClick={criarEdicao} disabled={saving}>
                {saving ? 'Criando...' : 'Criar edição'}
              </button>
            </div>
          </ModalBox>
        </Overlay>
      )}

      {/* Modal: Novo Link */}
      {showNovoLink && (
        <Overlay onClose={() => setShowNovoLink(false)}>
          <ModalBox title="Adicionar Link">
            <LabelField label="Tipo">
              <select className="nova-input" value={novoLinkType} onChange={e => setNovoLinkType(e.target.value)}>
                {LINK_TYPES.map(t => <option key={t} value={t}>{LINK_CFG[t]?.label ?? t}</option>)}
              </select>
            </LabelField>
            <LabelField label="Label *">
              <input className="nova-input" value={novoLinkLabel} onChange={e => setNovoLinkLabel(e.target.value)} placeholder="Ex: Fotos do evento" autoFocus />
            </LabelField>
            <LabelField label="URL *">
              <input className="nova-input" type="url" value={novoLinkUrl} onChange={e => setNovoLinkUrl(e.target.value)}
                placeholder="https://..." onKeyDown={e => e.key === 'Enter' && adicionarLink()} />
            </LabelField>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.625rem' }}>
              <button className="btn-ghost" onClick={() => setShowNovoLink(false)}>Cancelar</button>
              <button className="btn-blue" onClick={adicionarLink} disabled={saving || !novoLinkLabel.trim() || !novoLinkUrl.trim()}>
                {saving ? 'Salvando...' : 'Salvar link'}
              </button>
            </div>
          </ModalBox>
        </Overlay>
      )}
    </div>
  );
}

// ── Helpers de modal ──────────────────────────────────────────────────
function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,11,18,.78)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );
}

function ModalBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--nova-bg-elev)', border: '1px solid var(--nova-border)', borderRadius: '1.125rem', padding: '1.5rem', width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
      <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--nova-text)', margin: 0 }}>{title}</h2>
      {children}
    </div>
  );
}

function LabelField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem' }}>
      <label style={{ fontSize: '.6875rem', fontWeight: 700, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>
      {children}
    </div>
  );
}
