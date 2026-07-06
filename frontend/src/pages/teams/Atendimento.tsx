import TeamCommandCenter from '../../components/TeamCommandCenter';

const ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function Atendimento() {
  return (
    <TeamCommandCenter
      config={{
        name: 'Time Atendimento',
        subtitle: 'Relacionamento, suporte e gestão de clientes',
        color: '#4ADE80',
        listId: null,
        icon: ICON,
      }}
    />
  );
}
