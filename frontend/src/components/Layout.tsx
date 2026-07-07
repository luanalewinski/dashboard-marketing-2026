import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_GROUPS = [
  {
    items: [
      { label: 'Dashboard',      to: '/dashboard', exact: true },
      { label: 'Nova Campanha',  to: '/',          exact: true },
      { label: 'Sprints',        to: '/sprints' },
      { label: 'Eventos',        to: '/eventos' },
    ],
  },
  {
    label: 'Times',
    items: [
      { label: 'Social',         to: '/time/social',       color: '#3D7BFF' },
      { label: 'Benchmarking',   to: '/time/benchmarking', color: '#6F9BFF' },
      { label: 'Atendimento',    to: '/time/atendimento',  color: '#4ADE80' },
      { label: 'Design',         to: '/time/design',       color: '#FBBF24' },
    ],
  },
  {
    label: 'Canais',
    items: [
      { label: 'Instagram',      to: '/instagram',         color: '#E1306C' },
    ],
  },
];

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const [theme, setTheme]       = useState<'dark' | 'light'>('dark');
  const [a11yOpen, setA11yOpen] = useState(false);
  const [a11yLevel, setA11yLevel] = useState<'' | 'a-plus' | 'a-plus-plus'>('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const a11yRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (a11yRef.current && !a11yRef.current.contains(e.target as Node)) setA11yOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(next);
  };

  const setA11y = (level: '' | 'a-plus' | 'a-plus-plus') => {
    setA11yLevel(level);
    document.documentElement.classList.remove('a-plus', 'a-plus-plus');
    if (level) document.documentElement.classList.add(level);
    setA11yOpen(false);
  };

  const formatTime = (d: Date) => {
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return 'agora';
    if (diff === 1) return '1 min';
    if (diff < 60) return `${diff} min`;
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  function isActive(to: string, exact?: boolean) {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nova-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOP NAVBAR ─────────────────────────────────────────────────── */}
      <header style={{
        background: 'rgba(8,10,18,.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,.05)',
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center',
        padding: '0 24px', height: 52, gap: 0,
      }}>

        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 28 }}>
          <img src="/logo-nova.svg" alt="Nova" style={{ height: 20, width: 'auto' }} />
          <div style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '.95rem',
            color: 'var(--nova-text)', letterSpacing: '.06em', lineHeight: 1,
            borderLeft: '1.5px solid rgba(255,255,255,.12)', paddingLeft: 10,
          }}>
            I MKT
          </div>
        </Link>

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,.07)', marginRight: 24, flexShrink: 0 }} />

        {/* Nav items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {gi > 0 && (
                <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,.07)', margin: '0 8px', flexShrink: 0 }} />
              )}
              {group.label && (
                <span style={{ fontSize: '.55rem', fontWeight: 700, color: 'rgba(238,242,248,.2)', textTransform: 'uppercase', letterSpacing: '.1em', paddingRight: 6, flexShrink: 0 }}>
                  {group.label}
                </span>
              )}
              {group.items.map(item => {
                const active = isActive(item.to, (item as any).exact);
                const color = (item as any).color ?? 'var(--nova-blue)';
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '5px 12px', borderRadius: 8,
                      fontSize: '.75rem', fontWeight: active ? 600 : 500,
                      color: active ? color : 'rgba(238,242,248,.45)',
                      background: active ? `${color}14` : 'transparent',
                      border: `1px solid ${active ? `${color}28` : 'transparent'}`,
                      textDecoration: 'none', whiteSpace: 'nowrap',
                      transition: 'all .15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.8)'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.45)'; }}
                  >
                    {active && (item as any).color && (
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, marginRight: 6, flexShrink: 0 }} />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 20 }}>

          {/* Sync */}
          <button
            onClick={() => setLastUpdated(new Date())}
            title="Atualizar dados"
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
              borderRadius: 8, border: '1px solid rgba(255,255,255,.07)',
              background: 'transparent', color: 'rgba(238,242,248,.35)',
              fontSize: '.65rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.7)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.35)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="11" height="11">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {formatTime(lastUpdated)}
          </button>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid rgba(255,255,255,.07)',
              background: 'transparent', color: 'rgba(238,242,248,.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.8)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.14)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'; }}
          >
            {theme === 'dark'
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>

          {/* A11y */}
          <div ref={a11yRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setA11yOpen(!a11yOpen)}
              title="Acessibilidade"
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid rgba(255,255,255,.07)',
                background: a11yOpen ? 'rgba(255,255,255,.05)' : 'transparent',
                color: 'rgba(238,242,248,.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '.65rem', fontWeight: 700, transition: 'all .15s',
              }}
            >A</button>
            {a11yOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#0E101A', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 12, padding: '12px', width: 148, zIndex: 200,
                boxShadow: '0 16px 48px rgba(0,0,0,.6)',
              }}>
                <div style={{ fontSize: '.55rem', fontWeight: 700, color: 'rgba(238,242,248,.25)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
                  Tamanho de texto
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['', 'a-plus', 'a-plus-plus'] as const).map((lvl, i) => (
                    <button
                      key={lvl}
                      onClick={() => setA11y(lvl)}
                      style={{
                        flex: 1, height: 28, borderRadius: 6,
                        border: `1px solid ${a11yLevel === lvl ? 'rgba(61,123,255,.4)' : 'rgba(255,255,255,.08)'}`,
                        background: a11yLevel === lvl ? 'rgba(61,123,255,.12)' : 'transparent',
                        color: a11yLevel === lvl ? '#3D7BFF' : 'rgba(238,242,248,.45)',
                        fontSize: '.7rem', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      {['A', 'A+', 'A++'][i]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(61,123,255,.15)',
            border: '1.5px solid rgba(61,123,255,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.62rem', fontWeight: 800, color: '#3D7BFF',
            letterSpacing: '.02em',
          }}>MK</div>
        </div>

      </header>

      {/* ── PAGE CONTENT ───────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 48px' }}>
        {children}
      </main>

    </div>
  );
}
