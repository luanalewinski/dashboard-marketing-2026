// ── Camada de dados por marca ─────────────────────────────────────────────────
// Hoje: mock data realista por marca.
// Futuro: substituir getMockBrandTasks() por getListTasks() + filtro por brand.filterStrategy/filterValue.
// Os componentes visuais NÃO dependem do formato bruto do ClickUp — só deste modelo interno.

import type { BrandSlug } from './brands';

// ── Modelo interno de Task (agnóstico ao ClickUp) ─────────────────────────────
export interface BrandTask {
  id: string;
  title: string;
  status: 'a_fazer' | 'em_andamento' | 'em_aprovacao' | 'em_ajustes' | 'concluido';
  priority: 'alta' | 'media' | 'baixa';
  dueDate: string | null;   // ISO date string ou null
  assignee: string | null;
  brand: BrandSlug;
  dateUpdated: string;      // ISO
  url: string;
}

// ── Mock tasks por marca ───────────────────────────────────────────────────────
const MOCK_TASKS: Record<BrandSlug, BrandTask[]> = {
  nova: [
    { id: 'n1', title: 'KV Campanha Julho · Nova Promotora',      status: 'em_andamento', priority: 'alta',  dueDate: '2026-07-15', assignee: 'Luana',   brand: 'nova', dateUpdated: '2026-07-07', url: '#' },
    { id: 'n2', title: 'Manual de Boas Práticas — PPT',           status: 'a_fazer',      priority: 'media', dueDate: '2026-07-20', assignee: 'Douglas',  brand: 'nova', dateUpdated: '2026-07-06', url: '#' },
    { id: 'n3', title: 'Post Redes Sociais · Semana 28',          status: 'concluido',    priority: 'media', dueDate: '2026-07-05', assignee: 'Luana',   brand: 'nova', dateUpdated: '2026-07-05', url: '#' },
    { id: 'n4', title: 'Apresentação CORBAN 360',                 status: 'em_aprovacao', priority: 'alta',  dueDate: '2026-07-10', assignee: 'Douglas',  brand: 'nova', dateUpdated: '2026-07-07', url: '#' },
    { id: 'n5', title: 'Carrossel Instagram · Julho',             status: 'em_andamento', priority: 'media', dueDate: '2026-07-12', assignee: 'Luana',   brand: 'nova', dateUpdated: '2026-07-06', url: '#' },
    { id: 'n6', title: 'Vídeo institucional Q3',                  status: 'a_fazer',      priority: 'baixa', dueDate: '2026-07-30', assignee: null,       brand: 'nova', dateUpdated: '2026-07-04', url: '#' },
    { id: 'n7', title: 'Relatório mensal junho',                  status: 'concluido',    priority: 'media', dueDate: '2026-07-03', assignee: 'Luana',   brand: 'nova', dateUpdated: '2026-07-03', url: '#' },
    { id: 'n8', title: 'Banner site · promoção verão',            status: 'concluido',    priority: 'alta',  dueDate: '2026-07-01', assignee: 'Douglas',  brand: 'nova', dateUpdated: '2026-07-01', url: '#' },
    { id: 'n9', title: 'Story pack julho',                        status: 'em_ajustes',   priority: 'media', dueDate: '2026-07-08', assignee: 'Luana',   brand: 'nova', dateUpdated: '2026-07-07', url: '#' },
  ],
  vendeai: [
    { id: 'v1', title: 'Landing page · Black Friday VendeAí',    status: 'em_andamento', priority: 'alta',  dueDate: '2026-07-18', assignee: 'Douglas', brand: 'vendeai', dateUpdated: '2026-07-07', url: '#' },
    { id: 'v2', title: 'Kit de vendas digital · julho',          status: 'a_fazer',      priority: 'media', dueDate: '2026-07-22', assignee: null,      brand: 'vendeai', dateUpdated: '2026-07-06', url: '#' },
    { id: 'v3', title: 'Identidade visual VendeAí 2.0',          status: 'em_aprovacao', priority: 'alta',  dueDate: '2026-07-14', assignee: 'Luana',  brand: 'vendeai', dateUpdated: '2026-07-07', url: '#' },
    { id: 'v4', title: 'Posts feed semana 28',                   status: 'concluido',    priority: 'media', dueDate: '2026-07-05', assignee: 'Douglas', brand: 'vendeai', dateUpdated: '2026-07-05', url: '#' },
    { id: 'v5', title: 'Reels tutorial plataforma',              status: 'a_fazer',      priority: 'baixa', dueDate: '2026-07-28', assignee: null,      brand: 'vendeai', dateUpdated: '2026-07-04', url: '#' },
    { id: 'v6', title: 'Email mkt · nova funcionalidade',        status: 'concluido',    priority: 'media', dueDate: '2026-07-02', assignee: 'Luana',  brand: 'vendeai', dateUpdated: '2026-07-02', url: '#' },
  ],
  pronto: [
    { id: 'p1', title: 'Campanha crédito consignado · agosto',   status: 'em_andamento', priority: 'alta',  dueDate: '2026-07-20', assignee: 'Luana',   brand: 'pronto', dateUpdated: '2026-07-07', url: '#' },
    { id: 'p2', title: 'Manual do vendedor Pronto 2026',         status: 'a_fazer',      priority: 'media', dueDate: '2026-07-25', assignee: 'Douglas', brand: 'pronto', dateUpdated: '2026-07-06', url: '#' },
    { id: 'p3', title: 'KV · promoção taxa zero',                status: 'em_aprovacao', priority: 'alta',  dueDate: '2026-07-11', assignee: 'Luana',   brand: 'pronto', dateUpdated: '2026-07-07', url: '#' },
    { id: 'p4', title: 'Post stories · simulador online',        status: 'concluido',    priority: 'media', dueDate: '2026-07-04', assignee: 'Douglas', brand: 'pronto', dateUpdated: '2026-07-04', url: '#' },
    { id: 'p5', title: 'Flyer impresso agências',                status: 'concluido',    priority: 'baixa', dueDate: '2026-07-03', assignee: 'Luana',   brand: 'pronto', dateUpdated: '2026-07-03', url: '#' },
    { id: 'p6', title: 'Apresentação parceiros Q3',              status: 'em_andamento', priority: 'media', dueDate: '2026-07-16', assignee: 'Douglas', brand: 'pronto', dateUpdated: '2026-07-07', url: '#' },
    { id: 'p7', title: 'Vídeo depoimento cliente',               status: 'a_fazer',      priority: 'baixa', dueDate: '2026-07-31', assignee: null,       brand: 'pronto', dateUpdated: '2026-07-05', url: '#' },
  ],
  '2s': [
    { id: 's1', title: 'KV institucional 2S · Q3 2026',          status: 'em_andamento', priority: 'alta',  dueDate: '2026-07-18', assignee: 'Luana',   brand: '2s', dateUpdated: '2026-07-07', url: '#' },
    { id: 's2', title: 'Manual do correspondente 2026',          status: 'a_fazer',      priority: 'media', dueDate: '2026-07-28', assignee: 'Douglas', brand: '2s', dateUpdated: '2026-07-06', url: '#' },
    { id: 's3', title: 'Campanha crédito pessoal · agosto',      status: 'em_aprovacao', priority: 'alta',  dueDate: '2026-07-12', assignee: 'Luana',   brand: '2s', dateUpdated: '2026-07-07', url: '#' },
    { id: 's4', title: 'Post feed semana 28',                    status: 'concluido',    priority: 'media', dueDate: '2026-07-05', assignee: 'Douglas', brand: '2s', dateUpdated: '2026-07-05', url: '#' },
    { id: 's5', title: 'Stories · simulador de crédito',         status: 'concluido',    priority: 'baixa', dueDate: '2026-07-03', assignee: 'Luana',   brand: '2s', dateUpdated: '2026-07-03', url: '#' },
    { id: 's6', title: 'Apresentação rede de correspondentes',   status: 'em_andamento', priority: 'media', dueDate: '2026-07-17', assignee: 'Douglas', brand: '2s', dateUpdated: '2026-07-07', url: '#' },
    { id: 's7', title: 'Reels institucional fundação da marca',  status: 'a_fazer',      priority: 'baixa', dueDate: '2026-07-31', assignee: null,       brand: '2s', dateUpdated: '2026-07-05', url: '#' },
  ],
};

export function getMockBrandTasks(brand: BrandSlug): BrandTask[] {
  return MOCK_TASKS[brand] ?? [];
}

// ── Instagram data por marca ───────────────────────────────────────────────────

export interface BrandIgPeriodo {
  seguidores: number; publicacoes: number;
  visualizacoes: number; alcancadas: number;
  interacoes: number; engajamento: number; visitas: number;
  deltaSeguidores: string; deltaPctSeg: string; segPos: boolean;
  deltaViz: string; vizPos: boolean;
  deltaPub: string; pubPos: boolean;
  vizTipo: { label: string; valor: number; pct: number }[];
  alcanceDia: { dia: string; valor: number }[];
}

export type IgPeriodo = '7' | '14' | '30';

export const BRAND_IG_DATA: Record<BrandSlug, Record<IgPeriodo, BrandIgPeriodo>> = {
  nova: {
    '30': {
      seguidores: 24791, publicacoes: 909,
      visualizacoes: 59192, alcancadas: 12387, interacoes: 735, engajamento: 284, visitas: 2213,
      deltaSeguidores: '+312', deltaPctSeg: '+1.3%', segPos: true,
      deltaViz: '+35%', vizPos: true, deltaPub: '-35%', pubPos: false,
      vizTipo: [
        { label: 'Stories', valor: 37517, pct: 63.4 }, { label: 'Carrossel', valor: 11667, pct: 19.7 },
        { label: 'Reels',   valor:  7732, pct: 13.1 }, { label: 'Posts',     valor:  2272, pct:  3.8 },
      ],
      alcanceDia: [
        { dia: '03/06', valor: 1820 }, { dia: '07/06', valor: 1100 }, { dia: '11/06', valor: 2400 },
        { dia: '15/06', valor: 1980 }, { dia: '19/06', valor: 40   }, { dia: '23/06', valor: 90   },
        { dia: '25/06', valor: 3780 }, { dia: '29/06', valor: 980  }, { dia: '01/07', valor: 180  },
      ],
    },
    '14': {
      seguidores: 24791, publicacoes: 432,
      visualizacoes: 31200, alcancadas: 6840, interacoes: 382, engajamento: 148, visitas: 1104,
      deltaSeguidores: '+148', deltaPctSeg: '+0.6%', segPos: true,
      deltaViz: '+22%', vizPos: true, deltaPub: '-12%', pubPos: false,
      vizTipo: [
        { label: 'Stories', valor: 19800, pct: 63.5 }, { label: 'Carrossel', valor: 6150, pct: 19.7 },
        { label: 'Reels',   valor:  4100, pct: 13.1 }, { label: 'Posts',     valor: 1150, pct:  3.7 },
      ],
      alcanceDia: [
        { dia: '19/06', valor: 40   }, { dia: '23/06', valor: 90   },
        { dia: '25/06', valor: 3780 }, { dia: '29/06', valor: 980  }, { dia: '01/07', valor: 180 },
      ],
    },
    '7': {
      seguidores: 24791, publicacoes: 198,
      visualizacoes: 14800, alcancadas: 3210, interacoes: 188, engajamento: 72, visitas: 540,
      deltaSeguidores: '+74', deltaPctSeg: '+0.3%', segPos: true,
      deltaViz: '+18%', vizPos: true, deltaPub: '-8%', pubPos: false,
      vizTipo: [
        { label: 'Stories', valor: 9400, pct: 63.5 }, { label: 'Carrossel', valor: 2920, pct: 19.7 },
        { label: 'Reels',   valor: 1940, pct: 13.1 }, { label: 'Posts',     valor:  540, pct:  3.7 },
      ],
      alcanceDia: [
        { dia: '26/06', valor: 1200 }, { dia: '27/06', valor: 400  },
        { dia: '29/06', valor: 980  }, { dia: '01/07', valor: 180  },
      ],
    },
  },

  vendeai: {
    '30': {
      seguidores: 18340, publicacoes: 621,
      visualizacoes: 42100, alcancadas: 9200, interacoes: 510, engajamento: 198, visitas: 1640,
      deltaSeguidores: '+540', deltaPctSeg: '+3.0%', segPos: true,
      deltaViz: '+48%', vizPos: true, deltaPub: '-18%', pubPos: false,
      vizTipo: [
        { label: 'Reels',     valor: 23000, pct: 54.6 }, { label: 'Stories', valor: 11200, pct: 26.6 },
        { label: 'Carrossel', valor:  6100, pct: 14.5 }, { label: 'Posts',   valor:  1800, pct:  4.3 },
      ],
      alcanceDia: [
        { dia: '03/06', valor: 900  }, { dia: '07/06', valor: 2100 }, { dia: '11/06', valor: 1400 },
        { dia: '15/06', valor: 3200 }, { dia: '19/06', valor: 800  }, { dia: '23/06', valor: 1100 },
        { dia: '25/06', valor: 4200 }, { dia: '29/06', valor: 1600 }, { dia: '01/07', valor: 480  },
      ],
    },
    '14': {
      seguidores: 18340, publicacoes: 298,
      visualizacoes: 22400, alcancadas: 5100, interacoes: 268, engajamento: 104, visitas: 860,
      deltaSeguidores: '+240', deltaPctSeg: '+1.3%', segPos: true,
      deltaViz: '+32%', vizPos: true, deltaPub: '-10%', pubPos: false,
      vizTipo: [
        { label: 'Reels',     valor: 12200, pct: 54.5 }, { label: 'Stories', valor: 5900, pct: 26.3 },
        { label: 'Carrossel', valor:  3200, pct: 14.3 }, { label: 'Posts',   valor:  1100, pct:  4.9 },
      ],
      alcanceDia: [
        { dia: '19/06', valor: 800  }, { dia: '23/06', valor: 1100 },
        { dia: '25/06', valor: 4200 }, { dia: '29/06', valor: 1600 }, { dia: '01/07', valor: 480 },
      ],
    },
    '7': {
      seguidores: 18340, publicacoes: 142,
      visualizacoes: 10800, alcancadas: 2400, interacoes: 128, engajamento: 52, visitas: 420,
      deltaSeguidores: '+110', deltaPctSeg: '+0.6%', segPos: true,
      deltaViz: '+24%', vizPos: true, deltaPub: '-5%', pubPos: false,
      vizTipo: [
        { label: 'Reels',     valor: 5900, pct: 54.6 }, { label: 'Stories', valor: 2800, pct: 25.9 },
        { label: 'Carrossel', valor: 1600, pct: 14.8 }, { label: 'Posts',   valor:  500, pct:  4.7 },
      ],
      alcanceDia: [
        { dia: '26/06', valor: 800  }, { dia: '27/06', valor: 1600 },
        { dia: '29/06', valor: 1600 }, { dia: '01/07', valor: 480  },
      ],
    },
  },

  pronto: {
    '30': {
      seguidores: 11820, publicacoes: 445,
      visualizacoes: 28600, alcancadas: 6100, interacoes: 340, engajamento: 132, visitas: 980,
      deltaSeguidores: '+210', deltaPctSeg: '+1.8%', segPos: true,
      deltaViz: '+28%', vizPos: true, deltaPub: '-22%', pubPos: false,
      vizTipo: [
        { label: 'Stories',   valor: 16200, pct: 56.6 }, { label: 'Posts',     valor: 7400, pct: 25.9 },
        { label: 'Carrossel', valor:  3800, pct: 13.3 }, { label: 'Reels',     valor: 1200, pct:  4.2 },
      ],
      alcanceDia: [
        { dia: '03/06', valor: 620  }, { dia: '07/06', valor: 1800 }, { dia: '11/06', valor: 900 },
        { dia: '15/06', valor: 2400 }, { dia: '19/06', valor: 200  }, { dia: '23/06', valor: 600 },
        { dia: '25/06', valor: 2800 }, { dia: '29/06', valor: 700  }, { dia: '01/07', valor: 280 },
      ],
    },
    '14': {
      seguidores: 11820, publicacoes: 210,
      visualizacoes: 15200, alcancadas: 3400, interacoes: 180, engajamento: 70, visitas: 520,
      deltaSeguidores: '+98', deltaPctSeg: '+0.8%', segPos: true,
      deltaViz: '+19%', vizPos: true, deltaPub: '-14%', pubPos: false,
      vizTipo: [
        { label: 'Stories',   valor: 8600, pct: 56.6 }, { label: 'Posts',     valor: 3900, pct: 25.7 },
        { label: 'Carrossel', valor: 2000, pct: 13.2 }, { label: 'Reels',     valor:  700, pct:  4.5 },
      ],
      alcanceDia: [
        { dia: '19/06', valor: 200  }, { dia: '23/06', valor: 600  },
        { dia: '25/06', valor: 2800 }, { dia: '29/06', valor: 700  }, { dia: '01/07', valor: 280 },
      ],
    },
    '7': {
      seguidores: 11820, publicacoes: 98,
      visualizacoes: 7200, alcancadas: 1600, interacoes: 86, engajamento: 34, visitas: 250,
      deltaSeguidores: '+46', deltaPctSeg: '+0.4%', segPos: true,
      deltaViz: '+14%', vizPos: true, deltaPub: '-9%', pubPos: false,
      vizTipo: [
        { label: 'Stories',   valor: 4100, pct: 56.9 }, { label: 'Posts',     valor: 1800, pct: 25.0 },
        { label: 'Carrossel', valor:  960, pct: 13.3 }, { label: 'Reels',     valor:  340, pct:  4.8 },
      ],
      alcanceDia: [
        { dia: '26/06', valor: 400  }, { dia: '27/06', valor: 700  },
        { dia: '29/06', valor: 700  }, { dia: '01/07', valor: 280  },
      ],
    },
  },
  '2s': {
    '30': {
      seguidores: 8640, publicacoes: 312,
      visualizacoes: 21400, alcancadas: 4800, interacoes: 268, engajamento: 104, visitas: 740,
      deltaSeguidores: '+380', deltaPctSeg: '+4.6%', segPos: true,
      deltaViz: '+52%', vizPos: true, deltaPub: '+8%', pubPos: true,
      vizTipo: [
        { label: 'Reels',     valor: 11200, pct: 52.3 }, { label: 'Stories', valor: 5800, pct: 27.1 },
        { label: 'Carrossel', valor:  3100, pct: 14.5 }, { label: 'Posts',   valor: 1300, pct:  6.1 },
      ],
      alcanceDia: [
        { dia: '03/06', valor: 480  }, { dia: '07/06', valor: 1400 }, { dia: '11/06', valor: 920 },
        { dia: '15/06', valor: 2600 }, { dia: '19/06', valor: 340  }, { dia: '23/06', valor: 780 },
        { dia: '25/06', valor: 3200 }, { dia: '29/06', valor: 860  }, { dia: '01/07', valor: 320 },
      ],
    },
    '14': {
      seguidores: 8640, publicacoes: 148,
      visualizacoes: 11600, alcancadas: 2640, interacoes: 142, engajamento: 56, visitas: 390,
      deltaSeguidores: '+168', deltaPctSeg: '+2.0%', segPos: true,
      deltaViz: '+34%', vizPos: true, deltaPub: '+4%', pubPos: true,
      vizTipo: [
        { label: 'Reels',     valor: 6100, pct: 52.6 }, { label: 'Stories', valor: 3100, pct: 26.7 },
        { label: 'Carrossel', valor: 1700, pct: 14.7 }, { label: 'Posts',   valor:  700, pct:  6.0 },
      ],
      alcanceDia: [
        { dia: '19/06', valor: 340  }, { dia: '23/06', valor: 780  },
        { dia: '25/06', valor: 3200 }, { dia: '29/06', valor: 860  }, { dia: '01/07', valor: 320 },
      ],
    },
    '7': {
      seguidores: 8640, publicacoes: 68,
      visualizacoes: 5400, alcancadas: 1240, interacoes: 68, engajamento: 28, visitas: 190,
      deltaSeguidores: '+82', deltaPctSeg: '+1.0%', segPos: true,
      deltaViz: '+28%', vizPos: true, deltaPub: '+2%', pubPos: true,
      vizTipo: [
        { label: 'Reels',     valor: 2820, pct: 52.2 }, { label: 'Stories', valor: 1460, pct: 27.0 },
        { label: 'Carrossel', valor:  800, pct: 14.8 }, { label: 'Posts',   valor:  320, pct:  5.9 },
      ],
      alcanceDia: [
        { dia: '26/06', valor: 480  }, { dia: '27/06', valor: 860  },
        { dia: '29/06', valor: 860  }, { dia: '01/07', valor: 320  },
      ],
    },
  },
};

// Crescimento mensal de seguidores por marca
export const BRAND_GROWTH: Record<BrandSlug, { mes: string; seg: number }[]> = {
  nova: [
    { mes: 'Jan', seg: 22100 }, { mes: 'Fev', seg: 22580 }, { mes: 'Mar', seg: 22940 },
    { mes: 'Abr', seg: 23310 }, { mes: 'Mai', seg: 23780 }, { mes: 'Jun', seg: 24200 }, { mes: 'Jul', seg: 24791 },
  ],
  vendeai: [
    { mes: 'Jan', seg: 14200 }, { mes: 'Fev', seg: 14980 }, { mes: 'Mar', seg: 15600 },
    { mes: 'Abr', seg: 16400 }, { mes: 'Mai', seg: 17200 }, { mes: 'Jun', seg: 17800 }, { mes: 'Jul', seg: 18340 },
  ],
  pronto: [
    { mes: 'Jan', seg: 9800  }, { mes: 'Fev', seg: 10200 }, { mes: 'Mar', seg: 10600 },
    { mes: 'Abr', seg: 10980 }, { mes: 'Mai', seg: 11300 }, { mes: 'Jun', seg: 11610 }, { mes: 'Jul', seg: 11820 },
  ],
  '2s': [
    { mes: 'Jan', seg: 6200 }, { mes: 'Fev', seg: 6740 }, { mes: 'Mar', seg: 7180 },
    { mes: 'Abr', seg: 7560 }, { mes: 'Mai', seg: 7980 }, { mes: 'Jun', seg: 8260 }, { mes: 'Jul', seg: 8640 },
  ],
};

// Heatmap compartilhado (mesmo padrão para todas as marcas — dados reais viriam da API)
export const HEATMAP_DATA: number[][] = [
  [1, 2, 5, 8, 7, 6, 9, 4],
  [1, 3, 6, 9, 8, 7, 8, 3],
  [2, 4, 7, 10, 9, 8, 9, 5],
  [2, 3, 6, 9, 8, 7, 9, 4],
  [2, 4, 6, 8, 7, 9, 10, 6],
  [1, 2, 4, 6, 5, 7, 8, 5],
  [1, 1, 3, 5, 4, 5, 7, 4],
];

export const IG_DAYS  = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
export const IG_HOURS = ['06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h'];

export const DEMO_GENERO: Record<BrandSlug, { label: string; pct: number; color: string }[]> = {
  nova:    [{ label: 'Feminino', pct: 75, color: '#3D7BFF' }, { label: 'Masculino', pct: 25, color: '#4ADE80' }],
  vendeai: [{ label: 'Feminino', pct: 62, color: '#4ADE80'  }, { label: 'Masculino', pct: 38, color: '#3D7BFF' }],
  pronto:  [{ label: 'Feminino', pct: 58, color: '#FBBF24'  }, { label: 'Masculino', pct: 42, color: '#3D7BFF' }],
  '2s':    [{ label: 'Feminino', pct: 54, color: '#06B6D4'  }, { label: 'Masculino', pct: 46, color: '#3D7BFF' }],
};

export const DEMO_IDADE = [
  { label: '18–24', pct: 28 },
  { label: '25–34', pct: 42 },
  { label: '35–44', pct: 18 },
  { label: '45–54', pct:  8 },
  { label: '55+',   pct:  4 },
];
