import React from 'react';

export const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
  borderRadius: 10, padding: '8px 12px', color: '#EEF2F8', fontSize: '.78rem',
  outline: 'none', width: '100%', fontFamily: 'inherit',
};

export function Skel({ w, h, r = 8 }: { w: number | string; h: number; r?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 100%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.8s ease-in-out infinite',
    }} />
  );
}

export function BtnPrimary({ onClick, children, disabled }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '9px 16px', borderRadius: 10,
      background: disabled ? 'rgba(61,123,255,.4)' : '#3D7BFF', color: '#fff',
      fontSize: '.78rem', fontWeight: 700, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'opacity .15s', flexShrink: 0,
    }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.opacity = '.85'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

export function BtnGhost({ onClick, children, disabled }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 13px', borderRadius: 8,
      border: '1px solid rgba(255,255,255,.09)', background: 'transparent',
      color: 'rgba(238,242,248,.5)', fontSize: '.75rem', fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .15s',
    }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.85)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.18)'; } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.09)'; }}
    >
      {children}
    </button>
  );
}

export function Badge({ color, bg, border, children }: { color: string; bg: string; border: string; children: React.ReactNode }) {
  return (
    <span style={{ fontSize: '.62rem', fontWeight: 700, color, background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>
      {children}
    </span>
  );
}

export function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(5,7,14,.82)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#0E1120', border: '1px solid rgba(255,255,255,.08)', borderRadius: 22,
        padding: '28px 28px', width: '100%', maxWidth: 440,
        display: 'flex', flexDirection: 'column', gap: 18,
        boxShadow: '0 32px 80px rgba(0,0,0,.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 800, color: '#EEF2F8', margin: 0, letterSpacing: '-.02em' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8,
            width: 28, height: 28, cursor: 'pointer', color: 'rgba(238,242,248,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EEF2F8'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.08)'; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(238,242,248,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</label>
      {children}
    </div>
  );
}
