import { useParams, useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { BRANDS, getBrandConfig } from '../../lib/brands';
import BrandOverview from './BrandOverview';
import BrandInstagram from './BrandInstagram';

export default function BrandWorkspace() {
  const { brand: slug = 'nova' } = useParams<{ brand: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const config = getBrandConfig(slug);

  // Redireciona slugs inválidos
  useEffect(() => {
    if (!config) navigate('/marcas/nova', { replace: true });
  }, [config, navigate]);

  if (!config) return null;

  // Detecta sub-rota ativa
  const isInstagram = location.pathname.includes('/instagram');

  function switchBrand(newSlug: string) {
    const suffix = isInstagram ? '/instagram' : '';
    navigate(`/marcas/${newSlug}${suffix}`);
  }

  function switchTab(tab: 'overview' | 'instagram') {
    if (tab === 'overview') navigate(`/marcas/${slug}`);
    else navigate(`/marcas/${slug}/instagram`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── BRAND SWITCHER (peso primário) ─────────────────────────────── */}
      <div style={{ background: '#0C0F1C', borderRadius: 22, padding: '20px 24px', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Label */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>Marca</div>
          <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'rgba(238,242,248,.45)' }}>{config.description}</div>
        </div>

        {/* Switcher pills */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 5 }}>
          {BRANDS.map(b => {
            const active = b.slug === slug;
            return (
              <button key={b.slug} onClick={() => switchBrand(b.slug)} style={{
                padding: '7px 20px', borderRadius: 10, border: active ? `1px solid ${b.color}44` : '1px solid transparent',
                background: active ? `${b.color}18` : 'transparent',
                color: active ? b.color : 'rgba(238,242,248,.35)',
                fontSize: '.82rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '.03em', transition: 'all .15s',
                boxShadow: active ? `0 0 16px ${b.color}22` : 'none',
              }}>
                {b.name}
              </button>
            );
          })}
        </div>

        {/* Color stripe for active brand */}
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${config.color}, transparent)`, opacity: .45 }} />

        {/* Handle badge */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, background: config.color2, border: `1px solid ${config.color}22`, borderRadius: 10, padding: '5px 12px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: config.color }}>{config.handle}</span>
        </div>
      </div>

      {/* ── SUB-NAV (peso secundário) ───────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid rgba(255,255,255,.05)', paddingBottom: 0 }}>
        {[
          { key: 'overview',   label: 'Visão Geral', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          )},
          { key: 'instagram',  label: 'Instagram', icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          )},
        ].map(tab => {
          const active = tab.key === (isInstagram ? 'instagram' : 'overview');
          return (
            <button key={tab.key} onClick={() => switchTab(tab.key as 'overview' | 'instagram')} style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
              border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative',
              color: active ? config.color : 'rgba(238,242,248,.35)',
              fontSize: '.78rem', fontWeight: active ? 700 : 500, transition: 'all .15s',
              borderBottom: active ? `2px solid ${config.color}` : '2px solid transparent',
              marginBottom: -1,
            }}>
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── CONTEÚDO DA ROTA ───────────────────────────────────────────── */}
      <Routes>
        <Route index element={<BrandOverview brand={config} />} />
        <Route path="instagram" element={<BrandInstagram brand={config} />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>

    </div>
  );
}
