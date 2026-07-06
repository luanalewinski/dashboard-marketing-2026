import TeamCommandCenter from '../../components/TeamCommandCenter';
import { CU } from '../../lib/clickup';

const ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#6F9BFF" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6"  y1="20" x2="6"  y2="14"/>
  </svg>
);

export default function Benchmarking() {
  return (
    <TeamCommandCenter
      config={{
        name: 'Time Analíticos',
        subtitle: 'Análise de mercado, benchmarking e performance · ao vivo via ClickUp',
        color: '#6F9BFF',
        listId: CU.LIST_ANALYTICS,
        listUrl: `https://app.clickup.com/36941541/v/l/${CU.LIST_ANALYTICS}`,
        icon: ICON,
      }}
    />
  );
}
