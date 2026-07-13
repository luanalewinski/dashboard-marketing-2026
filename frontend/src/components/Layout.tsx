import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_GROUPS = [
  {
    items: [
      { label: 'Dashboard',     to: '/dashboard', exact: true, icon: 'grid' },
      { label: 'Nova Campanha', to: '/',          exact: true, icon: 'plus' },
      { label: 'Eventos',       to: '/eventos',               icon: 'calendar' },
    ],
  },
  {
    label: 'Times',
    items: [
      { label: 'Social',       to: '/time/social',       color: '#3D7BFF', icon: 'share' },
      { label: 'Benchmarking', to: '/time/benchmarking', color: '#6F9BFF', icon: 'bar-chart' },
      { label: 'Atendimento',  to: '/time/atendimento',  color: '#4ADE80', icon: 'headphones' },
      { label: 'Design',       to: '/time/design',       color: '#FBBF24', icon: 'pen-tool' },
    ],
  },
];

function NavIcon({ name, size = 15 }: { name: string; size?: number }) {
  const s = { width: size, height: size, flexShrink: 0 as const };
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.75', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...s };
  if (name === 'grid')       return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
  if (name === 'plus')       return <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  if (name === 'zap')        return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  if (name === 'calendar')   return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
  if (name === 'share')      return <svg {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
  if (name === 'bar-chart')  return <svg {...props}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  if (name === 'headphones') return <svg {...props}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>;
  if (name === 'pen-tool')   return <svg {...props}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
  if (name === 'instagram')  return <svg {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
  if (name === 'brand')      return <svg {...props}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
  return null;
}

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const [theme, setTheme]         = useState<'dark' | 'light'>('dark');
  const [a11yOpen, setA11yOpen]   = useState(false);
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

  const iconBtn: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 8,
    border: '1px solid rgba(255,255,255,.07)',
    background: 'transparent', color: 'rgba(238,242,248,.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'all .15s',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--nova-bg)', display: 'flex' }}>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: 'rgba(8,10,18,.95)',
        borderRight: '1px solid rgba(255,255,255,.05)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto', overflowX: 'hidden',
      }}>

        {/* Logo */}
        <Link to="/dashboard" style={{
          textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
          padding: '20px 18px 16px', flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,.05)',
        }}>
          <img src="/logo-nova.svg" alt="Nova" style={{ height: 18, width: 'auto' }} />
          <div style={{
            fontFamily: 'Sora, sans-serif', fontWeight: 800, fontSize: '.85rem',
            color: 'var(--nova-text)', letterSpacing: '.06em', lineHeight: 1,
            borderLeft: '1.5px solid rgba(255,255,255,.12)', paddingLeft: 9,
          }}>
            I MKT
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginTop: gi > 0 ? 16 : 0 }}>
              {group.label && (
                <div style={{
                  fontSize: '.55rem', fontWeight: 700, color: 'rgba(238,242,248,.2)',
                  textTransform: 'uppercase', letterSpacing: '.12em',
                  padding: '0 8px', marginBottom: 4,
                }}>
                  {group.label}
                </div>
              )}
              {group.items.map(item => {
                const active = (item as any).activePrefix
                  ? location.pathname.startsWith((item as any).activePrefix)
                  : isActive(item.to, (item as any).exact);
                const color = (item as any).color ?? 'var(--nova-blue)';
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 9,
                      padding: '8px 10px', borderRadius: 10,
                      fontSize: '.78rem', fontWeight: active ? 600 : 500,
                      color: active ? color : 'rgba(238,242,248,.45)',
                      background: active ? `${color}14` : 'transparent',
                      textDecoration: 'none', transition: 'all .15s',
                      borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.8)'; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(238,242,248,.45)'; } }}
                  >
                    <span style={{ color: active ? color : 'rgba(238,242,248,.3)', transition: 'color .15s' }}>
                      <NavIcon name={(item as any).icon} />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom controls */}
        <div style={{
          padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,.05)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {/* Sync */}
          <button
            onClick={() => setLastUpdated(new Date())}
            title="Atualizar dados"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '5px 8px', borderRadius: 8, border: '1px solid rgba(255,255,255,.07)',
              background: 'transparent', color: 'rgba(238,242,248,.35)',
              fontSize: '.62rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
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
          <button onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'} style={iconBtn}
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
            <button onClick={() => setA11yOpen(!a11yOpen)} title="Acessibilidade"
              style={{ ...iconBtn, background: a11yOpen ? 'rgba(255,255,255,.05)' : 'transparent', fontSize: '.65rem', fontWeight: 700 }}
            >A</button>
            {a11yOpen && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
                background: '#0E101A', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 12, padding: 12, width: 148, zIndex: 200,
                boxShadow: '0 16px 48px rgba(0,0,0,.6)',
              }}>
                <div style={{ fontSize: '.55rem', fontWeight: 700, color: 'rgba(238,242,248,.25)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
                  Tamanho de texto
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['', 'a-plus', 'a-plus-plus'] as const).map((lvl, i) => (
                    <button key={lvl} onClick={() => setA11y(lvl)} style={{
                      flex: 1, height: 28, borderRadius: 6,
                      border: `1px solid ${a11yLevel === lvl ? 'rgba(61,123,255,.4)' : 'rgba(255,255,255,.08)'}`,
                      background: a11yLevel === lvl ? 'rgba(61,123,255,.12)' : 'transparent',
                      color: a11yLevel === lvl ? '#3D7BFF' : 'rgba(238,242,248,.45)',
                      fontSize: '.7rem', fontWeight: 700, cursor: 'pointer',
                    }}>
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
            background: 'rgba(61,123,255,.15)', border: '1.5px solid rgba(61,123,255,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.62rem', fontWeight: 800, color: '#3D7BFF', letterSpacing: '.02em', flexShrink: 0,
          }}>MK</div>
        </div>

      </aside>

      {/* ── PAGE CONTENT ───────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 48px', minWidth: 0 }}>
        {children}
      </main>

    </div>
  );
}
