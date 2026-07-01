import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_SECTIONS = [
  {
    label: 'Geral',
    items: [
      {
        label: 'Dashboard',
        to: '/dashboard',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        ),
      },
      {
        label: 'Nova Campanha',
        to: '/',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Planejamento',
    items: [
      {
        label: 'Sprints',
        to: '/sprints',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Times',
    items: [
      {
        label: 'Social',
        to: '/time/social',
        color: '#3D7BFF',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/>
            <circle cx="12" cy="12" r="3"/><circle cx="17.5" cy="6.5" r="1"/>
          </svg>
        ),
      },
      {
        label: 'Benchmarking',
        to: '/time/benchmarking',
        color: '#6F9BFF',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        ),
      },
      {
        label: 'Atendimento',
        to: '/time/atendimento',
        color: '#4ADE80',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        ),
      },
      {
        label: 'Design',
        to: '/time/design',
        color: '#FBBF24',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
          </svg>
        ),
      },
    ],
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [a11yOpen, setA11yOpen] = useState(false);
  const [a11yLevel, setA11yLevel] = useState<'' | 'a-plus' | 'a-plus-plus'>('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {}, 60000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = () => setLastUpdated(new Date());

  const formatLastUpdated = (d: Date) => {
    const diff = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diff < 1) return 'agora há pouco';
    if (diff === 1) return 'há 1 min';
    if (diff < 60) return `há ${diff} min`;
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  const location = useLocation();

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--nova-bg)' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: collapsed ? 56 : 220,
        background: 'var(--nova-bg-elev)',
        borderRight: '1px solid var(--nova-border)',
        display: 'flex', flexDirection: 'column',
        flexShrink: 0, transition: 'width .2s', position: 'relative', zIndex: 10,
      }}>
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Colapsar menu"
          style={{
            position: 'absolute', right: -12, top: 24,
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--nova-bg-elev-2)', border: '1px solid var(--nova-border)',
            color: 'var(--nova-text-muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, zIndex: 20, fontFamily: 'Sora, sans-serif',
          }}
        >{collapsed ? '›' : '‹'}</button>

        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.75rem',
          padding: '1.25rem 1rem', borderBottom: '1px solid var(--nova-border)',
          overflow: 'hidden', whiteSpace: 'nowrap',
        }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', letterSpacing: '.03em', flexShrink: 0 }}>
            <span style={{ color: 'var(--nova-text)' }}>N</span>
            <span style={{
              display: 'inline-block', width: '0.95em', height: '0.95em',
              border: '2.5px solid var(--nova-red)', borderRadius: '50%',
              margin: '0 0.02em', transform: 'translateY(.06em)',
            }} />
            <span style={{ color: 'var(--nova-text)' }}>VA</span>
          </div>
          {!collapsed && (
            <div style={{ fontSize: '.625rem', fontWeight: 600, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              Promotora
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ padding: '.5rem 0', flex: 1, overflowY: 'auto' }}>
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} style={{ marginBottom: '.25rem' }}>
              {/* Separador de seção */}
              {!collapsed && (
                <div style={{
                  fontSize: '.5625rem', fontWeight: 700, color: 'var(--nova-text-dim)',
                  textTransform: 'uppercase', letterSpacing: '.09em',
                  padding: '.75rem .875rem .3rem',
                }}>
                  {section.label}
                </div>
              )}
              {collapsed && (
                <div style={{ height: '.5rem', borderTop: '1px solid var(--nova-border)', margin: '.375rem 0' }} />
              )}

              {section.items.map((item) => {
                const active = item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
                const accentColor = ('color' in item && item.color) ? item.color : 'var(--nova-blue)';
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: collapsed ? 0 : '.5rem',
                      padding: collapsed ? '.5rem 0' : '.5rem .875rem',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      fontSize: '.8125rem', fontWeight: active ? 600 : 500,
                      color: active ? accentColor : 'var(--nova-text-muted)',
                      textDecoration: 'none', transition: 'all .15s',
                      borderRight: active ? `3px solid ${accentColor}` : '3px solid transparent',
                      background: active ? `${accentColor}18` : 'transparent',
                      whiteSpace: 'nowrap', overflow: 'hidden',
                    }}
                  >
                    <span style={{ color: active ? accentColor : 'var(--nova-text-dim)', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom btn */}
        <div style={{ padding: '.875rem', borderTop: '1px solid var(--nova-border)' }}>
          <Link to="/" className="btn-primary" style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {!collapsed && <span>Novo Brief</span>}
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          background: 'var(--nova-bg-elev)', borderBottom: '1px solid var(--nova-border)',
          padding: '.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <span style={{ fontSize: '.9375rem', fontWeight: 700, color: 'var(--nova-text)', flex: 1 }}>
            Sistema de Campanhas
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', position: 'relative' }}>
            {/* Última atualização */}
            <button
              className="btn-ghost"
              onClick={handleRefresh}
              title="Atualizar dados"
              style={{ gap: '.375rem', fontSize: '.6875rem', color: 'var(--nova-text-dim)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              <span style={{ whiteSpace: 'nowrap' }}>Atualização — {formatLastUpdated(lastUpdated)}</span>
            </button>

            {/* Theme toggle */}
            <button className="btn-ghost" onClick={toggleTheme} aria-label="Alternar tema">
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
              <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
            </button>

            {/* A11y */}
            <div style={{ position: 'relative' }}>
              <button className="btn-ghost" onClick={() => setA11yOpen(!a11yOpen)} aria-expanded={a11yOpen} aria-label="Acessibilidade">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
                </svg>
                <span>A</span>
              </button>
              {a11yOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + .5rem)', right: 0,
                  background: 'var(--nova-bg-elev)', border: '1px solid var(--nova-border)',
                  borderRadius: '.75rem', padding: '.75rem', width: 160, zIndex: 100,
                  boxShadow: '0 8px 24px rgba(0,0,0,.4)',
                }}>
                  <div style={{ fontSize: '.625rem', fontWeight: 600, color: 'var(--nova-text-dim)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.5rem' }}>
                    Tamanho de texto
                  </div>
                  <div style={{ display: 'flex', gap: '.375rem' }}>
                    {(['', 'a-plus', 'a-plus-plus'] as const).map((lvl, i) => (
                      <button
                        key={lvl}
                        onClick={() => setA11y(lvl)}
                        className="btn-ghost"
                        style={{ flex: 1, justifyContent: 'center', color: a11yLevel === lvl ? 'var(--nova-blue)' : undefined }}
                      >
                        {['A', 'A+', 'A++'][i]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              width: '2rem', height: '2rem', borderRadius: '50%',
              background: 'rgba(61,123,255,.18)', border: '1.5px solid rgba(61,123,255,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.6875rem', fontWeight: 700, color: 'var(--nova-blue)',
            }}>MK</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
