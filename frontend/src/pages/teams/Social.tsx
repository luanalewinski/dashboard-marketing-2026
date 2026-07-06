import TeamCommandCenter from '../../components/TeamCommandCenter';
import { CU } from '../../lib/clickup';

const ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#3D7BFF" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5z"/>
    <circle cx="12" cy="12" r="3"/>
    <circle cx="17.5" cy="6.5" r="1"/>
  </svg>
);

export default function Social() {
  return (
    <TeamCommandCenter
      config={{
        name: 'Time Social',
        subtitle: 'Conteúdo, campanhas e redes sociais · ao vivo via ClickUp',
        color: '#3D7BFF',
        listId: CU.LIST_SOCIAL,
        listUrl: `https://app.clickup.com/36941541/v/l/${CU.LIST_SOCIAL}`,
        icon: ICON,
      }}
    />
  );
}
