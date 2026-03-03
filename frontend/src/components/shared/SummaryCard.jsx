import PropTypes from 'prop-types';

const SummaryCard = ({ title, value, subtext, icon, color = 'blue' }) => {
  // Map color prop to Tailwind classes with Modern Gradients
  const colorMap = {
    blue: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-600', 
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600', 
      shadow: 'shadow-blue-500/30' 
    },
    green: { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-600', 
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-600', 
      shadow: 'shadow-emerald-500/30' 
    },
    amber: { 
      bg: 'bg-amber-50', 
      text: 'text-amber-600', 
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600', 
      shadow: 'shadow-amber-500/30' 
    },
    purple: { 
      bg: 'bg-purple-50', 
      text: 'text-purple-600', 
      iconBg: 'bg-gradient-to-br from-purple-400 to-purple-600', 
      shadow: 'shadow-purple-500/30' 
    },
    red: { 
      bg: 'bg-red-50', 
      text: 'text-red-600', 
      iconBg: 'bg-gradient-to-br from-red-400 to-red-600', 
      shadow: 'shadow-red-500/30' 
    }
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className="card group hover:-translate-y-1 transition-all duration-300 h-full relative overflow-hidden">
      {/* Background Decor */}
      <div className={`absolute top-0 right-0 w-24 h-24 ${theme.bg} rounded-bl-full opacity-50 -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>

      <div className="relative flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-text-secondary mb-1 tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-bold text-foreground tracking-tight">{value}</h3>
          {subtext && (
            <p className="text-xs font-medium text-text-muted mt-2 flex items-center">
              {subtext}
            </p>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${theme.iconBg} text-white shadow-lg ${theme.shadow} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtext: PropTypes.string,
  icon: PropTypes.element,
  color: PropTypes.oneOf(['blue', 'green', 'amber', 'purple', 'red'])
};

export default SummaryCard;
