import PropTypes from 'prop-types';

const AdminSummaryCard = ({ title, value, subtext, icon, color = 'blue', loading = false }) => {
  // Skeleton Loader
  if (loading) {
    return (
      <div className="card animate-pulse h-full">
        <div className="flex justify-between items-start">
          <div className="space-y-4 w-full">
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded w-1/3"></div>
          </div>
          <div className="h-12 w-12 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Modern Color Mapping with Gradients
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
    rose: { 
      bg: 'bg-rose-50', 
      text: 'text-rose-600', 
      iconBg: 'bg-gradient-to-br from-rose-400 to-rose-600', 
      shadow: 'shadow-rose-500/30' 
    },
    indigo: { 
      bg: 'bg-indigo-50', 
      text: 'text-indigo-600', 
      iconBg: 'bg-gradient-to-br from-indigo-400 to-indigo-600', 
      shadow: 'shadow-indigo-500/30' 
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
            <div className="flex items-center mt-2 gap-1.5">
               <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${theme.bg} ${theme.text}`}>
                {subtext}
               </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${theme.iconBg} text-white shadow-lg ${theme.shadow} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

AdminSummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subtext: PropTypes.string,
  icon: PropTypes.element,
  color: PropTypes.oneOf(['blue', 'green', 'amber', 'purple', 'rose', 'indigo']),
  loading: PropTypes.bool
};

export default AdminSummaryCard;
