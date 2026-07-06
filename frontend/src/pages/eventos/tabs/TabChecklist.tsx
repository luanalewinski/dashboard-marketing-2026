import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { CUTask, getStatusStyle } from '../../../lib/clickup';
import { Edicao, TEAMS } from '../types';
import { Skel, BtnPrimary, BtnGhost, Badge, inputStyle } from '../ui';

interface Props {
  edicao: Edicao;
  cuTasks: CUTask[];
  cuLoading: boolean;
  onReload: () => Promise<void>;
}

export default function TabChecklist({ edicao, cuTasks, cuLoading, onReload }: Props) {
  const [activeTab, setActiveTab]     = useState<string>('geral');
  const [novoItem, setNovoItem]       = useState('');
  const [novoItemCat, setNovoItemCat] = useState('design');

  const isClickUp = !!edicao.clickup_list_id;

  async function adicionarItem() {
    if (!novoItem.trim() || isClickUp) return;
    const { error } = await supabase.from('evento_checklist_items')
      .insert({ edicao_id: edicao.id, name: novoItem.trim(), category: novoItemCat, order_index: edicao.checklist.length });
    if (error) { alert('Erro: ' + error.message); return; }
    setNovoItem('');
    await onReload();
  }

  async function toggleItem(id: string, done: boolean) {
    await supabase.from('evento_checklist_items').update({ done: !done }).eq('id', id);
    await onReload();
  }

  async function removerItem(id: string) {
    await supabase.from('evento_checklist_items').delete().eq('id', id);
    await onReload();
  }

  async function copiarChecklist() {
    // Finds the latest other edition for this evento (passed via edicao.evento_id)
    // We can't do that here without the parent event data — do a direct supabase query
    const { data } = await supabase
      .from('evento_edicoes')
      .select('id, year, evento_checklist_items(id,name,category,done,order_index)')
      .eq('evento_id', edicao.evento_id)
      .neq('id', edicao.id)
      .order('year', { ascending: false })
      .limit(1)
      .single();
    if (!data) return;
    const items = (data.evento_checklist_items ?? []) as { id: string; name: string; category: string; done: boolean; order_index: number }[];
    if (!items.length) return;
    const rows = items.map((i, idx) => ({
      edicao_id: edicao.id, name: i.name, category: i.category, done: false, order_index: idx,
    }));
    const { error } = await supabase.from('evento_checklist_items').insert(rows);
    if (error) { alert('Erro ao copiar: ' + error.message); return; }
    await onReload();
  }

  const cuDone = cuTasks.filter(t => t.status.type === 'closed').length;

  // ── ClickUp mode ─────────────────────────────────────────────────────
  if (isClickUp) {
    return (
      <div className="ev-card" style={{
        background: 'linear-gradient(180deg, rgba(61,123,255,.06) 0%, rgba(61,123,255,.02) 30%, #0B0D1A 60%)',
        borderRadius: 20, padding: '24px 26px',
        border: '1px solid rgba(61,123,255,.12)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, left: '20%', width: 260, height: 140, background: 'radial-gradient(ellipse, rgba(61,123,255,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#EEF2F8' }}>Checklist</span>
            <Badge color="#3D7BFF" bg="rgba(61,123,255,.1)" border="rgba(61,123,255,.25)">ao vivo · ClickUp</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.72rem', color: 'rgba(238,242,248,.35)', fontWeight: 500 }}>
              {cuDone} de {cuTasks.length} concluídas
            </span>
            <a href={`https://app.clickup.com/36941541/v/l/${edicao.clickup_list_id}`}
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
          </div>
        </div>

        {/* Progress bar */}
        {cuTasks.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 5, background: 'rgba(255,255,255,.05)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${cuTasks.length ? Math.round(cuDone / cuTasks.length * 100) : 0}%`, height: '100%',
                background: cuDone === cuTasks.length ? '#4ADE80' : '#3D7BFF',
                borderRadius: 4, transition: 'width .5s ease',
              }} />
            </div>
          </div>
        )}

        {cuLoading ? (
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
        )}
      </div>
    );
  }

  // ── Supabase checklist mode ───────────────────────────────────────────
  return (
    <div className="ev-card" style={{
      background: 'linear-gradient(180deg, rgba(61,123,255,.06) 0%, rgba(61,123,255,.02) 30%, #0B0D1A 60%)',
      borderRadius: 20, padding: '24px 26px',
      border: '1px solid rgba(61,123,255,.12)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -60, left: '20%', width: 260, height: 140, background: 'radial-gradient(ellipse, rgba(61,123,255,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#EEF2F8' }}>Checklist</span>
        {edicao.checklist.length === 0 && (
          <BtnGhost onClick={copiarChecklist}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copiar do ano anterior
          </BtnGhost>
        )}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: 'rgba(255,255,255,.03)', borderRadius: 12, padding: 4 }}>
        {/* Geral tab */}
        {(() => {
          const isGeral = activeTab === 'geral';
          const all = edicao.checklist;
          const allPct = all.length ? Math.round(all.filter(i => i.done).length / all.length * 100) : 0;
          return (
            <button onClick={() => setActiveTab('geral')} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: isGeral ? '#0B0D1A' : 'transparent', transition: 'all .15s',
              boxShadow: isGeral ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isGeral ? '#EEF2F8' : 'rgba(255,255,255,.2)', flexShrink: 0, transition: 'background .15s' }} />
                <span style={{ fontSize: '.72rem', fontWeight: isGeral ? 700 : 500, color: isGeral ? '#EEF2F8' : 'rgba(238,242,248,.4)', transition: 'color .15s' }}>
                  Geral
                </span>
              </div>
              <span style={{ fontSize: '.58rem', fontWeight: 600, color: isGeral ? 'rgba(238,242,248,.5)' : 'rgba(238,242,248,.2)' }}>
                {all.length === 0 ? '0 itens' : `${allPct}% · ${all.length} itens`}
              </span>
            </button>
          );
        })()}

        <div style={{ width: 1, background: 'rgba(255,255,255,.06)', alignSelf: 'stretch', margin: '4px 0', flexShrink: 0 }} />

        {TEAMS.map(team => {
          const teamItems = edicao.checklist.filter(i => i.category === team.key);
          const teamPct   = teamItems.length ? Math.round(teamItems.filter(i => i.done).length / teamItems.length * 100) : 0;
          const isActive  = activeTab === team.key;
          return (
            <button key={team.key} onClick={() => { setActiveTab(team.key); setNovoItemCat(team.key); }} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: isActive ? '#0B0D1A' : 'transparent', transition: 'all .15s',
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,.3)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: isActive ? team.color : 'rgba(255,255,255,.2)', flexShrink: 0, transition: 'background .15s' }} />
                <span style={{ fontSize: '.72rem', fontWeight: isActive ? 700 : 500, color: isActive ? team.color : 'rgba(238,242,248,.4)', transition: 'color .15s' }}>
                  {team.label}
                </span>
              </div>
              <span style={{ fontSize: '.58rem', fontWeight: 600, color: isActive ? 'rgba(238,242,248,.5)' : 'rgba(238,242,248,.2)' }}>
                {teamItems.length === 0 ? '0 itens' : `${teamPct}% · ${teamItems.length} itens`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      {(() => {
        if (activeTab === 'geral') {
          const all  = edicao.checklist;
          const done = all.filter(i => i.done).length;
          const gPct = all.length ? Math.round(done / all.length * 100) : 0;
          if (!all.length) return null;
          return (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: '.65rem', fontWeight: 600, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Progresso geral</span>
                <span style={{ fontSize: '.7rem', fontWeight: 700, color: '#EEF2F8' }}>{gPct}%</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ width: `${gPct}%`, height: '100%', background: gPct === 100 ? '#4ADE80' : '#3D7BFF', borderRadius: 4, transition: 'width .5s ease' }} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {TEAMS.map(team => {
                  const ti = all.filter(i => i.category === team.key);
                  const tp = ti.length ? Math.round(ti.filter(i => i.done).length / ti.length * 100) : 0;
                  return (
                    <div key={team.key} style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '.58rem', fontWeight: 700, color: team.color }}>{team.label}</span>
                        <span style={{ fontSize: '.58rem', fontWeight: 600, color: 'rgba(238,242,248,.35)' }}>{ti.length > 0 ? `${tp}%` : '—'}</span>
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,.05)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${tp}%`, height: '100%', background: team.color, borderRadius: 2, transition: 'width .5s ease', opacity: .75 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '.62rem', color: 'rgba(238,242,248,.2)', marginTop: 8 }}>
                {done} de {all.length} itens concluídos
              </div>
            </div>
          );
        }
        const t      = TEAMS.find(t => t.key === activeTab)!;
        const tItems = edicao.checklist.filter(i => i.category === activeTab);
        const tDone  = tItems.filter(i => i.done).length;
        const tPct   = tItems.length ? Math.round(tDone / tItems.length * 100) : 0;
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

      {/* Item list */}
      {(() => {
        const visibleItems = activeTab === 'geral'
          ? edicao.checklist
          : edicao.checklist.filter(i => i.category === activeTab);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {visibleItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(238,242,248,.25)', fontSize: '.78rem' }}>
                {activeTab === 'geral' ? 'Nenhum item ainda.' : `Nenhum item para ${TEAMS.find(t => t.key === activeTab)?.label ?? activeTab}.`}<br/>
                <span style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.18)' }}>Adicione abaixo.</span>
              </div>
            )}
            {visibleItems.map(item => {
              const teamCfg = TEAMS.find(t => t.key === item.category);
              return (
                <div key={item.id} className="ev-check-row" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 12,
                  background: item.done ? 'rgba(74,222,128,.04)' : 'rgba(255,255,255,.03)',
                  border: `1px solid ${item.done ? 'rgba(74,222,128,.12)' : 'rgba(255,255,255,.05)'}`,
                  transition: 'background .15s',
                }}>
                  <button onClick={() => toggleItem(item.id, item.done)} style={{
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
                  {activeTab === 'geral' && teamCfg && (
                    <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: `${teamCfg.color}14`, color: teamCfg.color, flexShrink: 0 }}>
                      {teamCfg.label}
                    </span>
                  )}
                  <button onClick={() => removerItem(item.id)} style={{
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
        );
      })()}

      {/* Add input */}
      <div style={{ display: 'flex', gap: 8 }}>
        {activeTab === 'geral' && (
          <select
            value={novoItemCat}
            onChange={e => setNovoItemCat(e.target.value)}
            style={{ ...inputStyle, width: 'auto', paddingLeft: 10, paddingRight: 10, flexShrink: 0, fontSize: '.72rem', cursor: 'pointer' }}
          >
            {TEAMS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        )}
        <input
          className="ev-input"
          placeholder={activeTab === 'geral'
            ? `Novo item para ${TEAMS.find(t => t.key === novoItemCat)?.label ?? novoItemCat}...`
            : `Novo item para ${TEAMS.find(t => t.key === activeTab)?.label ?? activeTab}...`}
          value={novoItem}
          onChange={e => setNovoItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && adicionarItem()}
          style={{ ...inputStyle, flex: 1 }}
        />
        <BtnPrimary onClick={adicionarItem} disabled={!novoItem.trim()}>Adicionar</BtnPrimary>
      </div>
    </div>
  );
}
