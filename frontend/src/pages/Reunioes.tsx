import { useState } from 'react';
import { processMeeting, type MeetingResult, type MeetingTask } from '../lib/meetingService';

// ─── Tokens locais (mesma linguagem visual do Dashboard) ──────────────────────
const T = {
  surface:   '#0B0D14',
  surfaceEl: '#0F1219',
  border:    'rgba(255,255,255,.07)',
  text1:     '#F1F5F9',
  text2:     'rgba(241,245,249,.42)',
  text3:     'rgba(241,245,249,.22)',
  accent:    '#3D7BFF',
};

const PRI_COLOR: Record<MeetingTask['priority'], { color: string; bg: string; border: string; label: string }> = {
  alta:  { color: '#FF6B6B', bg: 'rgba(255,107,107,.07)', border: 'rgba(255,107,107,.22)', label: 'Alta'  },
  media: { color: '#FBBF24', bg: 'rgba(251,191,36,.07)',  border: 'rgba(251,191,36,.22)',  label: 'Média' },
  baixa: { color: '#6F9BFF', bg: 'rgba(111,155,255,.07)', border: 'rgba(111,155,255,.22)', label: 'Baixa' },
};

function SectionCard({ icon, title, accent, children }: {
  icon: string; title: string; accent: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: T.surface, borderRadius: 16, border: `1px solid ${T.border}`,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '16px 22px',
        borderBottom: `1px solid ${T.border}`,
        background: `linear-gradient(90deg, ${accent}08, transparent)`,
      }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <span style={{ fontSize: '.72rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '.1em' }}>{title}</span>
      </div>
      <div style={{ padding: '18px 22px' }}>{children}</div>
    </div>
  );
}

function BulletList({ items, color = T.accent }: { items: string[]; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, marginTop: 6, flexShrink: 0 }} />
          <span style={{ fontSize: '.78rem', color: T.text1, lineHeight: 1.55 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function TaskRow({ task }: { task: MeetingTask }) {
  const pri = PRI_COLOR[task.priority];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto auto',
      alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 10,
      background: T.surfaceEl, border: `1px solid ${T.border}`,
    }}>
      <span style={{ fontSize: '.78rem', fontWeight: 500, color: T.text1 }}>{task.title}</span>
      <span style={{ fontSize: '.68rem', color: T.text2 }}>{task.responsible ?? '— definir'}</span>
      <span style={{ fontSize: '.68rem', color: T.text2 }}>{task.deadline ?? '— definir'}</span>
      <span style={{
        fontSize: '.62rem', fontWeight: 700, color: pri.color,
        background: pri.bg, border: `1px solid ${pri.border}`,
        borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap',
      }}>{pri.label}</span>
    </div>
  );
}

function EventRow({ ev }: { ev: { title: string; date: string | null; type: string } }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 10,
      background: T.surfaceEl, border: `1px solid ${T.border}`,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(61,123,255,.1)', border: '1px solid rgba(61,123,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '.65rem', fontWeight: 800, color: T.accent }}>EV</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '.78rem', fontWeight: 600, color: T.text1 }}>{ev.title}</div>
        <div style={{ fontSize: '.65rem', color: T.text2, marginTop: 2 }}>{ev.type}{ev.date ? ` · ${ev.date}` : ''}</div>
      </div>
    </div>
  );
}

export default function Reunioes() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<MeetingResult | null>(null);
  const [copied, setCopied]         = useState(false);
  const [error, setError]           = useState('');

  async function handleGenerate() {
    if (transcript.trim().length < 50) {
      setError('Cole uma transcrição com pelo menos 50 caracteres.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const r = await processMeeting(transcript);
      setResult(r);
    } catch (e: any) {
      setError(e.message ?? 'Erro ao processar a transcrição.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopyAta() {
    if (!result) return;
    navigator.clipboard.writeText(result.ataFinal).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleClear() {
    setTranscript('');
    setResult(null);
    setError('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 960, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        background: T.surface, borderRadius: 22, padding: '18px 24px',
        border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div>
          <div style={{ fontSize: '.58rem', fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 3 }}>
            Reuniões · Copiloto Inteligente
          </div>
          <div style={{ fontSize: '.9rem', fontWeight: 700, color: T.text1 }}>Gerar ATA com IA</div>
          <div style={{ fontSize: '.72rem', color: T.text2, marginTop: 2 }}>
            Cole a transcrição do Granola e a IA extrai decisões, tasks e gera a ata executiva.
          </div>
        </div>
        {result && (
          <button
            onClick={handleClear}
            style={{
              marginLeft: 'auto', padding: '8px 18px', borderRadius: 10,
              border: `1px solid ${T.border}`, background: 'transparent',
              color: T.text2, fontSize: '.72rem', fontWeight: 500, cursor: 'pointer',
            }}
          >
            Nova reunião
          </button>
        )}
      </div>

      {/* Input area */}
      {!result && (
        <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '.65rem', fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '.1em' }}>
              Transcrição do Granola
            </span>
            {transcript && (
              <span style={{ fontSize: '.62rem', color: T.text3 }}>
                {transcript.trim().split(/\s+/).length} palavras
              </span>
            )}
          </div>
          <textarea
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            placeholder="Cole aqui a transcrição completa gerada pelo Granola...&#10;&#10;A IA irá ignorar conversas paralelas, piadas e cumprimentos — extraindo apenas o que realmente importa: decisões, tarefas, eventos e pontos de atenção."
            style={{
              width: '100%', minHeight: 260, padding: '16px 22px',
              background: 'transparent', border: 'none', outline: 'none', resize: 'vertical',
              color: T.text1, fontSize: '.8rem', lineHeight: 1.7,
              fontFamily: 'Sora, sans-serif', boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ padding: '0 22px 12px', fontSize: '.7rem', color: '#FF6B6B' }}>{error}</div>
          )}
          <div style={{
            padding: '14px 22px', borderTop: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
          }}>
            {transcript && (
              <button onClick={() => setTranscript('')}
                style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${T.border}`, background: 'transparent', color: T.text2, fontSize: '.72rem', cursor: 'pointer' }}>
                Limpar
              </button>
            )}
            <button
              onClick={handleGenerate}
              disabled={loading || !transcript.trim()}
              style={{
                padding: '10px 24px', borderRadius: 10, border: 'none',
                background: transcript.trim() && !loading ? T.accent : 'rgba(61,123,255,.3)',
                color: '#fff', fontSize: '.78rem', fontWeight: 700,
                cursor: transcript.trim() && !loading ? 'pointer' : 'not-allowed',
                transition: 'all .15s',
              }}
            >
              {loading ? 'Processando…' : '✦ Gerar ATA com IA'}
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>⟳</div>
          <div style={{ fontSize: '.8rem', color: T.text2 }}>A IA está analisando a transcrição…</div>
          <div style={{ fontSize: '.68rem', color: T.text3, marginTop: 4 }}>Identificando decisões, tarefas e eventos</div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Resumo Executivo */}
          <SectionCard icon="◎" title="Resumo Executivo" accent="#3D7BFF">
            <p style={{ fontSize: '.82rem', color: T.text1, lineHeight: 1.7, margin: 0 }}>
              {result.resumoExecutivo}
            </p>
          </SectionCard>

          {/* Grid: Decisões + Próximos Passos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <SectionCard icon="✓" title="Decisões Tomadas" accent="#4ADE80">
              <BulletList items={result.decisoes} color="#4ADE80" />
            </SectionCard>
            <SectionCard icon="→" title="Próximos Passos" accent="#6F9BFF">
              <BulletList items={result.proximosPassos} color="#6F9BFF" />
            </SectionCard>
          </div>

          {/* Tasks */}
          <SectionCard icon="☐" title={`Tasks Identificadas · ${result.tasks.length}`} accent="#FBBF24">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                gap: 12, padding: '0 14px', marginBottom: 4,
              }}>
                {['Tarefa', 'Responsável', 'Prazo', 'Prioridade'].map(h => (
                  <span key={h} style={{ fontSize: '.6rem', fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '.08em' }}>{h}</span>
                ))}
              </div>
              {result.tasks.map((t, i) => <TaskRow key={i} task={t} />)}
            </div>
          </SectionCard>

          {/* Grid: Eventos + Pontos de Atenção + Dúvidas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <SectionCard icon="◆" title="Eventos Citados" accent="#06B6D4">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {result.eventos.map((ev, i) => <EventRow key={i} ev={ev} />)}
              </div>
            </SectionCard>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 22px', borderBottom: `1px solid ${T.border}`,
              background: 'rgba(61,123,255,.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1rem' }}>◈</span>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  ATA Executiva Final
                </span>
              </div>
              <button
                onClick={handleCopyAta}
                style={{
                  padding: '7px 16px', borderRadius: 8,
                  border: copied ? '1px solid rgba(74,222,128,.3)' : `1px solid ${T.border}`,
                  background: copied ? 'rgba(74,222,128,.08)' : 'transparent',
                  color: copied ? '#4ADE80' : T.text2,
                  fontSize: '.7rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                }}
              >
                {copied ? '✓ Copiado!' : 'Copiar ATA'}
              </button>
            </div>
            <pre style={{
              margin: 0, padding: '22px',
              fontFamily: 'Sora, monospace', fontSize: '.72rem',
              color: T.text1, lineHeight: 1.8,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              background: 'transparent',
              maxHeight: 480, overflowY: 'auto',
            }}>
              {result.ataFinal}
            </pre>
          </div>

        </div>
      )}
    </div>
  );
}
