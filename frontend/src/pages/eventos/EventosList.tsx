import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getListTasks, CUTask, getStatusStyle } from '../../lib/clickup';

// ── Tipos ──────────────────────────────────────────────────────────────
interface ChecklistItem {
  id: string; name: string; done: boolean; category: string; order_index: number;
}
interface EventoLink {
  id: string; type: string; label: string; url: string;
}
interface Edicao {
  id: string; evento_id: string; year: number;
  status: 'planejamento' | 'em_andamento' | 'concluido';
  notes: string | null; clickup_list_id: string | null;
  checklist: ChecklistItem[]; links: EventoLink[];
}
interface Evento {
  id: string; name: string; description: string | null;
  category: string | null; is_recurring: boolean; editions: Edicao[];
}

// ── Config visual ──────────────────────────────────────────────────────
const STATUS_CFG = {
  planejamento: { label: 'Planejamento', color: 'rgba(238,242,248,.45)', bg: 'rgba(255,255,255,.06)', border: 'rgba(255,255,255,.1)' },
  em_andamento: { label: 'Em andamento', color: '#3D7BFF',              bg: 'rgba(61,123,255,.1)',    border: 'rgba(61,123,255,.25)' },
  concluido:    { label: 'Concluído',    color: '#4ADE80',              bg: 'rgba(74,222,128,.1)',    border: 'rgba(74,222,128,.25)' },
};
const _CAT_LEGACY: Record<string, { label: string; color: string }> = {
  design:      { label: 'Design',      color: '#3D7BFF' },
  organizacao: { label: 'Organização', color: '#FBBF24' },
  social:      { label: 'Social',      color: '#4ADE80' },
  copy:        { label: 'Copy',        color: '#6F9BFF' },
  logistica:   { label: 'Logística',   color: '#FBBF24' },
  aprovacao:   { label: 'Aprovação',   color: '#4ADE80' },
  outro:       { label: 'Outro',       color: 'rgba(238,242,248,.3)' },
};
void _CAT_LEGACY; // mantido para referência

const TEAMS: { key: string; label: string; color: string }[] = [
  { key: 'design',      label: 'Design',      color: '#3D7BFF' },
  { key: 'organizacao', label: 'Organização', color: '#FBBF24' },
  { key: 'social',      label: 'Social',       color: '#4ADE80' },
];
const LINK_CFG: Record<string, { label: string; color: string; letter: string }> = {
  drive:  { label: 'Drive',  color: '#4ADE80', letter: 'G' },
  figma:  { label: 'Figma',  color: '#3D7BFF', letter: 'F' },
  form:   { label: 'Form',   color: '#6F9BFF', letter: 'F' },
  site:   { label: 'Site',   color: '#FBBF24', letter: 'S' },
  social: { label: 'Social', color: '#FBBF24', letter: 'S' },
  outro:  { label: 'Link',   color: 'rgba(238,242,248,.3)', letter: '↗' },
};
const LINK_TYPES  = ['drive','figma','form','site','social','outro'];

function pct(items: ChecklistItem[]) {
  if (!items.length) return 0;
  return Math.round((items.filter(i => i.done).length / items.length) * 100);
}

// ── Skeleton igual ao Dashboard ────────────────────────────────────────
function Skel({ w, h, r = 8 }: { w: number | string; h: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 100%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.8s ease-in-out infinite',
    }} />
  );
}

// ── Botão primário (idêntico ao Dashboard) ─────────────────────────────
function BtnPrimary({ onClick, children, disabled }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '9px 16px', borderRadius: 10,
      background: disabled ? 'rgba(61,123,255,.4)' : '#3D7BFF', color: '#fff',
      fontSize: '.78rem', fontWeight: 700, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'opacity .15s', flexShrink: 0,
    }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.opacity = '.85'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

// ── Botão ghost ────────────────────────────────────────────────────────
function BtnGhost({ onClick, children, disabled }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 13px', borderRadius: 8,
      border: '1px solid rgba(255,255,255,.09)', background: 'transparent',
      color: 'rgba(238,242,248,.5)', fontSize: '.75rem', fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .15s',
    }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.85)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.18)'; } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.09)'; }}
    >
      {children}
    </button>
  );
}

// ── Input premium ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 10, padding: '8px 12px', color: '#EEF2F8', fontSize: '.78rem',
  outline: 'none', width: '100%', fontFamily: 'inherit',
};

// ── Badge ──────────────────────────────────────────────────────────────
function Badge({ color, bg, border, children }: { color: string; bg: string; border: string; children: React.ReactNode }) {
  return (
    <span style={{ fontSize: '.62rem', fontWeight: 700, color, background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>
      {children}
    </span>
  );
}

// ── Componente principal ───────────────────────────────────────────────
export default function EventosList() {
  const { eventId, year } = useParams<{ eventId?: string; year?: string }>();
  const navigate = useNavigate();

  const [eventos, setEventos]   = useState<Evento[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [cuTasks, setCuTasks]   = useState<CUTask[]>([]);
  const [cuLoading, setCuLoading] = useState(false);

  const activeEvento = eventId ? (eventos.find(e => e.id === eventId) ?? eventos[0]) : eventos[0];
  const activeYear   = year ? parseInt(year) : activeEvento?.editions[0]?.year;
  const activeEdicao = activeEvento?.editions.find(e => e.year === activeYear) ?? activeEvento?.editions[0] ?? null;

  const [showNovoEvento, setShowNovoEvento] = useState(false);
  const [novoNome, setNovoNome]             = useState('');
  const [novoDesc, setNovoDesc]             = useState('');
  const [saving, setSaving]                 = useState(false);
  const [showNovaEdicao, setShowNovaEdicao] = useState(false);
  const [novoAno, setNovoAno]               = useState(new Date().getFullYear());
  const [novoItem, setNovoItem]             = useState('');
  const [novoItemCat, setNovoItemCat]       = useState('design');
  const [activeTab, setActiveTab]           = useState<string>('design');
  const [showNovoLink, setShowNovoLink]     = useState(false);
  const [novoLinkType, setNovoLinkType]     = useState('drive');
  const [novoLinkLabel, setNovoLinkLabel]   = useState('');
  const [novoLinkUrl, setNovoLinkUrl]       = useState('');

  // ── Load Supabase ────────────────────────────────────────────────────
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

  // ── CRUD ─────────────────────────────────────────────────────────────
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

  async function adicionarItem() {
    if (!activeEdicao || !novoItem.trim() || activeEdicao.clickup_list_id) return;
    const { error } = await supabase.from('evento_checklist_items')
      .insert({ edicao_id: activeEdicao.id, name: novoItem.trim(), category: novoItemCat, order_index: activeEdicao.checklist.length });
    if (error) { alert('Erro: ' + error.message); return; }
    setNovoItem(''); await load();
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

  async function adicionarLink() {
    if (!activeEdicao || !novoLinkLabel.trim() || !novoLinkUrl.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('evento_links')
      .insert({ edicao_id: activeEdicao.id, type: novoLinkType, label: novoLinkLabel.trim(), url: novoLinkUrl.trim() });
    setSaving(false);
    if (error) { alert('Erro: ' + error.message); return; }
    setShowNovoLink(false); setNovoLinkLabel(''); setNovoLinkUrl(''); await load();
  }

  async function removerLink(linkId: string) {
    await supabase.from('evento_links').delete().eq('id', linkId);
    await load();
  }

  // ── Progresso ─────────────────────────────────────────────────────────
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
  const filtered   = eventos.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const sCfg = activeEdicao ? STATUS_CFG[activeEdicao.status] : null;

  // ── Render ─────────────────────────────────────────────────────────────
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

        {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
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

        {/* ── BENTO GRID ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, alignItems: 'start' }}>

          {/* ══ PAINEL ESQUERDO — lista de eventos ══════════════════════ */}
          <div className="ev-card" style={{
            background: '#0B0D1A', borderRadius: 24, padding: '22px 20px',
            border: '1px solid rgba(255,255,255,.05)',
            display: 'flex', flexDirection: 'column', gap: 12,
            animationDelay: '0s',
            position: 'sticky', top: 80,
          }}>
            {/* Header painel */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                Todos os eventos
              </span>
              <span style={{ fontSize: '.62rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '2px 8px' }}>
                {filtered.length}
              </span>
            </div>

            {/* Search */}
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

            {/* Lista */}
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
                  const last    = ev.editions[0];
                  const active  = activeEvento?.id === ev.id;
                  const sCfgEv  = last ? STATUS_CFG[last.status] : null;
                  const hasCU   = ev.editions.some(e => e.clickup_list_id);
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
                            <span style={{ fontSize: '.5rem', fontWeight: 800, color: '#3D7BFF', background: 'rgba(61,123,255,.15)', border: '1px solid rgba(61,123,255,.25)', padding: '1px 5px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                              CU
                            </span>
                          )}
                          {ev.is_recurring && (
                            <span style={{ fontSize: '.5rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', padding: '1px 5px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                              Anual
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.3)', fontWeight: 500 }}>
                          {ev.editions.length} edição{ev.editions.length !== 1 ? 'ões' : ''}
                        </span>
                        {sCfgEv && (
                          <Badge color={sCfgEv.color} bg={sCfgEv.bg} border={sCfgEv.border}>
                            {sCfgEv.label}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })
              }
            </div>
          </div>

          {/* ══ PAINEL DIREITO — conteúdo do evento ═══════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {!activeEvento && !loading ? (
              /* Empty state */
              <div className="ev-card" style={{
                background: '#0B0D1A', borderRadius: 24, padding: '64px 32px',
                border: '1px solid rgba(255,255,255,.05)', textAlign: 'center',
                animationDelay: '.05s',
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
                {/* ── Event header ─────────────────────────────────────── */}
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
                    {/* ── Timeline de edições ──────────────────────────── */}
                    <div className="ev-card" style={{
                      background: '#0B0D1A', borderRadius: 20, padding: '20px 24px',
                      border: '1px solid rgba(255,255,255,.05)',
                      animationDelay: '.1s',
                    }}>
                      <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16 }}>
                        Edições
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 4, gap: 0 }}>
                        {[...activeEvento.editions].sort((a, b) => a.year - b.year).map((ed, i, arr) => {
                          const sel  = activeEdicao?.id === ed.id;
                          const p    = pct(ed.checklist);
                          const done = ed.status === 'concluido';
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
                                  border: `2px solid ${color}`,
                                  color, transition: 'all .15s',
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
                        {/* ── KPI row: 3 cards ─────────────────────────── */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>

                          {/* KPI 1 — Progresso (verde se >50%) */}
                          <div className="ev-card" style={{
                            borderRadius: 20, padding: '20px 22px',
                            background: progresso >= 50
                              ? 'linear-gradient(145deg, rgba(74,222,128,.09) 0%, rgba(74,222,128,.02) 50%, #0B0D1A 75%)'
                              : '#0B0D1A',
                            border: `1px solid ${progresso >= 50 ? 'rgba(74,222,128,.18)' : 'rgba(255,255,255,.05)'}`,
                            position: 'relative', overflow: 'hidden',
                            animationDelay: '.15s',
                          }}>
                            {progresso >= 50 && (
                              <div style={{ position: 'absolute', top: -40, left: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
                            )}
                            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>
                              Progresso
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-.05em', color: progresso >= 50 ? '#4ADE80' : progresso > 0 ? '#3D7BFF' : 'rgba(238,242,248,.4)', lineHeight: 1 }}>
                              {progresso}%
                            </div>
                            <div style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.3)', marginTop: 6 }}>
                              {feitos} de {totalItems} itens
                            </div>
                          </div>

                          {/* KPI 2 — Pendentes (vermelho se há pendências) */}
                          <div className="ev-card" style={{
                            borderRadius: 20, padding: '20px 22px',
                            background: pendentes > 0
                              ? 'linear-gradient(145deg, rgba(255,107,107,.09) 0%, rgba(255,107,107,.02) 50%, #0B0D1A 75%)'
                              : '#0B0D1A',
                            border: `1px solid ${pendentes > 0 ? 'rgba(255,107,107,.18)' : 'rgba(255,255,255,.05)'}`,
                            position: 'relative', overflow: 'hidden',
                            animationDelay: '.2s',
                          }}>
                            {pendentes > 0 && (
                              <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                            )}
                            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>
                              Pendentes
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-.05em', color: pendentes > 0 ? '#FF6B6B' : '#4ADE80', lineHeight: 1 }}>
                              {pendentes}
                            </div>
                            <div style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.3)', marginTop: 6 }}>
                              {pendentes === 0 ? 'Tudo concluído 🎉' : `item${pendentes !== 1 ? 's' : ''} em aberto`}
                            </div>
                          </div>

                          {/* KPI 3 — Links (neutro) */}
                          <div className="ev-card" style={{
                            borderRadius: 20, padding: '20px 22px',
                            background: '#0B0D1A', border: '1px solid rgba(255,255,255,.05)',
                            animationDelay: '.25s',
                          }}>
                            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 12 }}>
                              Links
                            </div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-.05em', color: '#EEF2F8', lineHeight: 1 }}>
                              {activeEdicao.links.length}
                            </div>
                            <div style={{ fontSize: '.68rem', color: 'rgba(238,242,248,.3)', marginTop: 6 }}>
                              {activeEdicao.links.length === 0 ? 'Nenhum ainda' : `recurso${activeEdicao.links.length !== 1 ? 's' : ''} centralizado${activeEdicao.links.length !== 1 ? 's' : ''}`}
                            </div>
                          </div>
                        </div>

                        {/* ── Barra de progresso + status ──────────────── */}
                        <div className="ev-card" style={{
                          background: '#0B0D1A', borderRadius: 20, padding: '20px 24px',
                          border: '1px solid rgba(255,255,255,.05)',
                          animationDelay: '.3s',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#EEF2F8' }}>
                                {activeEvento.name} · {activeEdicao.year}
                              </span>
                              {sCfg && <Badge color={sCfg.color} bg={sCfg.bg} border={sCfg.border}>{sCfg.label}</Badge>}
                              {isClickUp && (
                                <Badge color="#3D7BFF" bg="rgba(61,123,255,.1)" border="rgba(61,123,255,.25)">
                                  ao vivo · ClickUp
                                </Badge>
                              )}
                            </div>
                            <span style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.35)', fontWeight: 500 }}>
                              {feitos} de {totalItems} itens
                            </span>
                          </div>
                          <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                            <div style={{
                              width: `${progresso}%`, height: '100%',
                              background: progresso === 100 ? '#4ADE80' : '#3D7BFF',
                              borderRadius: 4, transition: 'width .5s ease',
                            }} />
                          </div>
                        </div>

                        {/* ── Checklist com abas por time ──────────────── */}
                        <div className="ev-card" style={{
                          background: 'linear-gradient(180deg, rgba(61,123,255,.06) 0%, rgba(61,123,255,.02) 30%, #0B0D1A 60%)',
                          borderRadius: 20, padding: '24px 26px',
                          border: '1px solid rgba(61,123,255,.12)',
                          position: 'relative', overflow: 'hidden',
                          animationDelay: '.35s',
                        }}>
                          <div style={{ position: 'absolute', top: -60, left: '20%', width: 260, height: 140, background: 'radial-gradient(ellipse, rgba(61,123,255,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

                          {/* Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#EEF2F8' }}>Checklist</span>
                              {isClickUp && <Badge color="#3D7BFF" bg="rgba(61,123,255,.1)" border="rgba(61,123,255,.25)">ClickUp</Badge>}
                            </div>
                            {isClickUp ? (
                              <a href={`https://app.clickup.com/36941541/v/l/${activeEdicao.clickup_list_id}`}
                                target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.72rem', fontWeight: 600, color: '#3D7BFF', textDecoration: 'none', opacity: .8, transition: 'opacity .15s' }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '.8')}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                                Gerenciar no ClickUp
                              </a>
                            ) : (
                              activeEdicao.checklist.length === 0 && activeEvento.editions.length > 1 && (
                                <BtnGhost onClick={copiarChecklist}>
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                  </svg>
                                  Copiar do ano anterior
                                </BtnGhost>
                              )
                            )}
                          </div>

                          {/* ── ABAS DOS TIMES ── */}
                          {!isClickUp && (
                            <>
                              {/* Tab switcher */}
                              <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: 'rgba(255,255,255,.03)', borderRadius: 12, padding: 4 }}>
                                {TEAMS.map(team => {
                                  const teamItems = activeEdicao.checklist.filter(i => i.category === team.key);
                                  const teamPct   = teamItems.length ? Math.round(teamItems.filter(i => i.done).length / teamItems.length * 100) : 0;
                                  const isActive  = activeTab === team.key;
                                  return (
                                    <button
                                      key={team.key}
                                      onClick={() => { setActiveTab(team.key); setNovoItemCat(team.key); }}
                                      style={{
                                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                                        padding: '8px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                                        background: isActive ? '#0B0D1A' : 'transparent',
                                        transition: 'all .15s',
                                        boxShadow: isActive ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? team.color : 'rgba(255,255,255,.2)', flexShrink: 0, transition: 'background .15s' }} />
                                        <span style={{ fontSize: '.72rem', fontWeight: isActive ? 700 : 500, color: isActive ? team.color : 'rgba(238,242,248,.4)', transition: 'color .15s' }}>
                                          {team.label}
                                        </span>
                                      </div>
                                      <span style={{ fontSize: '.58rem', fontWeight: 600, color: isActive ? 'rgba(238,242,248,.5)' : 'rgba(238,242,248,.2)', transition: 'color .15s' }}>
                                        {teamItems.length === 0 ? '0 itens' : `${teamPct}% · ${teamItems.length} itens`}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Barra de progresso da aba ativa */}
                              {(() => {
                                const t       = TEAMS.find(t => t.key === activeTab)!;
                                const tItems  = activeEdicao.checklist.filter(i => i.category === activeTab);
                                const tDone   = tItems.filter(i => i.done).length;
                                const tPct    = tItems.length ? Math.round(tDone / tItems.length * 100) : 0;
                                return tItems.length > 0 ? (
                                  <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                                      <span style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                                        Progresso — {t.label}
                                      </span>
                                      <span style={{ fontSize: '.7rem', fontWeight: 700, color: t.color }}>{tPct}%</span>
                                    </div>
                                    <div style={{ height: 5, background: 'rgba(255,255,255,.05)', borderRadius: 4, overflow: 'hidden' }}>
                                      <div style={{ width: `${tPct}%`, height: '100%', background: t.color, borderRadius: 4, transition: 'width .5s ease' }} />
                                    </div>
                                    <div style={{ fontSize: '.62rem', color: 'rgba(238,242,248,.2)', marginTop: 5 }}>
                                      {tDone} de {tItems.length} concluídos
                                    </div>
                                  </div>
                                ) : null;
                              })()}

                              {/* Lista filtrada pela aba */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                                {activeEdicao.checklist.filter(i => i.category === activeTab).length === 0 && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(238,242,248,.25)', fontSize: '.78rem' }}>
                                    Nenhum item para {TEAMS.find(t => t.key === activeTab)?.label ?? activeTab}.<br/>
                                    <span style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.18)' }}>Adicione abaixo.</span>
                                  </div>
                                )}
                                {activeEdicao.checklist.filter(i => i.category === activeTab).map(item => (
                                  <div key={item.id} className="ev-check-row" style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 14px', borderRadius: 12,
                                    background: item.done ? 'rgba(74,222,128,.04)' : 'rgba(255,255,255,.03)',
                                    border: `1px solid ${item.done ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.05)'}`,
                                    transition: 'background .15s',
                                  }}>
                                    <button onClick={() => toggleItem(item)} style={{
                                      width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: 'pointer',
                                      background: item.done ? '#4ADE80' : 'transparent',
                                      border: `2px solid ${item.done ? '#4ADE80' : 'rgba(255,255,255,.14)'}`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
                                    }}>
                                      {item.done && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>}
                                    </button>
                                    <span style={{ flex: 1, fontSize: '.78rem', fontWeight: 500, color: item.done ? 'rgba(238,242,248,.3)' : '#EEF2F8', textDecoration: item.done ? 'line-through' : 'none' }}>
                                      {item.name}
                                    </span>
                                    <button onClick={() => removerItem(item.id)} style={{
                                      background: 'none', border: 'none', cursor: 'pointer',
                                      color: 'rgba(238,242,248,.18)', display: 'flex', padding: 2, flexShrink: 0,
                                      transition: 'color .15s',
                                    }}
                                      onMouseEnter={e => (e.currentTarget.style.color = '#FF6B6B')}
                                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(238,242,248,.18)')}
                                    >
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                      </svg>
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Input — categoria fixada na aba ativa */}
                              <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                  className="ev-input"
                                  placeholder={`Novo item para ${TEAMS.find(t => t.key === activeTab)?.label ?? activeTab}...`}
                                  value={novoItem}
                                  onChange={e => setNovoItem(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && adicionarItem()}
                                  style={{ ...inputStyle, flex: 1 }}
                                />
                                <BtnPrimary onClick={adicionarItem} disabled={!novoItem.trim()}>Adicionar</BtnPrimary>
                              </div>
                            </>
                          )}

                          {/* ── MODO CLICKUP (sem abas — tarefas ao vivo) ── */}
                          {isClickUp && (
                            cuLoading ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[1,2,3,4,5].map(i => <Skel key={i} w="100%" h={44} r={12} />)}
                              </div>
                            ) : cuTasks.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(238,242,248,.28)', fontSize: '.78rem' }}>
                                Nenhuma tarefa encontrada nessa lista do ClickUp.
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {cuTasks.map(task => {
                                  const done = task.status.type === 'closed';
                                  const st   = getStatusStyle(task);
                                  return (
                                    <div key={task.id} className="ev-check-row" style={{
                                      display: 'flex', alignItems: 'center', gap: 10,
                                      padding: '10px 14px', borderRadius: 12,
                                      background: done ? 'rgba(74,222,128,.04)' : 'rgba(255,255,255,.03)',
                                      border: `1px solid ${done ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.05)'}`,
                                      transition: 'background .15s',
                                    }}>
                                      <div style={{
                                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                                        background: done ? '#4ADE80' : 'transparent',
                                        border: `2px solid ${done ? '#4ADE80' : 'rgba(255,255,255,.14)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      }}>
                                        {done && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>}
                                      </div>
                                      <span style={{ flex: 1, fontSize: '.78rem', fontWeight: 500, color: done ? 'rgba(238,242,248,.3)' : '#EEF2F8', textDecoration: done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {task.name}
                                      </span>
                                      <Badge color={st.color} bg={st.bg} border={`${st.color}30`}>{st.label}</Badge>
                                      <a href={task.url} target="_blank" rel="noopener noreferrer"
                                        style={{ color: 'rgba(61,123,255,.6)', display: 'flex', flexShrink: 0, transition: 'color .15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.color = '#3D7BFF')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(61,123,255,.6)')}
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
                          )}
                        </div>

                        {/* ── Links centralizados ──────────────────────── */}
                        <div className="ev-card" style={{
                          background: '#0B0D1A', borderRadius: 20, padding: '24px 26px',
                          border: '1px solid rgba(255,255,255,.05)',
                          marginBottom: 8,
                          animationDelay: '.4s',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                            <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#EEF2F8' }}>Links Centralizados</span>
                            <BtnGhost onClick={() => setShowNovoLink(true)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                              </svg>
                              Adicionar link
                            </BtnGhost>
                          </div>

                          {activeEdicao.links.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(238,242,248,.25)', fontSize: '.78rem' }}>
                              Centralize aqui Drive, Figma, fotos e formulários do evento.
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                              {activeEdicao.links.map(link => {
                                const cfg = LINK_CFG[link.type] ?? LINK_CFG.outro;
                                return (
                                  <div key={link.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 14px', borderRadius: 14,
                                    background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
                                    transition: 'border-color .15s',
                                  }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)')}
                                  >
                                    <div style={{
                                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                      background: `${cfg.color}14`, border: `1.5px solid ${cfg.color}30`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '.72rem', fontWeight: 800, color: cfg.color,
                                    }}>
                                      {cfg.letter}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#EEF2F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.label}</div>
                                      <div style={{ fontSize: '.65rem', color: 'rgba(238,242,248,.3)', marginTop: 1 }}>{cfg.label}</div>
                                    </div>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer"
                                      style={{ color: 'rgba(61,123,255,.55)', display: 'flex', flexShrink: 0, transition: 'color .15s' }}
                                      onMouseEnter={e => (e.currentTarget.style.color = '#3D7BFF')}
                                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(61,123,255,.55)')}
                                    >
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                                      </svg>
                                    </a>
                                    <button onClick={() => removerLink(link.id)} style={{
                                      background: 'none', border: 'none', cursor: 'pointer',
                                      color: 'rgba(238,242,248,.18)', display: 'flex', padding: 2, flexShrink: 0,
                                      transition: 'color .15s',
                                    }}
                                      onMouseEnter={e => (e.currentTarget.style.color = '#FF6B6B')}
                                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(238,242,248,.18)')}
                                    >
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

      {showNovoLink && (
        <Modal onClose={() => setShowNovoLink(false)} title="Adicionar Link">
          <ModalField label="Tipo">
            <select style={inputStyle} value={novoLinkType} onChange={e => setNovoLinkType(e.target.value)}>
              {LINK_TYPES.map(t => <option key={t} value={t}>{LINK_CFG[t]?.label ?? t}</option>)}
            </select>
          </ModalField>
          <ModalField label="Label *">
            <input className="ev-input" style={inputStyle} value={novoLinkLabel}
              onChange={e => setNovoLinkLabel(e.target.value)} placeholder="Ex: Fotos do evento" autoFocus />
          </ModalField>
          <ModalField label="URL *">
            <input className="ev-input" style={inputStyle} type="url" value={novoLinkUrl}
              onChange={e => setNovoLinkUrl(e.target.value)} placeholder="https://..."
              onKeyDown={e => e.key === 'Enter' && adicionarLink()} />
          </ModalField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <BtnGhost onClick={() => setShowNovoLink(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={adicionarLink} disabled={saving || !novoLinkLabel.trim() || !novoLinkUrl.trim()}>
              {saving ? 'Salvando...' : 'Salvar link'}
            </BtnPrimary>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Modal components ──────────────────────────────────────────────────
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(5,7,14,.82)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#0E1120', border: '1px solid rgba(255,255,255,.08)', borderRadius: 22,
        padding: '28px 28px', width: '100%', maxWidth: 440,
        display: 'flex', flexDirection: 'column', gap: 18,
        boxShadow: '0 32px 80px rgba(0,0,0,.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#EEF2F8', margin: 0, letterSpacing: '-.02em' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8,
            width: 28, height: 28, cursor: 'pointer', color: 'rgba(238,242,248,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EEF2F8'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.08)'; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</label>
      {children}
    </div>
  );
}
