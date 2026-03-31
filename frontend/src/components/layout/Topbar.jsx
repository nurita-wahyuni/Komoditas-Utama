import { User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const Topbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/entri") return "Entri Kapal";
    if (path === "/laporan") return "Laporan Saya";
    if (path.includes("/laporan/detail")) return "Detail Laporan";
    if (path === "/rekap") return "Rekap FAX";
    return "Dashboard";
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-between transition-all duration-300 shadow-sm">
      {/* Left Side: Breadcrumb / Title Area */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold text-slate-400">Operator Area</span>
        <span className="text-slate-300">/</span>
        <span className="font-bold text-slate-700">{getPageTitle()}</span>
      </div>

      {/* Right Side: Status & Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {/* User Info - Static (Non-clickable) */}
          <div className="flex items-center gap-3 pl-2">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-600 border border-white shadow-sm">
              <User size={20} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-slate-700 leading-none">
                {user?.name || user?.nama || "User"}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 tracking-wide uppercase">
                {user?.role || "OPERATOR"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
