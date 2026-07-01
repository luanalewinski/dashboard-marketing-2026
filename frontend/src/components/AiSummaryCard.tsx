import { useState } from 'react';

interface AiSummaryCardProps {
  team: string;
  summary: string;
  highlights: string[];
  risks?: string[];
}

export default function AiSummaryCard({ team, summary, highlights, risks }: AiSummaryCardProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      background: 'var(--nova-bg-elev)', border: '1px solid var(--nova-border)',
      borderRadius: '1rem', overflow: 'hidden', marginBottom: '1.5rem',
    }}>
      {/* Topbar do card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '.625rem',
        padding: '.75rem 1.125rem', borderBottom: '1px solid var(--nova-border)',
        background: 'rgba(61,123,255,.04)',
      }}>
        {/* Ícone IA */}
        <div style={{
          width: '1.5rem', height: '1.5rem', borderRadius: '.375rem', flexShrink: 0,
          background: 'rgba(61,123,255,.18)', border: '1px solid rgba(61,123,255,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--nova-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>

        <span style={{ fontSize: '.8125rem', fontWeight: 700, color: 'var(--nova-text)', flex: 1 }}>
          Resumo executivo da IA — Time {team}
        </span>

        {/* Atualização */}
        <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Atualização — {now}
        </span>

        {/* Ações */}
        <button
          title="Atualizar resumo"
          onClick={() => {}}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--nova-text-dim)', display: 'flex', padding: '.25rem' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: '1.125rem 1.25rem' }}>
        <h3 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.625rem' }}>
          Resumo Executivo
        </h3>
        <p style={{ fontSize: '.8125rem', color: 'var(--nova-text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
          {summary}
        </p>

        <h3 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.625rem' }}>
          Esforços e Iniciativas Principais
        </h3>
        <ul style={{ paddingLeft: '1.125rem', margin: 0 }}>
          {highlights.map((item, i) => (
            <li key={i} style={{ fontSize: '.8125rem', color: 'var(--nova-text-muted)', lineHeight: 1.7, marginBottom: '.25rem' }}>
              {item}
            </li>
          ))}
        </ul>

        {risks && risks.length > 0 && (
          <>
            <h3 style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--nova-text)', marginTop: '1rem', marginBottom: '.625rem' }}>
              Riscos e Atenções
            </h3>
            <ul style={{ paddingLeft: '1.125rem', margin: 0 }}>
              {risks.map((item, i) => (
                <li key={i} style={{ fontSize: '.8125rem', color: 'var(--c-warning)', lineHeight: 1.7, marginBottom: '.25rem' }}>
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Footer com feedback */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '.375rem',
        padding: '.625rem 1.25rem', borderTop: '1px solid var(--glass-brd)',
      }}>
        <span style={{ fontSize: '.6875rem', color: 'var(--nova-text-dim)', marginRight: '.25rem' }}>Este resumo foi útil?</span>
        <button
          onClick={() => setFeedback('up')}
          style={{
            background: feedback === 'up' ? 'rgba(74,222,128,.15)' : 'none',
            border: feedback === 'up' ? '1px solid rgba(74,222,128,.3)' : '1px solid transparent',
            borderRadius: '.375rem', cursor: 'pointer', padding: '.25rem .5rem',
            color: feedback === 'up' ? 'var(--c-success)' : 'var(--nova-text-dim)',
            display: 'flex', alignItems: 'center',
          }}
          aria-label="Útil"
        >
          <svg viewBox="0 0 24 24" fill={feedback === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
        </button>
        <button
          onClick={() => setFeedback('down')}
          style={{
            background: feedback === 'down' ? 'rgba(255,107,107,.12)' : 'none',
            border: feedback === 'down' ? '1px solid rgba(255,107,107,.25)' : '1px solid transparent',
            borderRadius: '.375rem', cursor: 'pointer', padding: '.25rem .5rem',
            color: feedback === 'down' ? 'var(--c-danger)' : 'var(--nova-text-dim)',
            display: 'flex', alignItems: 'center',
          }}
          aria-label="Não útil"
        >
          <svg viewBox="0 0 24 24" fill={feedback === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
