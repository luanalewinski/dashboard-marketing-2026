// ── Brand config — fonte de verdade ──────────────────────────────────────────
// Para adicionar uma nova marca, basta acrescentar um objeto a BRANDS.
// Nenhum outro arquivo precisa ser alterado para que a rota /marcas/:slug funcione.

export type BrandSlug = 'nova' | 'vendeai' | 'pronto';

export interface BrandConfig {
  slug: BrandSlug;
  name: string;
  color: string;       // accent primário
  color2: string;      // accent secundário (rgba suave)
  description: string;
  handle: string;      // @handle do Instagram

  // Borda de identidade nos boards — null = borda padrão do DS
  // Formato: [cor1, cor2] em hex. brandCardStyle() aplica como gradiente 135deg, op. 18%.
  borderGradient: [string, string] | null;

  // Estratégia de filtro de tarefas no ClickUp
  filterStrategy: 'keyword' | 'tag' | 'list' | 'field';
  filterValue: string;
}

export const BRANDS: BrandConfig[] = [
  {
    slug: 'nova',
    name: 'NOVA',
    color: '#3D7BFF',
    color2: 'rgba(61,123,255,.12)',
    description: 'Nova Promotora · marketing e comunicação institucional',
    handle: '@nova.promotora',
    borderGradient: null,
    filterStrategy: 'keyword',
    filterValue: 'nova',
  },
  {
    slug: 'vendeai',
    name: 'VENDEAÍ',
    color: '#4ADE80',
    color2: 'rgba(74,222,128,.12)',
    description: 'Plataforma de vendas · digital e presencial',
    handle: '@vendeai.oficial',
    borderGradient: ['#A000FF', '#00D9FF'],
    filterStrategy: 'keyword',
    filterValue: 'vendeai',
  },
  {
    slug: 'pronto',
    name: 'PRONTO',
    color: '#FBBF24',
    color2: 'rgba(251,191,36,.12)',
    description: 'Crédito pessoal · soluções financeiras rápidas',
    handle: '@pronto.credito',
    borderGradient: ['#FD6100', '#D12B01'],
    filterStrategy: 'keyword',
    filterValue: 'pronto',
  },
];

export function getBrandConfig(slug: string): BrandConfig | undefined {
  return BRANDS.find(b => b.slug === slug);
}

// ── Borda de identidade por marca ─────────────────────────────────────────────
// Técnica: background padding-box (fundo interno) + border-box (gradiente na borda).
// Config-driven: brand.borderGradient define as cores; null = borda padrão do DS.
// Opacidade fixa em 18% — sutil o suficiente para não competir com os dados.
export function brandCardStyle(
  brand: BrandConfig,
  bg: string = '#0C1425',
): React.CSSProperties {
  if (!brand.borderGradient) {
    return { background: bg, border: '1px solid rgba(255,255,255,.05)' };
  }
  const [c1, c2] = brand.borderGradient;
  // Converte hex para rgb para controle de opacidade
  const toRgba = (hex: string, op: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${op})`;
  };
  return {
    background: `linear-gradient(${bg}, ${bg}) padding-box,
                 linear-gradient(135deg, ${toRgba(c1, 0.18)} 0%, ${toRgba(c2, 0.18)} 100%) border-box`,
    border: '1px solid transparent',
  };
}
