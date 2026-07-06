interface Props {
  editMode: boolean;
  hiddenCount: number;
  onEnter: () => void;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
  hiddenLabels: { id: string; label: string }[];
  onRestore: (id: string) => void;
}

export default function LayoutToolbar({
  editMode, hiddenCount, onEnter, onSave, onCancel, onReset, hiddenLabels, onRestore,
}: Props) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
    }}>
      {/* Hidden cards tray — shows only in edit mode when there are hidden cards */}
      {editMode && hiddenLabels.length > 0 && (
        <div style={{
          background: '#0E1120', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 16, padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 6,
          maxWidth: 260, boxShadow: '0 8px 32px rgba(0,0,0,.5)',
        }}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>
            Cards ocultos
          </div>
          {hiddenLabels.map(({ id, label }: { id: string; label: string }) => (
            <button
              key={id}
              onClick={() => onRestore(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 9,
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
                color: 'rgba(238,242,248,.6)', fontSize: '.72rem', fontWeight: 500,
                cursor: 'pointer', transition: 'all .15s', textAlign: 'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EEF2F8'; (e.currentTarget as HTMLElement).style.background = 'rgba(61,123,255,.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.6)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)'; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Main toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#0E1120', border: '1px solid rgba(255,255,255,.1)',
        borderRadius: 14, padding: '8px 10px',
        boxShadow: '0 8px 32px rgba(0,0,0,.5)',
      }}>
        {!editMode ? (
          <>
            {hiddenCount > 0 && (
              <span style={{ fontSize: '.62rem', fontWeight: 700, color: 'rgba(238,242,248,.35)', padding: '0 6px' }}>
                {hiddenCount} oculto{hiddenCount !== 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={onEnter}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10,
                background: 'rgba(61,123,255,.12)', border: '1px solid rgba(61,123,255,.25)',
                color: '#3D7BFF', fontSize: '.73rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(61,123,255,.2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(61,123,255,.12)'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/>
                <polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
              Editar layout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onReset}
              style={{
                padding: '7px 12px', borderRadius: 9,
                background: 'transparent', border: '1px solid rgba(255,255,255,.1)',
                color: 'rgba(238,242,248,.4)', fontSize: '.7rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.7)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.4)'}
            >
              Restaurar
            </button>
            <button
              onClick={onCancel}
              style={{
                padding: '7px 12px', borderRadius: 9,
                background: 'transparent', border: '1px solid rgba(255,107,107,.2)',
                color: '#FF6B6B', fontSize: '.7rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,107,.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 10,
                background: '#4ADE80', border: 'none',
                color: '#0B0D1A', fontSize: '.73rem', fontWeight: 800, cursor: 'pointer', transition: 'opacity .15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '.85'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Salvar layout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
