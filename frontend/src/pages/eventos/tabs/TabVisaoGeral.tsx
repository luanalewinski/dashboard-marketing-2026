import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { CUTask } from '../../../lib/clickup';
import { Evento, Edicao, TEAMS, STATUS_CFG, LINK_CFG, LINK_TYPES, MODULE_CFG, WorkTab, pct } from '../types';
import { Skel, BtnGhost, Badge, inputStyle, Modal, ModalField } from '../ui';

interface Props {
  evento: Evento;
  edicao: Edicao;
  cuTasks: CUTask[];
  cuLoading?: boolean;
  onReload: () => Promise<void>;
  onNavigateToTab: (tab: WorkTab) => void;
}

interface ModuleSummary { module: string; total: number; done: number }

export default function TabVisaoGeral({ evento, edicao, cuTasks, onReload, onNavigateToTab }: Props) {
  const [moduleSummary, setModuleSummary] = useState<ModuleSummary[]>([]);
  const [fornCount, setFornCount]         = useState<number | null>(null);
  const [loadingStats, setLoadingStats]   = useState(true);
  const [showNovoLink, setShowNovoLink]   = useState(false);
  const [novoLinkType, setNovoLinkType]   = useState('drive');
  const [novoLinkLabel, setNovoLinkLabel] = useState('');
  const [novoLinkUrl, setNovoLinkUrl]     = useState('');
  const [saving, setSaving]               = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingStats(true);
      const [itemsRes, fornRes] = await Promise.all([
        supabase.from('evento_item').select('module, status').eq('edicao_id', edicao.id),
        supabase.from('evento_edicao_fornecedor').select('id', { count: 'exact', head: true }).eq('edicao_id', edicao.id),
      ]);
      if (itemsRes.data) {
        const groups = ['design','social','video'].map(m => {
          const mItems = itemsRes.data.filter(i => i.module === m);
          return { module: m, total: mItems.length, done: mItems.filter(i => i.status === 'concluido').length };
        });
        setModuleSummary(groups);
      }
      setFornCount(fornRes.count ?? 0);
      setLoadingStats(false);
    })();
  }, [edicao.id]);

  async function adicionarLink() {
    if (!novoLinkLabel.trim() || !novoLinkUrl.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('evento_links')
      .insert({ edicao_id: edicao.id, type: novoLinkType, label: novoLinkLabel.trim(), url: novoLinkUrl.trim() });
    setSaving(false);
    if (error) { alert('Erro: ' + error.message); return; }
    setShowNovoLink(false); setNovoLinkLabel(''); setNovoLinkUrl('');
    await onReload();
  }

  async function removerLink(linkId: string) {
    await supabase.from('evento_links').delete().eq('id', linkId);
    await onReload();
  }

  const isClickUp = !!edicao.clickup_list_id;
  const cuDone    = cuTasks.filter(t => t.status.type === 'closed').length;
  const checkPct  = isClickUp
    ? (cuTasks.length ? Math.round(cuDone / cuTasks.length * 100) : 0)
    : pct(edicao.checklist);
  const checkTotal = isClickUp ? cuTasks.length : edicao.checklist.length;
  const checkDone  = isClickUp ? cuDone : edicao.checklist.filter(i => i.done).length;

  const sCfg = STATUS_CFG[edicao.status];

  return (
    <>
      {/* ── Status + progresso geral ─── */}
      <div className="ev-card" style={{
        background: checkPct >= 50
          ? 'linear-gradient(145deg, rgba(74,222,128,.08) 0%, rgba(74,222,128,.02) 50%, #0B0D1A 75%)'
          : '#0B0D1A',
        borderRadius: 20, padding: '22px 26px',
        border: `1px solid ${checkPct >= 50 ? 'rgba(74,222,128,.16)' : 'rgba(255,255,255,.05)'}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${checkPct >= 50 ? 'rgba(74,222,128,.07)' : 'rgba(61,123,255,.07)'} 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#EEF2F8' }}>
              {evento.name} · {edicao.year}
            </span>
            <Badge color={sCfg.color} bg={sCfg.bg} border={sCfg.border}>{sCfg.label}</Badge>
            {isClickUp && <Badge color="#3D7BFF" bg="rgba(61,123,255,.1)" border="rgba(61,123,255,.25)">ao vivo · ClickUp</Badge>}
          </div>
          <span style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.35)', fontWeight: 500 }}>
            {checkDone} de {checkTotal} itens
          </span>
        </div>

        <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,.05)', overflow: 'hidden', marginBottom: 12 }}>
          <div style={{
            width: `${checkPct}%`, height: '100%',
            background: checkPct === 100 ? '#4ADE80' : '#3D7BFF',
            borderRadius: 4, transition: 'width .5s ease',
          }} />
        </div>

        {/* Team mini-bars (only for Supabase checklist) */}
        {!isClickUp && edicao.checklist.length > 0 && (
          <div style={{ display: 'flex', gap: 10 }}>
            {TEAMS.map(team => {
              const ti = edicao.checklist.filter(i => i.category === team.key);
              const tp = ti.length ? Math.round(ti.filter(i => i.done).length / ti.length * 100) : 0;
              return (
                <div key={team.key} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '.58rem', fontWeight: 700, color: team.color }}>{team.label}</span>
                    <span style={{ fontSize: '.58rem', color: 'rgba(238,242,248,.3)' }}>{ti.length > 0 ? `${tp}%` : '—'}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,.05)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${tp}%`, height: '100%', background: team.color, borderRadius: 2, transition: 'width .5s ease', opacity: .7 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Módulos e fornecedores ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Módulos */}
        <div className="ev-card" style={{ background: '#0B0D1A', borderRadius: 20, padding: '22px 24px', border: '1px solid rgba(255,255,255,.05)' }}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14 }}>
            Módulos de produção
          </div>
          {loadingStats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => <Skel key={i} w="100%" h={40} r={10} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {moduleSummary.map(m => {
                const cfg  = MODULE_CFG[m.module as keyof typeof MODULE_CFG];
                const mPct = m.total ? Math.round(m.done / m.total * 100) : 0;
                const tab  = m.module as WorkTab;
                return (
                  <button key={m.module} onClick={() => onNavigateToTab(tab)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 12,
                    background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.05)',
                    cursor: 'pointer', transition: 'all .15s', textAlign: 'left',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.025)'; }}
                  >
                    <div style={{ width: 6, height: 32, borderRadius: 3, background: cfg.color, flexShrink: 0, opacity: m.total > 0 ? 1 : .3 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '.73rem', fontWeight: 600, color: '#EEF2F8' }}>{cfg.label}</span>
                        <span style={{ fontSize: '.65rem', fontWeight: 700, color: cfg.color }}>
                          {m.total > 0 ? `${mPct}%` : '—'}
                        </span>
                      </div>
                      {m.total > 0 ? (
                        <div style={{ height: 3, background: 'rgba(255,255,255,.05)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${mPct}%`, height: '100%', background: cfg.color, borderRadius: 2, opacity: .75 }} />
                        </div>
                      ) : (
                        <div style={{ fontSize: '.6rem', color: 'rgba(238,242,248,.2)' }}>Nenhum item</div>
                      )}
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ color: 'rgba(238,242,248,.2)', flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Fornecedores */}
        <div className="ev-card" style={{ background: '#0B0D1A', borderRadius: 20, padding: '22px 24px', border: '1px solid rgba(255,255,255,.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14 }}>
            Fornecedores
          </div>
          {loadingStats ? (
            <Skel w="100%" h={60} r={12} />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: fornCount ? '#FBBF24' : 'rgba(238,242,248,.2)', letterSpacing: '-.05em', lineHeight: 1 }}>
                {fornCount ?? 0}
              </div>
              <div style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.35)', marginTop: 6 }}>
                {fornCount ? `fornecedor${fornCount !== 1 ? 'es' : ''} nesta edição` : 'Nenhum vinculado'}
              </div>
            </div>
          )}
          <button onClick={() => onNavigateToTab('suppliers')} style={{
            marginTop: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 10,
            background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.15)',
            color: '#FBBF24', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(251,191,36,.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(251,191,36,.08)'; }}
          >
            Gerenciar fornecedores
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Links centralizados ─────── */}
      <div className="ev-card" style={{
        background: '#0B0D1A', borderRadius: 20, padding: '24px 26px',
        border: '1px solid rgba(255,255,255,.05)',
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

        {edicao.links.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(238,242,248,.25)', fontSize: '.78rem' }}>
            Centralize aqui Drive, Figma, fotos e formulários do evento.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {edicao.links.map(link => {
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
                    color: 'rgba(238,242,248,.18)', display: 'flex', padding: 2, flexShrink: 0, transition: 'color .15s',
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
            <button onClick={adicionarLink} disabled={saving || !novoLinkLabel.trim() || !novoLinkUrl.trim()} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '9px 16px', borderRadius: 10,
              background: (saving || !novoLinkLabel.trim() || !novoLinkUrl.trim()) ? 'rgba(61,123,255,.4)' : '#3D7BFF',
              color: '#fff', fontSize: '.78rem', fontWeight: 700, border: 'none',
              cursor: (saving || !novoLinkLabel.trim() || !novoLinkUrl.trim()) ? 'not-allowed' : 'pointer',
            }}>
              {saving ? 'Salvando...' : 'Salvar link'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
