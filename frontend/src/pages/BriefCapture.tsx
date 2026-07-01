import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BriefCapture() {
  const navigate = useNavigate();
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (brief.trim().length < 10) {
      setError('Digite pelo menos 10 caracteres no brief.');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    navigate('/review/mock-campaign-01');
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* Header da página */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.25rem' }}>
          Nova Campanha
        </h1>
        <p style={{ fontSize: '.875rem', color: 'var(--nova-text-muted)' }}>
          Cole o brief da campanha abaixo e a IA vai estruturá-lo em tarefas priorizadas.
        </p>
      </div>

      {/* Card principal */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>

        {/* Label */}
        <label
          htmlFor="brief-input"
          style={{ display: 'block', fontSize: '.75rem', fontWeight: 600, color: 'var(--nova-text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.625rem' }}
        >
          Brief da campanha
        </label>

        {/* Textarea */}
        <textarea
          id="brief-input"
          className="nova-textarea"
          placeholder="Descreva a campanha aqui... Ex: Precisamos de uma campanha de Black Friday urgente com banner, post para redes sociais e email marketing. Se der tempo, um vídeo curto também seria bom."
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={8}
          aria-label="Texto do brief da campanha"
        />

        {/* Contador de caracteres */}
        <div style={{ textAlign: 'right', fontSize: '.6875rem', color: 'var(--nova-text-dim)', marginTop: '.375rem' }}>
          {brief.length} caracteres
        </div>

        {/* Dicas */}
        <div style={{
          marginTop: '1rem', padding: '.875rem', borderRadius: '.75rem',
          background: 'rgba(61,123,255,.06)', border: '1px solid rgba(61,123,255,.15)',
        }}>
          <p style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--nova-blue)', marginBottom: '.375rem' }}>
            Dicas para um brief melhor:
          </p>
          <ul style={{ fontSize: '.75rem', color: 'var(--nova-text-muted)', paddingLeft: '1rem', lineHeight: 1.8 }}>
            <li>Mencione datas ou prazos para que a IA os capture corretamente</li>
            <li>Use "urgente" ou "o quanto antes" para indicar alta prioridade</li>
            <li>Use "se der tempo" ou "seria bom ter" para itens opcionais</li>
          </ul>
        </div>

        {/* Erro */}
        {error && (
          <div style={{
            marginTop: '1rem', padding: '.75rem 1rem', borderRadius: '.5rem',
            background: 'rgba(255,107,107,.08)', border: '1px solid rgba(255,107,107,.25)',
            color: 'var(--c-danger)', fontSize: '.8125rem', display: 'flex', alignItems: 'center', gap: '.5rem',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Botão */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn-blue"
            onClick={handleSubmit}
            disabled={loading || brief.trim().length < 10}
            style={{ minWidth: 180, justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <Spinner /> Interpretando com IA...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
                Interpretar com IA
              </>
            )}
          </button>
        </div>
      </div>

      {/* Nota de áudio */}
      <div style={{ marginTop: '1rem', padding: '.75rem 1rem', borderRadius: '.75rem', background: 'var(--glass)', border: '1px solid var(--glass-brd)', display: 'flex', alignItems: 'center', gap: '.625rem' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ color: 'var(--nova-text-dim)', flexShrink: 0 }}>
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
        </svg>
        <span style={{ fontSize: '.75rem', color: 'var(--nova-text-dim)' }}>
          Transcrição de áudio disponível na Fase 7 — configure a <code style={{ color: 'var(--nova-text-muted)' }}>OPENAI_API_KEY</code> no <code style={{ color: 'var(--nova-text-muted)' }}>.env</code> para ativar.
        </span>
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
