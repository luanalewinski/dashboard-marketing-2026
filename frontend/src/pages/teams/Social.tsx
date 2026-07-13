import { useState } from 'react';
import { BRANDS, getBrandConfig } from '../../lib/brands';
import type { BrandSlug } from '../../lib/brands';
import BrandInstagram from '../marcas/BrandInstagram';

export default function Social() {
  const [slug, setSlug] = useState<BrandSlug>('nova');
  const brand = getBrandConfig(slug)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header + brand switcher */}
      <div style={{ background: '#0C0F1C', borderRadius: 22, padding: '16px 20px', border: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: '.58rem', fontWeight: 700, color: 'rgba(238,242,248,.28)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>Social · Instagram</div>
          <div style={{ fontSize: '.72rem', fontWeight: 600, color: 'rgba(238,242,248,.4)' }}>{brand.handle} · analytics de desempenho</div>
        </div>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: `linear-gradient(90deg, ${brand.color}60, transparent)`, opacity: .5 }} />
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 4 }}>
          {BRANDS.map(b => {
            const active = b.slug === slug;
            return (
              <button key={b.slug} onClick={() => setSlug(b.slug)} style={{
                padding: '7px 18px', borderRadius: 10,
                border: active ? `1px solid ${b.color}44` : '1px solid transparent',
                background: active ? `${b.color}18` : 'transparent',
                color: active ? b.color : 'rgba(238,242,248,.35)',
                fontSize: '.8rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '.03em', transition: 'all .15s',
              }}>
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      <BrandInstagram brand={brand} />
    </div>
  );
}
