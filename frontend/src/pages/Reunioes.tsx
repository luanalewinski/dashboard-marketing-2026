import { useState, useEffect } from 'react';
import { processMeeting, type MeetingResult, type MeetingTask } from '../lib/meetingService';
import { listMeetings, saveMeeting, deleteMeeting, type SavedMeeting } from '../lib/meetingStorage';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T = {
  surface:   '#0B0D14',
  surfaceEl: '#0F1219',
  border:    'rgba(255,255,255,.07)',
  text1:     '#F1F5F9',
  text2:     'rgba(241,245,249,.42)',
  text3:     'rgba(241,245,249,.22)',
  accent:    '#3D7BFF',
};

const PRI: Record<MeetingTask['priority'], { color: string; bg: string; border: string; label: string }> = {
  alta:  { color: '#FF6B6B', bg: 'rgba(255,107,107,.07)', border: 'rgba(255,107,107,.22)', label: 'Alta'  },
  media: { color: '#FBBF24', bg: 'rgba(251,191,36,.07)',  border: 'rgba(251,191,36,.22)',  label: 'Média' },
  baixa: { color: '#6F9BFF', bg: 'rgba(111,155,255,.07)', border: 'rgba(111,155,255,.22)', label: 'Baixa' },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Sub-componentes de resultado ─────────────────────────────────────────────
function SectionCard({ icon, title, accent, children }: { icon: string; title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: `1px solid ${T.border}`, background: `linear-gradient(90deg, ${accent}08, transparent)` }}>
        <span style={{ fontSize: '.95rem' }}>{icon}</span>
        <span style={{ fontSize: '.68rem', fontWeight: 700, color: accent, textTransform: 'uppercase' as const, letterSpacing: '.1em' }}>{title}</span>
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

function BulletList({ items, color = T.accent }: { items: string[]; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, marginTop: 6, flexShrink: 0 }} />
          <span style={{ fontSize: '.76rem', color: T.text1, lineHeight: 1.6 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function TaskRow({ task }: { task: MeetingTask }) {
  const pri = PRI[task.priority];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 10, background: T.surfaceEl, border: `1px solid ${T.border}` }}>
      <span style={{ fontSize: '.76rem', fontWeight: 500, color: T.text1 }}>{task.title}</span>
      <span style={{ fontSize: '.66rem', color: T.text2 }}>{task.responsible ?? '— definir'}</span>
      <span style={{ fontSize: '.66rem', color: T.text2 }}>{task.deadline ?? '— definir'}</span>
      <span style={{ fontSize: '.6rem', fontWeight: 700, color: pri.color, background: pri.bg, border: `1px solid ${pri.border}`, borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap' as const }}>{pri.label}</span>
    </div>
  );
}

// ─── Painel de resultado ───────────────────────────────────────────────────────
function ResultView({ result, onCopyAta }: { result: MeetingResult; onCopyAta: () => void; copied: boolean }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(result.ataFinal).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    onCopyAta();
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
      <SectionCard icon="◎" title="Resumo Executivo" accent="#3D7BFF">
        <p style={{ fontSize: '.8rem', color: T.text1, lineHeight: 1.7, margin: 0 }}>{result.resumoExecutivo}</p>
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <SectionCard icon="✓" title="Decisões Tomadas" accent="#4ADE80">
          <BulletList items={result.decisoes} color="#4ADE80" />
        </SectionCard>
        <SectionCard icon="→" title="Próximos Passos" accent="#6F9BFF">
          <BulletList items={result.proximosPassos} color="#6F9BFF" />
        </SectionCard>
      </div>

      <SectionCard icon="☐" title={`Tasks Identificadas · ${result.tasks.length}`} accent="#FBBF24">
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 12, padding: '0 12px', marginBottom: 4 }}>
            {['Tarefa', 'Responsável', 'Prazo', 'Prioridade'].map(h => (
              <span key={h} style={{ fontSize: '.58rem', fontWeight: 700, color: T.text3, textTransform: 'uppercase' as const, letterSpacing: '.08em' }}>{h}</span>
            ))}
          </div>
          {result.tasks.map((t, i) => <TaskRow key={i} task={t} />)}
        </div>
      </SectionCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <SectionCard icon="◆" title="Eventos Citados" accent="#06B6D4">
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 7 }}>
            {result.eventos.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: T.surfaceEl, border: `1px solid ${T.border}` }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(6,182,212,.1)', border: '1px solid rgba(6,182,212,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '.58rem', fontWeight: 800, color: '#06B6D4' }}>EV</span>
                </div>
                <div>
                  <div style={{ fontSize: '.76rem', fontWeight: 600, color: T.text1 }}>{ev.title}</div>
                  <div style={{ fontSize: '.63rem', color: T.text2, marginTop: 1 }}>{ev.type}{ev.date ? ` · ${ev.date}` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
          <SectionCard icon="⚠" title="Pontos de Atenção" accent="#FF6B6B">
            <BulletList items={result.pontosDeAtencao} color="#FF6B6B" />
          </SectionCard>
          <SectionCard icon="?" title="Dúvidas Pendentes" accent="#FBBF24">
            <BulletList items={result.duvidasPendentes} color="#FBBF24" />
          </SectionCard>
        </div>
      </div>

      {/* ATA Final */}
      <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${T.border}`, background: 'rgba(61,123,255,.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.95rem' }}>◈</span>
            <span style={{ fontSize: '.68rem', fontWeight: 700, color: T.accent, textTransform: 'uppercase' as const, letterSpacing: '.1em' }}>ATA Executiva Final</span>
          </div>
          <button onClick={copy} style={{ padding: '6px 14px', borderRadius: 8, border: copied ? '1px solid rgba(74,222,128,.3)' : `1px solid ${T.border}`, background: copied ? 'rgba(74,222,128,.08)' : 'transparent', color: copied ? '#4ADE80' : T.text2, fontSize: '.68rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
            {copied ? '✓ Copiado!' : 'Copiar ATA'}
          </button>
        </div>
        <pre style={{ margin: 0, padding: '20px', fontFamily: 'Sora, monospace', fontSize: '.7rem', color: T.text1, lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'transparent', maxHeight: 440, overflowY: 'auto' }}>
          {result.ataFinal}
        </pre>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Reunioes() {
  const [view, setView] = useState<'new' | 'history'>('new');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<MeetingResult | null>(null);
  const [error, setError]           = useState('');
  const [saved, setSaved]           = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [history, setHistory]       = useState<SavedMeeting[]>([]);
  const [viewingId, setViewingId]   = useState<string | null>(null);

  useEffect(() => { setHistory(listMeetings()); }, []);

  function refreshHistory() { setHistory(listMeetings()); }

  async function handleGenerate() {
    if (transcript.trim().length < 50) { setError('Cole uma transcrição com pelo menos 50 caracteres.'); return; }
    setError(''); setLoading(true); setSaved(false); setMeetingTitle('');
    try {
      const r = await processMeeting(transcript);
      setResult(r);
    } catch (e: any) {
      setError(e.message ?? 'Erro ao processar a transcrição.');
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!result) return;
    saveMeeting(transcript, result, meetingTitle);
    setSaved(true);
    refreshHistory();
  }

  function handleNew() {
    setTranscript(''); setResult(null); setError(''); setSaved(false); setMeetingTitle('');
  }

  function handleDelete(id: string) {
    deleteMeeting(id);
    refreshHistory();
    if (viewingId === id) setViewingId(null);
  }

  const viewing = viewingId ? history.find(m => m.id === viewingId) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14, maxWidth: 980, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: T.surface, borderRadius: 22, padding: '16px 22px', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.57rem', fontWeight: 700, color: T.text3, textTransform: 'uppercase' as const, letterSpacing: '.12em', marginBottom: 2 }}>Reuniões · Copiloto Inteligente</div>
          <div style={{ fontSize: '.88rem', fontWeight: 700, color: T.text1 }}>Gerar ATA com IA</div>
        </div>
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,.03)', border: `1px solid ${T.border}`, borderRadius: 10, padding: 3 }}>
          {(['new', 'history'] as const).map(tab => {
            const active = view === tab;
            const label = tab === 'new' ? 'Nova reunião' : `Histórico${history.length ? ` · ${history.length}` : ''}`;
            return (
              <button key={tab} onClick={() => setView(tab)} style={{ padding: '6px 16px', borderRadius: 7, border: active ? `1px solid rgba(255,255,255,.1)` : '1px solid transparent', background: active ? 'rgba(255,255,255,.07)' : 'transparent', color: active ? T.text1 : T.text2, fontSize: '.72rem', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all .12s' }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ABA: Nova reunião ── */}
      {view === 'new' && (
        <>
          {/* Input area */}
          {!result && (
            <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '.63rem', fontWeight: 700, color: T.text3, textTransform: 'uppercase' as const, letterSpacing: '.1em' }}>Transcrição do Granola</span>
                {transcript && <span style={{ fontSize: '.6rem', color: T.text3 }}>{transcript.trim().split(/\s+/).length} palavras</span>}
              </div>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder={"Cole aqui a transcrição completa gerada pelo Granola...\n\nA IA irá ignorar conversas paralelas, piadas e cumprimentos — extraindo apenas decisões, tarefas, eventos e pontos de atenção."}
                style={{ width: '100%', minHeight: 240, padding: '14px 20px', background: 'transparent', border: 'none', outline: 'none', resize: 'vertical', color: T.text1, fontSize: '.78rem', lineHeight: 1.7, fontFamily: 'Sora, sans-serif', boxSizing: 'border-box' as const }}
              />
              {error && <div style={{ padding: '0 20px 10px', fontSize: '.68rem', color: '#FF6B6B' }}>{error}</div>}
              <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                {transcript && <button onClick={() => setTranscript('')} style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', color: T.text2, fontSize: '.7rem', cursor: 'pointer' }}>Limpar</button>}
                <button onClick={handleGenerate} disabled={loading || !transcript.trim()} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: transcript.trim() && !loading ? T.accent : 'rgba(61,123,255,.3)', color: '#fff', fontSize: '.76rem', fontWeight: 700, cursor: transcript.trim() && !loading ? 'pointer' : 'not-allowed', transition: 'all .15s' }}>
                  {loading ? 'Processando…' : '✦ Gerar ATA com IA'}
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: '40px 24px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '.8rem', color: T.text2, marginBottom: 4 }}>A IA está analisando a transcrição…</div>
              <div style={{ fontSize: '.66rem', color: T.text3 }}>Identificando decisões, tarefas e eventos</div>
            </div>
          )}

          {/* Result + Save bar */}
          {result && !loading && (
            <>
              {/* Barra de salvar */}
              <div style={{ background: T.surface, borderRadius: 14, border: saved ? '1px solid rgba(74,222,128,.25)' : `1px solid ${T.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                {!saved ? (
                  <>
                    <input
                      value={meetingTitle}
                      onChange={e => setMeetingTitle(e.target.value)}
                      placeholder="Título da reunião (opcional)…"
                      style={{ flex: 1, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 12px', color: T.text1, fontSize: '.76rem', fontFamily: 'Sora, sans-serif', outline: 'none' }}
                    />
                    <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid rgba(74,222,128,.3)', background: 'rgba(74,222,128,.1)', color: '#4ADE80', fontSize: '.74rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                      Salvar reunião
                    </button>
                    <button onClick={handleNew} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', color: T.text2, fontSize: '.72rem', cursor: 'pointer' }}>
                      Nova reunião
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', flexShrink: 0 }} />
                    <span style={{ fontSize: '.76rem', color: '#4ADE80', fontWeight: 600 }}>Reunião salva no histórico</span>
                    <button onClick={handleNew} style={{ marginLeft: 'auto', padding: '7px 16px', borderRadius: 8, border: `1px solid ${T.border}`, background: 'transparent', color: T.text2, fontSize: '.72rem', cursor: 'pointer' }}>
                      Nova reunião
                    </button>
                  </>
                )}
              </div>

              <ResultView result={result} onCopyAta={() => {}} copied={false} />
            </>
          )}
        </>
      )}

      {/* ── ABA: Histórico ── */}
      {view === 'history' && (
        <div style={{ display: 'grid', gridTemplateColumns: viewing ? '280px 1fr' : '1fr', gap: 12, alignItems: 'start' }}>

          {/* Lista */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
            {history.length === 0 ? (
              <div style={{ background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`, padding: '32px 24px', textAlign: 'center' as const }}>
                <div style={{ fontSize: '.78rem', color: T.text2, marginBottom: 4 }}>Nenhuma reunião salva ainda</div>
                <div style={{ fontSize: '.66rem', color: T.text3 }}>Gere uma ATA e clique em "Salvar reunião"</div>
              </div>
            ) : history.map(m => {
              const active = viewingId === m.id;
              return (
                <div key={m.id} style={{ background: T.surface, borderRadius: 14, border: active ? `1px solid rgba(61,123,255,.35)` : `1px solid ${T.border}`, padding: '14px 16px', cursor: 'pointer', transition: 'border-color .15s', position: 'relative' as const }}
                  onClick={() => setViewingId(active ? null : m.id)}>
                  <div style={{ fontSize: '.74rem', fontWeight: 600, color: T.text1, marginBottom: 4, paddingRight: 24 }}>{m.title}</div>
                  <div style={{ fontSize: '.62rem', color: T.text3 }}>{fmtDate(m.savedAt)}</div>
                  <div style={{ fontSize: '.6rem', color: T.text2, marginTop: 4 }}>{m.result.tasks.length} tasks · {m.result.decisoes.length} decisões</div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(m.id); }}
                    style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 6, border: `1px solid ${T.border}`, background: 'transparent', color: T.text3, fontSize: '.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                    title="Excluir"
                  >×</button>
                </div>
              );
            })}
          </div>

          {/* Detalhe */}
          {viewing && (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, color: T.text1 }}>{viewing.title}</div>
                  <div style={{ fontSize: '.62rem', color: T.text3, marginTop: 2 }}>{fmtDate(viewing.savedAt)}</div>
                </div>
                <button onClick={() => setViewingId(null)} style={{ padding: '5px 12px', borderRadius: 7, border: `1px solid ${T.border}`, background: 'transparent', color: T.text2, fontSize: '.68rem', cursor: 'pointer' }}>Fechar</button>
              </div>
              <ResultView result={viewing.result} onCopyAta={() => {}} copied={false} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
