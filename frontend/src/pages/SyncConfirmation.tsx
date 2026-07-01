import { useNavigate, useParams } from 'react-router-dom';

const MOCK_TASKS = [
  { id: '1', name: 'Banner principal Black Friday', priority: 'alta', clickupUrl: 'https://app.clickup.com/t/mock001', subtasks: ['Versão desktop', 'Versão mobile'] },
  { id: '2', name: 'Posts para redes sociais', priority: 'alta', clickupUrl: 'https://app.clickup.com/t/mock002', subtasks: ['Instagram feed', 'Instagram stories', 'Facebook'] },
  { id: '3', name: 'Email marketing', priority: 'media', clickupUrl: 'https://app.clickup.com/t/mock003', subtasks: ['HTML do email', 'Texto de assunto', 'Teste A/B'] },
  { id: '4', name: 'Vídeo curto (Reels)', priority: 'baixa', clickupUrl: 'https://app.clickup.com/t/mock004', subtasks: ['Roteiro', 'Edição'] },
];

const PRIORITY_LABELS: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const PRIORITY_CLASSES: Record<string, string> = { alta: 'badge-alta', media: 'badge-media', baixa: 'badge-baixa' };

export default function SyncConfirmation() {
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.5rem 0 .5rem' }}>
        <div style={{
          width: '3.5rem', height: '3.5rem', borderRadius: '50%',
          background: 'rgba(74,222,128,.12)', border: '1.5px solid rgba(74,222,128,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--nova-text)', marginBottom: '.375rem' }}>
          Sincronizado com o ClickUp!
        </h1>
        <p style={{ fontSize: '.875rem', color: 'var(--nova-text-muted)', maxWidth: 480 }}>
          {MOCK_TASKS.length} tarefas foram criadas na lista <strong style={{ color: 'var(--nova-text)' }}>Campanha {campaignId?.slice(0, 6).toUpperCase()}</strong>.
          Clique em qualquer tarefa para abri-la direto no ClickUp.
        </p>
      </div>

      {/* Aviso mock */}
      <div style={{
        marginBottom: '1.25rem', padding: '.75rem 1rem', borderRadius: '.75rem',
        background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)',
        display: 'flex', alignItems: 'center', gap: '.625rem',
      }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--c-warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ flexShrink: 0 }}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span style={{ fontSize: '.75rem', color: 'var(--c-warning)' }}>
          <strong>Modo demonstração</strong> — dados mockados. Conecte o backend para sincronização real com o ClickUp.
        </span>
      </div>

      {/* Lista de tarefas criadas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
        {MOCK_TASKS.map((task, i) => (
          <div key={task.id} className="glass-card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
              {/* Número */}
              <div style={{
                width: '1.625rem', height: '1.625rem', borderRadius: '50%',
                background: 'rgba(61,123,255,.15)', border: '1px solid rgba(61,123,255,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.6875rem', fontWeight: 700, color: 'var(--nova-blue)', flexShrink: 0,
              }}>{i + 1}</div>

              {/* Nome */}
              <span style={{ flex: 1, fontSize: '.9rem', fontWeight: 600, color: 'var(--nova-text)', minWidth: 180 }}>
                {task.name}
              </span>

              {/* Badge prioridade */}
              <span className={`badge ${PRIORITY_CLASSES[task.priority]}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>

              {/* Badge synced */}
              <span className="badge badge-synced">Criada</span>

              {/* Link ClickUp */}
              <a
                href={task.clickupUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.375rem',
                  fontSize: '.75rem', color: 'var(--nova-blue)', textDecoration: 'none',
                  padding: '.25rem .625rem', borderRadius: '.375rem',
                  border: '1px solid rgba(61,123,255,.25)', background: 'rgba(61,123,255,.06)',
                  transition: 'background .15s', flexShrink: 0,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Abrir no ClickUp
              </a>
            </div>

            {/* Subtarefas */}
            {task.subtasks.length > 0 && (
              <div style={{ marginTop: '.625rem', paddingLeft: '2.375rem', display: 'flex', flexWrap: 'wrap', gap: '.375rem' }}>
                {task.subtasks.map((sub, j) => (
                  <span key={j} style={{
                    fontSize: '.6875rem', color: 'var(--nova-text-muted)',
                    padding: '.2rem .5rem', borderRadius: '.25rem',
                    background: 'rgba(255,255,255,.04)', border: '1px solid var(--glass-brd)',
                  }}>
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumo */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Tarefas criadas', value: MOCK_TASKS.length, color: 'var(--nova-blue)' },
          { label: 'Subtarefas', value: MOCK_TASKS.reduce((acc, t) => acc + t.subtasks.length, 0), color: 'var(--c-info)' },
          { label: 'Alta prioridade', value: MOCK_TASKS.filter(t => t.priority === 'alta').length, color: 'var(--c-danger)' },
        ].map((stat) => (
          <div key={stat.label}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '.6875rem', fontWeight: 600, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn-ghost" onClick={() => navigate(`/review/${campaignId}`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Voltar à revisão
        </button>
        <button className="btn-blue" onClick={() => navigate('/dashboard')} style={{ minWidth: 180, justifyContent: 'center' }}>
          Ver Dashboard
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
