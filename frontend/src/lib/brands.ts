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

  // Estratégia de filtro de tarefas no ClickUp
  // 'keyword' → task.name.toLowerCase().includes(filterValue)
  // 'tag'     → task.tags[] inclui filterValue
  // 'list'    → buscar de listId específico
  // 'field'   → custom_field "Marca" === filterValue
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
    filterStrategy: 'keyword',
    filterValue: 'pronto',
  },
];

export function getBrandConfig(slug: string): BrandConfig | undefined {
  return BRANDS.find(b => b.slug === slug);
}

// ── Borda de identidade por marca ─────────────────────────────────────────────
// Técnica: background padding-box (fundo interno) + border-box (gradiente na borda).
// Apenas VENDEAÍ recebe borda com gradiente lilás → azul.
// NOVA e PRONTO mantêm a borda padrão do Design System.
export function brandCardStyle(
  brand: BrandConfig,
  bg: string = '#0C1425',
): React.CSSProperties {
  if (brand.slug !== 'vendeai') {
    return { background: bg, border: '1px solid rgba(255,255,255,.05)' };
  }
  return {
    background: `linear-gradient(${bg}, ${bg}) padding-box,
                 linear-gradient(135deg, rgba(160,0,255,.18) 0%, rgba(0,217,255,.18) 100%) border-box`,
    border: '1px solid transparent',
  };
}
