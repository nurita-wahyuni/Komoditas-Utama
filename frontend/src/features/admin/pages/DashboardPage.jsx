import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getDashboardTrend,
} from "../../../services/api";
import {
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useAuth } from "../../../context/AuthContext";

const CARGO_COLORS = {
  "Luar Negeri": "#3B82F6",
  "Dalam Negeri": "#22C55E",
  "Lainnya": "#64748B",
};

const getColor = (name, index) => {
  if (CARGO_COLORS[name]) return CARGO_COLORS[name];
  const colors = [
    "#2563EB",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];
  return colors[index % colors.length];
};

const CustomTrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 min-w-[200px]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 border-b pb-1">
          Bulan: {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500">
                Komoditas: <span style={{ color: entry.color }}>{entry.name}</span>
              </span>
              <span className="text-sm font-bold text-slate-800">
                Volume: {entry.value.toLocaleString("id-ID")} Ton
              </span>
            </div>
          ))}
          {payload.every((p) => p.value === 0) && (
            <p className="text-[10px] text-slate-400 italic text-center">
              Tidak ada muatan
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  const [selectedTrendYear, setSelectedTrendYear] = useState(currentYear);
  const [trendType, setTrendType] = useState("Luar Negeri");
  const [trendData, setTrendData] = useState({ bongkar: [], muat: [] });
  const [trendSeries, setTrendSeries] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setTrendLoading(true);
        const res = await getDashboardTrend(selectedTrendYear, trendType);
        setTrendData({
          bongkar: res.bongkar || [],
          muat: res.muat || [],
        });
        setTrendSeries(res.series || []);
      } catch (error) {
        console.error("Failed to fetch trend data", error);
      } finally {
        setTrendLoading(false);
      }
    };
    fetchTrend();
  }, [selectedTrendYear, trendType]);

  const renderTrendChart = (title, data) => (
    <div className="rounded-xl bg-white shadow-sm p-6 border border-slate-100 h-[500px] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            {title} {trendType} (Januari - Desember)
          </h3>
        </div>

        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <select
            className="bg-slate-50 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:border-blue-500/50"
            value={selectedTrendYear}
            onChange={(e) => setSelectedTrendYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
            {["Luar Negeri", "Dalam Negeri"].map((type) => (
              <button
                key={type}
                onClick={() => setTrendType(type)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-200 ${
                  trendType === type
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-w-0 min-h-0 relative mt-4">
        {trendLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-pulse">
            <Loader2 size={32} className="animate-spin mb-2 text-blue-600" />
            <span className="text-xs font-medium uppercase tracking-widest">
              Memuat data grafik...
            </span>
          </div>
        ) : (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                  dy={10}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
                  label={{
                    value: "Volume (Ton)",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      textAnchor: "middle",
                      fill: "#94A3B8",
                      fontSize: 12,
                      fontWeight: 600,
                    },
                  }}
                  tickFormatter={(value) => value.toLocaleString("id-ID")}
                />
                <Tooltip content={<CustomTrendTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{
                    top: -10,
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#64748B",
                  }}
                />
                {trendSeries.map((serie, index) => (
                  <Line
                    key={serie}
                    type="monotone"
                    dataKey={serie}
                    name={serie}
                    stroke={getColor(serie, index)}
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      stroke: "#ffffff",
                      strokeWidth: 2,
                      fill: getColor(serie, index),
                    }}
                    activeDot={{
                      r: 7,
                      strokeWidth: 0,
                      fill: getColor(serie, index),
                    }}
                    animationDuration={1500}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 p-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Selamat Datang, {user?.name || user?.nama || "Administrator"}!
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Overview kinerja operasional pelabuhan untuk periode{" "}
            <span className="font-semibold text-primary">Tahun {selectedTrendYear}</span>
          </p>
        </div>
      </div>

      {/* Analytics Section - Grid layout for side-by-side charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderTrendChart("Tren Realisasi Muatan Bongkar", trendData.bongkar)}
        {renderTrendChart("Tren Realisasi Muatan Muat", trendData.muat)}
      </div>
    </div>
  );
};

export default DashboardPage;
