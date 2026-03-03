import { User, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-between transition-all duration-300">
      {/* Left Side: Empty or Breadcrumb (Search Bar Removed) */}
      <div className="flex items-center gap-4 w-96">
        {/* Search Bar Removed */}
      </div>

      {/* Right Side: Status & Profile */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all duration-300">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-3 pl-2 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-slate-600 border border-white shadow-sm group-hover:shadow-md transition-all duration-300">
              <User size={20} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-primary-600 transition-colors">
                {user?.name || user?.nama || "User"}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 tracking-wide uppercase">
                {user?.role || "Guest"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
