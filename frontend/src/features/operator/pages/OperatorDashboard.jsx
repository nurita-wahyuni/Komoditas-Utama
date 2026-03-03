import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getYearlySummary, getDashboardTrend } from "../../../services/api";
import SummaryCard from "../../../components/shared/SummaryCard";
import {
  Ship,
  TrendingUp,
  Loader2,
  FileText,
  Anchor,
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
  "AMM. NITRATE": "#FACC15", // Yellow-400
  AMONIA: "#A855F7", // Purple-500
  LNG: "#3B82F6", // Blue-500
  LPG: "#EF4444", // Red-500
  PUPUK: "#22C55E", // Green-500
  // Fallbacks
  BARANG: "#64748B",
  DEFAULT: "#94A3B8",
};

const getColor = (name, index) => {
  if (CARGO_COLORS[name]) return CARGO_COLORS[name];
  const colors = [
    "#F58220", // Orange
    "#E11D48", // Pink
    "#0072CE", // Primary
    "#6DBE45", // Success
    "#0F2A44", // Dark
  ];
  return colors[index % colors.length];
};

// Custom Tooltip for Trend (Line Chart)
const CustomTrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-card p-4 rounded-lg shadow-elevation border border-surface-divider min-w-[200px]">
        <p className="text-sm font-bold text-foreground border-b border-surface-divider pb-2 mb-2 text-center">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex justify-between items-center gap-3 text-xs">
              <span style={{ color: entry.color }} className="font-semibold">
                {entry.name} :
              </span>
              <span className="font-bold text-foreground">
                {entry.value.toLocaleString()} Ton
              </span>
            </div>
          ))}
          {payload.every((p) => p.value === 0) && (
            <p className="text-[10px] text-text-muted italic text-center">
              Tidak ada muatan
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const OperatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // --- TREND FILTERS & STATE ---
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  const [selectedTrendYear, setSelectedTrendYear] = useState(currentYear);
  const [trendType, setTrendType] = useState("Bongkar");
  const [trendData, setTrendData] = useState([]);
  const [trendSeries, setTrendSeries] = useState([]);

  const [summaryData, setSummaryData] = useState({
    total_unit: 0,
    total_loa: 0,
  });

  const [trendLoading, setTrendLoading] = useState(false);

  const PERIODE_TEXT = `Tahun ${selectedTrendYear}`;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const targetId = user?.id;
        if (!targetId) return;

        // API expects (year, operatorId)
        const summaryRes = await getYearlySummary(selectedTrendYear, targetId);

        let totalUnit = 0;
        let totalLoa = 0;

        if (Array.isArray(summaryRes)) {
          summaryRes.forEach((item) => {
            totalUnit += parseInt(item.total_unit || 0);
            totalLoa += parseFloat(item.total_loa || 0);
          });
        }

        setSummaryData({
          total_unit: totalUnit,
          total_loa: totalLoa,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    if (user?.id) {
      fetchSummary();
    }
  }, [user, selectedTrendYear]);

  // Fetch Trend Data
  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setTrendLoading(true);
        const res = await getDashboardTrend(selectedTrendYear, trendType);
        // Backend now returns { series: [...], data: [...] }
        setTrendData(res.data || []);
        setTrendSeries(res.series || []);
      } catch (error) {
        console.error("Failed to fetch trend data", error);
        setTrendData([]);
        setTrendSeries([]);
      } finally {
        setTrendLoading(false);
      }
    };

    fetchTrend();
  }, [selectedTrendYear, trendType]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Selamat Datang, {user?.name || user?.nama || "Operator"}!
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Pantau kinerja operasional Anda untuk periode{" "}
            <span className="font-semibold text-primary">
              {PERIODE_TEXT}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/entri")}
            className="btn btn-primary shadow-lg shadow-primary/30"
          >
            <FileText size={18} className="mr-2" />
            Entri Data Baru
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard
          title="Total Kunjungan"
          value={summaryData.total_unit}
          subtext="Unit Kapal"
          icon={<Ship size={24} />}
          color="purple"
        />
        <SummaryCard
          title="Total LOA"
          value={
            summaryData.total_loa
              ? summaryData.total_loa.toLocaleString("id-ID")
              : "0"
          }
          subtext="Meter (Panjang)"
          icon={<Anchor size={24} />}
          color="red"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 gap-8">
        {/* Trend Chart (Full Width) */}
        <div className="card h-[500px] flex flex-col p-6 bg-surface-card rounded-lg shadow-card border border-surface-divider">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                Tren Realisasi Muatan Per Jenis Barang (Januari - Desember)
              </h3>
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-3 mt-2 md:mt-0">
               <select
                className="bg-background text-sm font-semibold text-text-secondary border border-surface-divider rounded-lg px-2 py-1 focus:outline-none cursor-pointer hover:border-primary/50"
                value={selectedTrendYear}
                onChange={(e) => setSelectedTrendYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="flex bg-background rounded-lg p-1 border border-surface-divider">
                {["Bongkar", "Muat"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTrendType(type)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-200 ${
                      trendType === type
                        ? "bg-surface-card text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
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
              <div className="h-full flex flex-col items-center justify-center text-text-muted animate-pulse">
                <Loader2
                  size={32}
                  className="animate-spin mb-2 text-primary"
                />
                <span className="text-xs font-medium">
                  Memuat data grafik...
                </span>
              </div>
            ) : (
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E3E8EE"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={true}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9AA7B5", fontWeight: 600 }}
                      dy={10}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9AA7B5", fontWeight: 600 }}
                      label={{ 
                        value: 'Volume (Ton)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#9AA7B5', fontSize: 12, fontWeight: 600 }
                      }}
                    />
                    <Tooltip content={<CustomTrendTooltip />} cursor={{ stroke: '#9AA7B5', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconType="plainline"
                      wrapperStyle={{ top: -10, fontSize: '12px', fontWeight: 600, color: '#6B7C93' }}
                    />
                    
                    {trendSeries.map((serie, index) => (
                      <Line
                        key={serie}
                        type="monotone"
                        dataKey={serie}
                        stroke={getColor(serie, index)}
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: getColor(serie, index) }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: getColor(serie, index) }}
                        animationDuration={1500}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
