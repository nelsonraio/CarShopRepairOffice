interface KPICardProps {
  title: string;
  value: string | number;
  onClick?: () => void;
}

const KPICard = ({ title, value, onClick }: KPICardProps) => {
  return (
    <div
      className={`bg-gray-700 border border-gray-600 p-6 ${onClick ? 'cursor-pointer hover:bg-gray-600 transition-colors' : ''}`}
      onClick={onClick}
    >
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-100">{value}</p>
    </div>
  );
};

export default KPICard;
