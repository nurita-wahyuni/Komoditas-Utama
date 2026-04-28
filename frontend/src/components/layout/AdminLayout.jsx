import Sidebar from "./Sidebar";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { User } from "lucide-react";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin") return "Dashboard";
    if (path === "/admin/rekap-entries") return "Rekap Data Entries";
    if (path === "/admin/rekap-operator") return "Rekap Laporan Operator";
    if (path.includes("/admin/rekap-operator/detail")) return "Detail Laporan Operator";
    if (path === "/admin/operators") return "Manajemen Operator";
    return "Dashboard";
  };

  return (
    <div className="bg-background min-h-screen font-sans selection:bg-primary-100 selection:text-primary-700">
      <Sidebar />

      {/* Topbar */}
      <header className="h-20 bg-surface-card/80 backdrop-blur-md border-b border-surface-divider fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-between transition-all duration-300 shadow-sm">
        {/* Breadcrumb / Title Area */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-text-muted">Admin Area</span>
          <span className="text-surface-divider">/</span>
          <span className="font-bold text-foreground">{getPageTitle()}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-xs font-bold border border-accent/20 uppercase tracking-wider">
            Administrator Mode
          </div>

          <div className="h-6 w-px bg-surface-divider"></div>

          <div className="flex items-center gap-4">
            {/* User Info - Static (Non-clickable) */}
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-600 border border-white shadow-sm">
                <User size={20} />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-slate-700 leading-none">
                  {user?.name || user?.nama || "Admin"}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 mt-1 tracking-wide uppercase">
                  {user?.role || "ADMINISTRATOR"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pl-64 pt-20 transition-all duration-300">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminLayout;
