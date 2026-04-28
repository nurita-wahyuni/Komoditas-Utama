import {
  LayoutDashboard,
  Ship,
  FileText,
  LogOut,
  UserCheck,
  PieChart,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || "OPERATOR";
  const userName = user?.name || user?.nama || "User";
  const userEmail = user?.email || "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminMenuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Rekap Data Entries",
      path: "/admin/rekap-entries",
      icon: <PieChart size={20} />,
    },
    {
      name: "Rekap Laporan Operator",
      path: "/admin/rekap-operator",
      icon: <FileText size={20} />,
    },
    {
      name: "Manajemen Operator",
      path: "/admin/operators",
      icon: <UserCheck size={20} />,
    },
  ];

  const operatorMenuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Entri Kapal",
      path: "/entri",
      icon: <Ship size={20} />,
    },
    {
      name: "Laporan Saya",
      path: "/laporan",
      icon: <FileText size={20} />,
    },
  ];

  const menuItems = userRole === "ADMIN" ? adminMenuItems : operatorMenuItems;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 z-50 font-sans flex flex-col shadow-2xl overflow-hidden bg-gradient-to-b from-[#e0f2fe] to-[#0f172a] text-slate-800">
      {/* Header Logo BPS */}
      <div className="relative z-10 px-6 py-6 border-b border-slate-200/20">
        <div className="flex items-center gap-3">
          {/* BPS Logo Image */}
          <div className="shrink-0">
            <img
              src="/logo-bps.png"
              alt="Logo BPS"
              className="w-10 h-auto object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-extrabold text-slate-900 leading-tight tracking-tight">
              BADAN PUSAT STATISTIK
            </h1>
            <p className="text-[10px] font-semibold text-slate-600 truncate mt-0.5">
              Pelabuhan Indonesia
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 group-hover:text-slate-300 transition-colors">
          Main Menu
        </div>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1"
                  : "text-slate-700 hover:bg-white/40 hover:text-blue-900 hover:shadow-sm hover:translate-x-1"
              }`}
            >
              <span
                className={`transition-colors duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 group-hover:text-blue-700"
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-sm font-semibold tracking-wide ${
                  isActive ? "font-bold" : ""
                }`}
              >
                {item.name}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="relative z-10 p-4 border-t border-white/10 bg-gradient-to-t from-slate-900/80 to-transparent backdrop-blur-[2px]">
        <div className="flex items-center gap-3 px-4 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold border border-white/30">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-white/60 truncate">{userRole}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-500/30 group border border-white/5"
        >
          <LogOut
            size={16}
            className="group-hover:scale-110 transition-transform"
          />
          <span className="text-xs font-bold">Keluar</span>
        </button>

        <div className="mt-4 text-center">
          <p className="text-[9px] text-white/30 font-medium tracking-wider">
            v2.0.0 Enterprise
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
