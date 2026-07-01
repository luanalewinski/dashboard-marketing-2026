import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type Mode = 'ia' | 'hibrido' | 'manual';

const MODES: { key: Mode; label: string; desc: string; color: string; bg: string }[] = [
  {
    key: 'ia',
    label: 'IA 100%',
    desc: 'A IA gerou e você apenas revisou',
    color: 'var(--nova-blue)',
    bg: 'rgba(61,123,255,.12)',
  },
  {
    key: 'hibrido',
    label: 'Híbrido',
    desc: 'IA + edição manual significativa',
    color: 'var(--c-info)',
    bg: 'rgba(111,155,255,.10)',
  },
  {
    key: 'manual',
    label: 'Manual',
    desc: 'Produção inteiramente manual',
    color: 'var(--nova-text-muted)',
    bg: 'rgba(154,166,186,.08)',
  },
];

function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function TaskClose() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('hibrido');
  const [savedMinutes, setSavedMinutes] = useState(60);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const MOCK_TASK_NAME = 'Banner principal Black Friday';

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setDone(true);
    setSaving(false);
    setTimeout(() => navigate('/dashboard'), 1200);
  };

  if (done) {
    return (
      <div style={{ maxWidth: 480, margin: '4rem auto', textAlign: 'center' }}>
        <div style={{
          width: '4rem', height: '4rem', borderRadius: '50%', margin: '0 auto 1.25rem',
          background: 'rgba(74,222,128,.12)', border: '1.5px solid rgba(74,222,128,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.375rem' }}>
          Tarefa encerrada!
        </h2>
        <p style={{ fontSize: '.875rem', color: 'var(--nova-text-muted)' }}>
          Redirecionando para o Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.25rem' }}>
          Encerrar Tarefa
        </h1>
        <p style={{ fontSize: '.875rem', color: 'var(--nova-text-muted)' }}>
          Registre como essa tarefa foi produzida para alimentar o Dashboard de IA.
        </p>
      </div>

      {/* Nome da tarefa */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <div style={{
          width: '2.25rem', height: '2.25rem', borderRadius: '.5rem', flexShrink: 0,
          background: 'rgba(61,123,255,.12)', border: '1px solid rgba(61,123,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--nova-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: '.6875rem', fontWeight: 600, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Tarefa</div>
          <div style={{ fontSize: '.9375rem', fontWeight: 600, color: 'var(--nova-text)' }}>{MOCK_TASK_NAME}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)' }}>ID: {taskId}</div>
        </div>
      </div>

      {/* Aviso mock */}
      <div style={{
        marginBottom: '1.25rem', padding: '.625rem 1rem', borderRadius: '.75rem',
        background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)',
        display: 'flex', alignItems: 'center', gap: '.5rem',
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style={{ fontSize: '.75rem', color: 'var(--c-warning)' }}>Modo demonstração — dados serão descartados após a sessão.</span>
      </div>

      {/* Card principal */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>

        {/* Seletor de modo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, color: 'var(--nova-text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.875rem' }}>
            Modo de produção
          </label>
          <div style={{ display: 'flex', gap: '.625rem' }}>
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                style={{
                  flex: 1, padding: '.875rem .5rem', borderRadius: '.875rem', cursor: 'pointer',
                  border: `1.5px solid ${mode === m.key ? m.color : 'var(--glass-brd)'}`,
                  background: mode === m.key ? m.bg : 'var(--glass)',
                  textAlign: 'center', transition: 'all .15s',
                  outline: 'none',
                }}
                aria-pressed={mode === m.key}
              >
                <div style={{ fontSize: '.875rem', fontWeight: 700, color: mode === m.key ? m.color : 'var(--nova-text-muted)', marginBottom: '.25rem' }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)', lineHeight: 1.4 }}>
                  {m.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Slider de tempo economizado */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.625rem' }}>
            <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--nova-text-muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Tempo economizado com IA
            </label>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--nova-blue)' }}>
              {formatMinutes(savedMinutes)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={480}
            step={15}
            value={savedMinutes}
            onChange={(e) => setSavedMinutes(Number(e.target.value))}
            aria-label="Tempo economizado em minutos"
            style={{ width: '100%', accentColor: 'var(--nova-blue)', cursor: 'pointer', height: '4px' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.375rem', fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}>
            <span>0 min</span>
            <span>2h</span>
            <span>4h</span>
            <span>8h</span>
          </div>

          {savedMinutes > 0 && (
            <div style={{
              marginTop: '.875rem', padding: '.75rem', borderRadius: '.625rem',
              background: 'rgba(61,123,255,.06)', border: '1px solid rgba(61,123,255,.12)',
              display: 'flex', alignItems: 'center', gap: '.5rem',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--nova-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontSize: '.8125rem', color: 'var(--nova-text-muted)' }}>
                Com <strong style={{ color: 'var(--nova-text)' }}>{formatMinutes(savedMinutes)}</strong> economizados, a equipe produziu mais rápido graças à IA.
              </span>
            </div>
          )}
        </div>

        {/* Botão salvar */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '.625rem' }}>
          <button className="btn-ghost" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button
            className="btn-blue"
            onClick={handleSave}
            disabled={saving}
            style={{ minWidth: 160, justifyContent: 'center' }}
          >
            {saving ? (
              <>
                <Spinner /> Salvando...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Encerrar tarefa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"
      style={{ animation: 'spin 1s linear infinite' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}
