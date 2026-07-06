import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { EdicaoFornecedor, Fornecedor } from '../types';
import { Skel, BtnPrimary, BtnGhost, inputStyle, Modal, ModalField } from '../ui';

interface Props {
  edicaoId: string;
}

const FORNECEDOR_CATS = ['Audiovisual', 'Buffet/Catering', 'Decoração', 'Estrutura', 'Gráfica', 'Hospedagem', 'Limpeza', 'Segurança', 'Transporte', 'Outro'];

export default function TabFornecedores({ edicaoId }: Props) {
  const [linked, setLinked]     = useState<EdicaoFornecedor[]>([]);
  const [allSupps, setAllSupps] = useState<Fornecedor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [showNew, setShowNew]   = useState(false);
  const [saving, setSaving]     = useState(false);

  // Link modal state
  const [selectedId, setSelectedId]       = useState('');
  const [linkObs, setLinkObs]             = useState('');

  // New supplier state
  const [newName, setNewName]             = useState('');
  const [newCat, setNewCat]               = useState('Outro');
  const [newContact, setNewContact]       = useState('');
  const [newWa, setNewWa]                 = useState('');
  const [newEmail, setNewEmail]           = useState('');
  const [newNotes, setNewNotes]           = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [linkedRes, allRes] = await Promise.all([
      supabase
        .from('evento_edicao_fornecedor')
        .select('id, edicao_id, fornecedor_id, observations, fornecedor:evento_fornecedor(*)')
        .eq('edicao_id', edicaoId),
      supabase
        .from('evento_fornecedor')
        .select('*')
        .eq('status', 'ativo')
        .order('name', { ascending: true }),
    ]);
    setLinked((linkedRes.data ?? []) as unknown as EdicaoFornecedor[]);
    setAllSupps(allRes.data ?? []);
    setLoading(false);
  }, [edicaoId]);

  useEffect(() => { load(); }, [load]);

  async function linkFornecedor() {
    if (!selectedId) return;
    setSaving(true);
    const { error } = await supabase.from('evento_edicao_fornecedor').insert({
      edicao_id: edicaoId,
      fornecedor_id: selectedId,
      observations: linkObs.trim() || null,
    });
    setSaving(false);
    if (error) { alert('Erro: ' + error.message); return; }
    setShowAdd(false); setSelectedId(''); setLinkObs('');
    await load();
  }

  async function criarELinkar() {
    if (!newName.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('evento_fornecedor')
      .insert({ name: newName.trim(), category: newCat, contact_name: newContact.trim() || null, whatsapp: newWa.trim() || null, email: newEmail.trim() || null, notes: newNotes.trim() || null })
      .select('id').single();
    if (error) { setSaving(false); alert('Erro: ' + error.message); return; }
    const { error: e2 } = await supabase.from('evento_edicao_fornecedor').insert({
      edicao_id: edicaoId, fornecedor_id: data.id,
    });
    setSaving(false);
    if (e2) { alert('Fornecedor criado, mas erro ao vincular: ' + e2.message); return; }
    setShowNew(false);
    setNewName(''); setNewCat('Outro'); setNewContact(''); setNewWa(''); setNewEmail(''); setNewNotes('');
    await load();
  }

  async function desvincular(id: string) {
    await supabase.from('evento_edicao_fornecedor').delete().eq('id', id);
    await load();
  }

  const unlinkedSupps = allSupps.filter(s => !linked.some(l => l.fornecedor_id === s.id));

  return (
    <>
      <div className="ev-card" style={{
        background: '#0B0D1A', borderRadius: 20, padding: '24px 26px',
        border: '1px solid rgba(255,255,255,.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.875rem', fontWeight: 700, color: '#EEF2F8' }}>Fornecedores</span>
            {linked.length > 0 && (
              <span style={{ fontSize: '.62rem', fontWeight: 700, color: '#FBBF24', background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.2)', borderRadius: 20, padding: '3px 9px' }}>
                {linked.length} vinculado{linked.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnGhost onClick={() => setShowNew(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Novo fornecedor
            </BtnGhost>
            {unlinkedSupps.length > 0 && (
              <BtnGhost onClick={() => setShowAdd(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Vincular existente
              </BtnGhost>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <Skel key={i} w="100%" h={64} r={14} />)}
          </div>
        ) : linked.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(238,242,248,.25)', fontSize: '.78rem' }}>
            Nenhum fornecedor vinculado a esta edição.<br/>
            <span style={{ fontSize: '.7rem', color: 'rgba(238,242,248,.16)' }}>Crie um novo ou vincule um existente.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {linked.map(lf => {
              const f = lf.fornecedor;
              return (
                <div key={lf.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 16px', borderRadius: 16,
                  background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)',
                  transition: 'border-color .15s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)')}
                >
                  {/* Avatar inicial */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: 'rgba(251,191,36,.1)', border: '1.5px solid rgba(251,191,36,.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.78rem', fontWeight: 800, color: '#FBBF24',
                  }}>
                    {f.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: '.83rem', fontWeight: 700, color: '#EEF2F8' }}>{f.name}</span>
                      {f.category && (
                        <span style={{ fontSize: '.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: 'rgba(255,255,255,.05)', color: 'rgba(238,242,248,.4)', border: '1px solid rgba(255,255,255,.07)' }}>
                          {f.category}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {f.contact_name && (
                        <span style={{ fontSize: '.67rem', color: 'rgba(238,242,248,.4)' }}>
                          {f.contact_name}
                        </span>
                      )}
                      {f.whatsapp && (
                        <a href={`https://wa.me/${f.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '.67rem', color: '#4ADE80', textDecoration: 'none' }}>
                          WA: {f.whatsapp}
                        </a>
                      )}
                      {f.email && (
                        <a href={`mailto:${f.email}`} style={{ fontSize: '.67rem', color: '#3D7BFF', textDecoration: 'none' }}>
                          {f.email}
                        </a>
                      )}
                    </div>
                    {lf.observations && (
                      <div style={{ fontSize: '.67rem', color: 'rgba(238,242,248,.3)', marginTop: 5, fontStyle: 'italic' }}>
                        "{lf.observations}"
                      </div>
                    )}
                  </div>

                  <button onClick={() => desvincular(lf.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
                    color: 'rgba(238,242,248,.18)', display: 'flex', padding: 4, transition: 'color .15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FF6B6B')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(238,242,248,.18)')}
                    title="Desvincular desta edição"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Vincular existente */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Vincular Fornecedor">
          <ModalField label="Fornecedor *">
            <select style={inputStyle} value={selectedId} onChange={e => setSelectedId(e.target.value)} autoFocus>
              <option value="">— Selecione —</option>
              {unlinkedSupps.map(s => (
                <option key={s.id} value={s.id}>{s.name}{s.category ? ` · ${s.category}` : ''}</option>
              ))}
            </select>
          </ModalField>
          <ModalField label="Observações para esta edição">
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
              value={linkObs} onChange={e => setLinkObs(e.target.value)}
              placeholder="Ex: Confirmar cardápio em jan/25" rows={2} />
          </ModalField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <BtnGhost onClick={() => setShowAdd(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={linkFornecedor} disabled={saving || !selectedId}>
              {saving ? 'Vinculando...' : 'Vincular'}
            </BtnPrimary>
          </div>
        </Modal>
      )}

      {/* Modal: Novo fornecedor */}
      {showNew && (
        <Modal onClose={() => setShowNew(false)} title="Novo Fornecedor">
          <ModalField label="Nome *">
            <input className="ev-input" style={inputStyle} value={newName}
              onChange={e => setNewName(e.target.value)} placeholder="Ex: GraficaX"
              autoFocus onKeyDown={e => e.key === 'Enter' && criarELinkar()} />
          </ModalField>
          <ModalField label="Categoria">
            <select style={inputStyle} value={newCat} onChange={e => setNewCat(e.target.value)}>
              {FORNECEDOR_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </ModalField>
          <ModalField label="Contato">
            <input className="ev-input" style={inputStyle} value={newContact}
              onChange={e => setNewContact(e.target.value)} placeholder="Nome do responsável" />
          </ModalField>
          <ModalField label="WhatsApp">
            <input className="ev-input" style={inputStyle} value={newWa}
              onChange={e => setNewWa(e.target.value)} placeholder="5511999999999" />
          </ModalField>
          <ModalField label="E-mail">
            <input className="ev-input" style={inputStyle} type="email" value={newEmail}
              onChange={e => setNewEmail(e.target.value)} placeholder="contato@fornecedor.com" />
          </ModalField>
          <ModalField label="Notas">
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 56 }}
              value={newNotes} onChange={e => setNewNotes(e.target.value)}
              placeholder="Informações adicionais..." rows={2} />
          </ModalField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <BtnGhost onClick={() => setShowNew(false)}>Cancelar</BtnGhost>
            <BtnPrimary onClick={criarELinkar} disabled={saving || !newName.trim()}>
              {saving ? 'Criando...' : 'Criar e vincular'}
            </BtnPrimary>
          </div>
        </Modal>
      )}
    </>
  );
}
