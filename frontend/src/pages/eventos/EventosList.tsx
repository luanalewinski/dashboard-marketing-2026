import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getListTasks, CUTask } from '../../lib/clickup';
import { Evento, ChecklistItem, EventoLink, STATUS_CFG, WorkTab, pct } from './types';
import { Skel, BtnPrimary, BtnGhost, Badge, inputStyle, Modal, ModalField } from './ui';
import TabVisaoGeral   from './tabs/TabVisaoGeral';
import TabChecklist    from './tabs/TabChecklist';
import TabFornecedores from './tabs/TabFornecedores';
import TabItemBoard    from './tabs/TabItemBoard';

// referenced via supabase mapping
void (null as unknown as ChecklistItem);
void (null as unknown as EventoLink);

const WORKSPACE_TABS: { key: WorkTab; label: string; color?: string }[] = [
  { key: 'overview',   label: 'Visão Geral' },
  { key: 'checklist',  label: 'Checklist' },
  { key: 'suppliers',  label: 'Fornecedores' },
  { key: 'design',     label: 'Material Design', color: '#3D7BFF' },
  { key: 'social',     label: 'Social Media',    color: '#4ADE80' },
  { key: 'video',      label: 'Vídeos',          color: '#FBBF24' },
];

export default function EventosList() {
  const { eventId, year } = useParams<{ eventId?: string; year?: string }>();
  const navigate = useNavigate();

  const [eventos, setEventos]         = useState<Evento[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [cuTasks, setCuTasks]         = useState<CUTask[]>([]);
  const [cuLoading, setCuLoading]     = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<WorkTab>('overview');

  const [showNovoEvento, setShowNovoEvento] = useState(false);
  const [novoNome, setNovoNome]             = useState('');
  const [novoDesc, setNovoDesc]             = useState('');
  const [saving, setSaving]                 = useState(false);
  const [showNovaEdicao, setShowNovaEdicao] = useState(false);
  const [novoAno, setNovoAno]               = useState(new Date().getFullYear());

  const activeEvento = eventId ? (eventos.find(e => e.id === eventId) ?? eventos[0]) : eventos[0];
  const activeYear   = year ? parseInt(year) : activeEvento?.editions[0]?.year;
  const activeEdicao = activeEvento?.editions.find(e => e.year === activeYear) ?? activeEvento?.editions[0] ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    const { data: evs, error } = await supabase
      .from('eventos')
      .select(`id, name, description, category, is_recurring,
        evento_edicoes ( id, evento_id, year, status, notes, clickup_list_id,
          evento_checklist_items ( id, name, done, category, order_index ),
          evento_links            ( id, type, label, url ) )`)
      .order('created_at', { ascending: false });
    if (error) { console.error(error); setLoading(false); return; }
    const mapped: Evento[] = (evs ?? []).map((ev: any) => ({
      ...ev,
      editions: (ev.evento_edicoes ?? [])
        .sort((a: any, b: any) => b.year - a.year)
        .map((ed: any) => ({
          ...ed, clickup_list_id: ed.clickup_list_id ?? null,
          checklist: (ed.evento_checklist_items ?? []).sort((a: any, b: any) => a.order_index - b.order_index),
          links: ed.evento_links ?? [],
        })),
    }));
    setEventos(mapped);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!activeEdicao?.clickup_list_id) { setCuTasks([]); return; }
    setCuLoading(true);
    getListTasks(activeEdicao.clickup_list_id, 0, true)
      .then(setCuTasks).catch(console.error).finally(() => setCuLoading(false));
  }, [activeEdicao?.clickup_list_id]);

  async function criarEvento() {
    if (!novoNome.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from('eventos')
      .insert({ name: novoNome.trim(), description: novoDesc.trim() || null, is_recurring: true })
      .select('id').single();
    setSaving(false);
    if (error) { alert('Erro ao criar evento: ' + error.message); return; }
    setShowNovoEvento(false); setNovoNome(''); setNovoDesc('');
    await load(); navigate(`/eventos/${data.id}`);
  }

  async function criarEdicao() {
    if (!activeEvento) return;
    setSaving(true);
    const { data, error } = await supabase.from('evento_edicoes')
      .insert({ evento_id: activeEvento.id, year: novoAno, status: 'planejamento' })
      .select('id').single();
    setSaving(false);
    if (error) { alert('Edição ' + novoAno + ' já existe ou erro: ' + error.message); return; }
    setShowNovaEdicao(false);
    await load(); navigate(`/eventos/${activeEvento.id}/${novoAno}`);
    return data;
  }

  // ── KPI derivations ──────────────────────────────────────────────────
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
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .ev-card { animation: fadeUp .35s ease both; }
        .ev-input:focus { border-color: rgba(61,123,255,.4) !important; outline: none; }
        .ev-list-item:hover { background: rgba(255,255,255,.04) !important; }
        .ev-check-row:hover { background: rgba(255,255,255,.05) !important; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(238,242,248,.25)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>
              Sprint Q3 · 2026
            </div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.04em', lineHeight: 1 }}>
              Eventos
            </h1>
          </div>
          <BtnPrimary onClick={() => setShowNovoEvento(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Evento
          </BtnPrimary>
        </div>

        {/* ── BENTO GRID ───────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, alignItems: 'start' }}>

          {/* ══ LEFT PANEL — event list ══════════════════════════════════ */}
          <div className="ev-card" style={{
            background: '#0B0D1A', borderRadius: 24, padding: '22px 20px',
            border: '1px solid rgba(255,255,255,.05)',
            display: 'flex', flexDirection: 'column', gap: 12,
            position: 'sticky', top: 80,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                Todos os eventos
              </span>
              <span style={{ fontSize: '.62rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '2px 8px' }}>
                {filtered.length}
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(238,242,248,.25)', pointerEvents: 'none' }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="ev-input"
                placeholder="Buscar evento..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: 32, fontSize: '.75rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 480, overflowY: 'auto', paddingRight: 2 }}>
              {loading
                ? [1,2,3].map(i => <Skel key={i} w="100%" h={60} r={14} />)
                : filtered.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'rgba(238,242,248,.25)', fontSize: '.78rem' }}>
                    {search ? 'Nenhum resultado.' : 'Nenhum evento ainda.'}
                  </div>
                )
                : filtered.map(ev => {
                  const last   = ev.editions[0];
                  const active = activeEvento?.id === ev.id;
                  const sCfgEv = last ? STATUS_CFG[last.status] : null;
                  const hasCU  = ev.editions.some(e => e.clickup_list_id);
                  return (
                    <button
                      key={ev.id}
                      className="ev-list-item"
                      onClick={() => navigate(`/eventos/${ev.id}`)}
                      style={{
                        display: 'flex', flexDirection: 'column', gap: 6,
                        padding: '12px 14px', borderRadius: 14,
                        border: `1px solid ${active ? 'rgba(61,123,255,.3)' : 'rgba(255,255,255,.04)'}`,
                        background: active ? 'rgba(61,123,255,.1)' : 'transparent',
                        cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <span style={{ fontSize: '.8rem', fontWeight: 600, color: active ? '#3D7BFF' : '#EEF2F8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.name}
                        </span>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          {hasCU && (
                            <span style={{ fontSize: '.5rem', fontWeight: 800, color: '#3D7BFF', background: 'rgba(61,123,255,.15)', border: '1px solid rgba(61,123,255,.25)', padding: '1px 5px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.04em' }}>CU</span>
                          )}
                          {ev.is_recurring && (
                            <span style={{ fontSize: '.5rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', padding: '1px 5px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.04em' }}>Anual</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.3)', fontWeight: 500 }}>
                          {ev.editions.length} edição{ev.editions.length !== 1 ? 'ões' : ''}
                        </span>
                        {sCfgEv && (
                          <Badge color={sCfgEv.color} bg={sCfgEv.bg} border={sCfgEv.border}>{sCfgEv.label}</Badge>
                        )}
                      </div>
                    </button>
                  );
                })
              }
            </div>
          </div>

          {/* ══ RIGHT PANEL ══════════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {!activeEvento && !loading ? (
              <div className="ev-card" style={{
                background: '#0B0D1A', borderRadius: 24, padding: '64px 32px',
                border: '1px solid rgba(255,255,255,.05)', textAlign: 'center',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(61,123,255,.1)', border: '1px solid rgba(61,123,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#EEF2F8', marginBottom: 8 }}>Selecione um evento</div>
                <div style={{ fontSize: '.78rem', color: 'rgba(238,242,248,.35)', marginBottom: 24 }}>
                  Clique em um evento na lista para ver edições e detalhes.
                </div>
                <BtnPrimary onClick={() => setShowNovoEvento(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Criar primeiro evento
                </BtnPrimary>
              </div>
            ) : activeEvento ? (
              <>
                {/* ── Event header ──────────────────────────────────────── */}
                <div className="ev-card" style={{
                  background: '#0B0D1A', borderRadius: 24, padding: '24px 28px',
                  border: '1px solid rgba(255,255,255,.05)',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
                  animationDelay: '.05s',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#EEF2F8', letterSpacing: '-.03em', margin: 0, lineHeight: 1 }}>
                        {activeEvento.name}
                      </h2>
                      {activeEvento.is_recurring && (
                        <Badge color="rgba(238,242,248,.4)" bg="rgba(255,255,255,.05)" border="rgba(255,255,255,.1)">Anual</Badge>
                      )}
                    </div>
                    {activeEvento.description && (
                      <p style={{ fontSize: '.78rem', color: 'rgba(238,242,248,.38)', margin: 0, lineHeight: 1.5, maxWidth: 480 }}>
                        {activeEvento.description}
                      </p>
                    )}
                  </div>
                  <BtnGhost onClick={() => setShowNovaEdicao(true)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Nova Edição
                  </BtnGhost>
                </div>

                {activeEvento.editions.length === 0 ? (
                  <div className="ev-card" style={{
                    background: '#0B0D1A', borderRadius: 24, padding: '48px 32px',
                    border: '1px solid rgba(255,255,255,.05)', textAlign: 'center',
                    animationDelay: '.1s',
                  }}>
                    <div style={{ fontSize: '.875rem', color: 'rgba(238,242,248,.4)', marginBottom: 20 }}>
                      Nenhuma edição cadastrada ainda.
                    </div>
                    <BtnPrimary onClick={() => setShowNovaEdicao(true)}>Criar primeira edição</BtnPrimary>
                  </div>
                ) : (
                  <>
                    {/* ── Edition timeline ──────────────────────────────── */}
                    <div className="ev-card" style={{
                      background: '#0B0D1A', borderRadius: 20, padding: '20px 24px',
                      border: '1px solid rgba(255,255,255,.05)', animationDelay: '.1s',
                    }}>
                      <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16 }}>
                        Edições
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 4, gap: 0 }}>
                        {[...activeEvento.editions].sort((a, b) => a.year - b.year).map((ed, i, arr) => {
                          const sel   = activeEdicao?.id === ed.id;
                          const p     = pct(ed.checklist);
                          const done  = ed.status === 'concluido';
                          const color = done ? '#4ADE80' : sel ? '#3D7BFF' : 'rgba(238,242,248,.3)';
                          return (
                            <div key={ed.id} style={{ display: 'flex', alignItems: 'center' }}>
                              <button onClick={() => navigate(`/eventos/${activeEvento.id}/${ed.year}`)} style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 12px',
                              }}>
                                <div style={{
                                  width: 40, height: 40, borderRadius: '50%',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontWeight: 700, fontSize: '.75rem',
                                  background: done ? 'rgba(74,222,128,.12)' : sel ? 'rgba(61,123,255,.15)' : 'rgba(255,255,255,.04)',
                                  border: `2px solid ${color}`, color, transition: 'all .15s',
                                }}>
                                  {done ? '✓' : String(ed.year).slice(2)}
                                </div>
                                <span style={{ fontSize: '.62rem', fontWeight: 600, color, whiteSpace: 'nowrap' }}>{ed.year}</span>
                                {ed.clickup_list_id
                                  ? <span style={{ fontSize: '.5rem', color: '#3D7BFF', fontWeight: 700 }}>ClickUp</span>
                                  : ed.checklist.length > 0 && <span style={{ fontSize: '.55rem', color: 'rgba(238,242,248,.3)' }}>{p}%</span>
                                }
                              </button>
                              {i < arr.length - 1 && (
                                <div style={{ width: 28, height: 1.5, background: 'rgba(255,255,255,.07)', flexShrink: 0 }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {activeEdicao && (
                      <>
                        {/* ── KPI row ───────────────────────────────────── */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                          {/* Progresso */}
                          <div className="ev-card" style={{
                            borderRadius: 20, padding: '20px 22px',
                            background: progresso >= 50
                              ? 'linear-gradient(145deg, rgba(74,222,128,.09) 0%, rgba(74,222,128,.02) 50%, #0B0D1A 75%)'
                              : '#0B0D1A',
                            border: `1px solid ${progresso >= 50 ? 'rgba(74,222,128,.18)' : 'rgba(255,255,255,.05)'}`,
                            position: 'relative', overflow: 'hidden', animationDelay: '.15s',
                          }}>
                            {progresso >= 50 && <div style={{ position: 'absolute', top: -40, left: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />}
                            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>Progresso</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-.05em', color: progresso >= 50 ? '#4ADE80' : progresso > 0 ? '#3D7BFF' : 'rgba(238,242,248,.4)', lineHeight: 1 }}>
                              {progresso}%
                            </div>
                            <div style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.3)', marginTop: 6 }}>
                              {feitos} de {totalItems} itens
                            </div>
                          </div>

                          {/* Pendentes */}
                          <div className="ev-card" style={{
                            borderRadius: 20, padding: '20px 22px',
                            background: pendentes > 0
                              ? 'linear-gradient(145deg, rgba(255,107,107,.09) 0%, rgba(255,107,107,.02) 50%, #0B0D1A 75%)'
                              : '#0B0D1A',
                            border: `1px solid ${pendentes > 0 ? 'rgba(255,107,107,.18)' : 'rgba(255,255,255,.05)'}`,
                            position: 'relative', overflow: 'hidden', animationDelay: '.2s',
                          }}>
                            {pendentes > 0 && <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />}
                            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>Pendentes</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-.05em', color: pendentes > 0 ? '#FF6B6B' : '#4ADE80', lineHeight: 1 }}>
                              {pendentes}
                            </div>
                            <div style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.3)', marginTop: 6 }}>
                              {pendentes === 0 ? 'Tudo concluído 🎉' : `item${pendentes !== 1 ? 's' : ''} em aberto`}
                            </div>
                          </div>

                          {/* Links */}
                          <div className="ev-card" style={{
                            borderRadius: 20, padding: '20px 22px',
                            background: '#0B0D1A', border: '1px solid rgba(255,255,255,.05)',
                            animationDelay: '.25s',
                          }}>
                            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>Links</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-.05em', color: '#EEF2F8', lineHeight: 1 }}>
                              {activeEdicao.links.length}
                            </div>
                            <div style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.3)', marginTop: 6 }}>
                              {activeEdicao.links.length === 0 ? 'Nenhum ainda' : `recurso${activeEdicao.links.length !== 1 ? 's' : ''} centralizado${activeEdicao.links.length !== 1 ? 's' : ''}`}
                            </div>
                          </div>
                        </div>

                        {/* ── Tab bar ───────────────────────────────────── */}
                        <div style={{
                          display: 'flex', gap: 2, overflowX: 'auto',
                          background: 'rgba(255,255,255,.03)', borderRadius: 14, padding: 4,
                        }}>
                          {WORKSPACE_TABS.map(tab => {
                            const isActive = workspaceTab === tab.key;
                            const col = tab.color ?? '#EEF2F8';
                            return (
                              <button key={tab.key} onClick={() => setWorkspaceTab(tab.key)} style={{
                                flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                padding: '9px 14px', borderRadius: 11, border: 'none', cursor: 'pointer',
                                background: isActive ? '#0B0D1A' : 'transparent',
                                color: isActive ? col : 'rgba(238,242,248,.4)',
                                fontWeight: isActive ? 700 : 500, fontSize: '.73rem',
                                transition: 'all .15s', whiteSpace: 'nowrap',
                                boxShadow: isActive ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
                              }}
                                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.7)'; }}
                                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.4)'; }}
                              >
                                {tab.color && (
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? tab.color : 'rgba(255,255,255,.2)', flexShrink: 0, transition: 'background .15s' }} />
                                )}
                                {tab.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* ── Tab content ───────────────────────────────── */}
                        {workspaceTab === 'overview' && (
                          <TabVisaoGeral
                            evento={activeEvento}
                            edicao={activeEdicao}
                            cuTasks={cuTasks}
                            cuLoading={cuLoading}
                            onReload={load}
                            onNavigateToTab={setWorkspaceTab}
                          />
                        )}
                        {workspaceTab === 'checklist' && (
                          <TabChecklist
                            edicao={activeEdicao}
                            cuTasks={cuTasks}
                            cuLoading={cuLoading}
                            onReload={load}
                          />
                        )}
                        {workspaceTab === 'suppliers' && (
                          <TabFornecedores edicaoId={activeEdicao.id} />
                        )}
                        {(workspaceTab === 'design' || workspaceTab === 'social' || workspaceTab === 'video') && (
                          <TabItemBoard
                            key={`${activeEdicao.id}-${workspaceTab}`}
                            module={workspaceTab}
                            edicaoId={activeEdicao.id}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Modais ──────────────────────────────────────────────────────── */}
      {showNovoEvento && (
        <Modal onClose={() => setShowNovoEvento(false)} title="Novo Evento">
          <ModalField label="Nome *">
            <input className="ev-input" style={inputStyle} value={novoNome}
              onChange={e => setNovoNome(e.target.value)} placeholder="Ex: Missão Coordenação"
              autoFocus onKeyDown={e => e.key === 'Enter' && criarEvento()} />
          </ModalField>
          <ModalField label="Descrição">
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              value={novoDesc} onChange={e => setNovoDesc(e.target.value)} rows={3} placeholder="Opcional..." />
          </ModalField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <BtnGhost onClick={() => setShowNovoEvento(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={criarEvento} disabled={saving || !novoNome.trim()}>
              {saving ? 'Criando...' : 'Criar evento'}
            </BtnPrimary>
          </div>
        </Modal>
      )}

      {showNovaEdicao && (
        <Modal onClose={() => setShowNovaEdicao(false)} title="Nova Edição">
          <ModalField label="Ano *">
            <input className="ev-input" style={inputStyle} type="number" value={novoAno}
              onChange={e => setNovoAno(parseInt(e.target.value))} min={2020} max={2040} autoFocus />
          </ModalField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <BtnGhost onClick={() => setShowNovaEdicao(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={criarEdicao} disabled={saving}>
              {saving ? 'Criando...' : 'Criar edição'}
            </BtnPrimary>
          </div>
        </Modal>
      )}
    </>
  );
}
