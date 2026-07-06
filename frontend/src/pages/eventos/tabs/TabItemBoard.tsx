import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { getSpaceMembers, CUMember, CU } from '../../../lib/clickup';
import { EventoItem, MODULE_CFG, ITEM_STATUSES } from '../types';
import { Skel, BtnPrimary, BtnGhost, inputStyle, Modal, ModalField } from '../ui';

type ModuleKey = 'design' | 'social' | 'video';

interface Props {
  module: ModuleKey;
  edicaoId: string;
}

export default function TabItemBoard({ module, edicaoId }: Props) {
  const cfg = MODULE_CFG[module];

  const [items, setItems]       = useState<EventoItem[]>([]);
  const [members, setMembers]   = useState<CUMember[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [novoNome, setNovoNome]         = useState('');
  const [novoStatus, setNovoStatus]     = useState('a_fazer');
  const [novoPrioridade, setNovoPrior]  = useState('media');
  const [novoResp, setNovoResp]         = useState('');
  const [novoVenc, setNovoVenc]         = useState('');
  const [saving, setSaving]             = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('evento_item')
      .select('*')
      .eq('edicao_id', edicaoId)
      .eq('module', module)
      .order('order_index', { ascending: true });
    if (!error) setItems(data ?? []);
    setLoading(false);
  }, [edicaoId, module]);

  useEffect(() => { loadItems(); }, [loadItems]);

  useEffect(() => {
    getSpaceMembers(CU.SPACE_ID).then(setMembers).catch(() => {});
  }, []);

  async function criarItem() {
    if (!novoNome.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('evento_item').insert({
      edicao_id: edicaoId, module,
      name: novoNome.trim(),
      status: novoStatus,
      priority: novoPrioridade,
      responsible: novoResp || null,
      due_date: novoVenc || null,
      order_index: items.length,
    });
    setSaving(false);
    if (error) { alert('Erro: ' + error.message); return; }
    setShowModal(false);
    setNovoNome(''); setNovoStatus('a_fazer'); setNovoPrior('media'); setNovoResp(''); setNovoVenc('');
    await loadItems();
  }

  async function adicionarTemplate(name: string) {
    const { error } = await supabase.from('evento_item').insert({
      edicao_id: edicaoId, module, name, status: 'a_fazer', priority: 'media', order_index: items.length,
    });
    if (!error) await loadItems();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('evento_item').update({ status }).eq('id', id);
    await loadItems();
  }

  async function removerItem(id: string) {
    await supabase.from('evento_item').delete().eq('id', id);
    await loadItems();
  }

  const existingNames = new Set(items.map(i => i.name));
  const remainingTemplates = cfg.templates.filter(t => !existingNames.has(t));

  const statusCfg = Object.fromEntries(ITEM_STATUSES.map(s => [s.key, s]));
  const byStatus  = Object.fromEntries(ITEM_STATUSES.map(s => [s.key, items.filter(i => i.status === s.key)]));
  const total     = items.length;
  const done      = byStatus['concluido']?.length ?? 0;
  const donePct   = total ? Math.round(done / total * 100) : 0;

  const PRIORITY_COLOR: Record<string, string> = { alta: '#FF6B6B', media: '#FBBF24', baixa: 'rgba(238,242,248,.3)' };

  return (
    <>
      <div className="ev-card" style={{
        background: '#0B0D1A', borderRadius: 20, padding: '24px 26px',
        border: `1px solid ${cfg.color}18`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${cfg.color}, transparent)`, borderRadius: '20px 20px 0 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#EEF2F8' }}>{cfg.label}</span>
            <span style={{ fontSize: '.62rem', fontWeight: 700, color: cfg.color, background: `${cfg.color}14`, border: `1px solid ${cfg.color}25`, borderRadius: 20, padding: '3px 9px' }}>
              {done}/{total} concluídos
            </span>
          </div>
          <BtnGhost onClick={() => setShowModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo item
          </BtnGhost>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '.64rem', fontWeight: 600, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Progresso</span>
              <span style={{ fontSize: '.7rem', fontWeight: 700, color: cfg.color }}>{donePct}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${donePct}%`, height: '100%', background: cfg.color, borderRadius: 3, transition: 'width .5s ease', opacity: .85 }} />
            </div>
          </div>
        )}

        {/* Templates quickadd */}
        {remainingTemplates.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.2)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
              Adicionar via template
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {remainingTemplates.map(t => (
                <button key={t} onClick={() => adicionarTemplate(t)} style={{
                  fontSize: '.68rem', fontWeight: 600, padding: '4px 10px', borderRadius: 8,
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                  color: 'rgba(238,242,248,.5)', cursor: 'pointer', transition: 'all .15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = cfg.color; (e.currentTarget as HTMLElement).style.borderColor = `${cfg.color}30`; (e.currentTarget as HTMLElement).style.background = `${cfg.color}0a`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.08)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)'; }}
                >
                  + {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Item list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3].map(i => <Skel key={i} w="100%" h={48} r={12} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'rgba(238,242,248,.22)', fontSize: '.78rem' }}>
            Nenhum item ainda.<br/>
            <span style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.15)' }}>Use os templates ou adicione manualmente.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ITEM_STATUSES.map(sc => {
              const group = byStatus[sc.key] ?? [];
              if (!group.length) return null;
              return (
                <div key={sc.key}>
                  <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.2)', textTransform: 'uppercase', letterSpacing: '.1em', margin: '10px 0 6px' }}>
                    {sc.label} · {group.length}
                  </div>
                  {group.map(item => (
                    <div key={item.id} className="ev-check-row" style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 12, marginBottom: 5,
                      background: item.status === 'concluido' ? 'rgba(74,222,128,.04)' : 'rgba(255,255,255,.025)',
                      borderTop: '1px solid rgba(255,255,255,.04)',
                      borderRight: '1px solid rgba(255,255,255,.04)',
                      borderBottom: '1px solid rgba(255,255,255,.04)',
                      borderLeft: `3px solid ${PRIORITY_COLOR[item.priority] ?? 'rgba(255,255,255,.12)'}`,
                      transition: 'background .15s',
                    }}>
                      <span style={{ flex: 1, fontSize: '.78rem', fontWeight: 500, color: item.status === 'concluido' ? 'rgba(238,242,248,.3)' : '#EEF2F8', textDecoration: item.status === 'concluido' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      {item.responsible && (
                        <span style={{ fontSize: '.6rem', fontWeight: 600, color: 'rgba(238,242,248,.35)', flexShrink: 0 }}>
                          {item.responsible}
                        </span>
                      )}
                      {item.due_date && (
                        <span style={{ fontSize: '.6rem', fontWeight: 600, color: 'rgba(238,242,248,.28)', flexShrink: 0 }}>
                          {new Date(item.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      )}
                      <select
                        value={item.status}
                        onChange={e => updateStatus(item.id, e.target.value)}
                        style={{
                          fontSize: '.6rem', fontWeight: 700, padding: '2px 6px', borderRadius: 20,
                          color: statusCfg[item.status]?.color ?? '#EEF2F8',
                          background: statusCfg[item.status]?.bg ?? 'rgba(255,255,255,.06)',
                          border: `1px solid ${statusCfg[item.status]?.color ?? '#EEF2F8'}30`,
                          cursor: 'pointer', flexShrink: 0, outline: 'none',
                        }}
                      >
                        {ITEM_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
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
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI row */}
      {total > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ITEM_STATUSES.length}, 1fr)`, gap: 10 }}>
          {ITEM_STATUSES.map(sc => {
            const count = byStatus[sc.key]?.length ?? 0;
            return (
              <div key={sc.key} style={{
                background: '#0B0D1A', borderRadius: 16, padding: '14px 16px',
                border: `1px solid ${count > 0 ? sc.color + '20' : 'rgba(255,255,255,.04)'}`,
              }}>
                <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.22)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>{sc.label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: count > 0 ? sc.color : 'rgba(238,242,248,.2)', letterSpacing: '-.04em', lineHeight: 1 }}>{count}</div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)} title={`Novo item · ${cfg.label}`}>
          <ModalField label="Nome *">
            <input className="ev-input" style={inputStyle} value={novoNome}
              onChange={e => setNovoNome(e.target.value)} placeholder="Ex: KV principal"
              autoFocus onKeyDown={e => e.key === 'Enter' && criarItem()} />
          </ModalField>
          <ModalField label="Status">
            <select style={inputStyle} value={novoStatus} onChange={e => setNovoStatus(e.target.value)}>
              {ITEM_STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </ModalField>
          <ModalField label="Prioridade">
            <select style={inputStyle} value={novoPrioridade} onChange={e => setNovoPrior(e.target.value)}>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </ModalField>
          <ModalField label="Responsável">
            <select style={inputStyle} value={novoResp} onChange={e => setNovoResp(e.target.value)}>
              <option value="">— Sem responsável —</option>
              {members.map(m => (
                <option key={m.id} value={m.username}>{m.username}</option>
              ))}
            </select>
          </ModalField>
          <ModalField label="Vencimento">
            <input className="ev-input" style={inputStyle} type="date" value={novoVenc}
              onChange={e => setNovoVenc(e.target.value)} />
          </ModalField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <BtnGhost onClick={() => setShowModal(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={criarItem} disabled={saving || !novoNome.trim()}>
              {saving ? 'Criando...' : 'Criar item'}
            </BtnPrimary>
          </div>
        </Modal>
      )}
    </>
  );
}
