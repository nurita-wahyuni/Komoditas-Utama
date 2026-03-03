import Sidebar from "./Sidebar";
import PropTypes from "prop-types";
import { Search, Bell, User } from "lucide-react";

const AdminLayout = ({ children }) => {
  return (
    <div className="bg-background min-h-screen font-sans selection:bg-primary-100 selection:text-primary-700">
      <Sidebar />

      {/* Topbar */}
      <header className="h-20 bg-surface-card/80 backdrop-blur-md border-b border-surface-divider fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-between transition-all duration-300 shadow-sm">
        {/* Breadcrumb / Title Area */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-text-muted">Admin Area</span>
          <span className="text-surface-divider">/</span>
          <span className="font-bold text-foreground">Dashboard</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center px-3 py-1.5 bg-accent/10 text-accent rounded-lg text-xs font-bold border border-accent/20 uppercase tracking-wider">
            Administrator Mode
          </div>

          <div className="h-6 w-px bg-surface-divider"></div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-text-muted hover:text-foreground hover:bg-surface-hover rounded-full transition-all duration-300">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
            </button>

             <div className="flex items-center gap-3 pl-2 cursor-pointer group">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-white shadow-sm group-hover:shadow-md transition-all duration-300">
                <User size={20} />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-foreground leading-none group-hover:text-primary transition-colors">
                  Administrator
                </p>
                <p className="text-[10px] font-semibold text-text-muted mt-1 tracking-wide uppercase">
                  Super User
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
