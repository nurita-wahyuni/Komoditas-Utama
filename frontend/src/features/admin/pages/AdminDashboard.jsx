import { useState, useEffect } from "react";
import { getDashboardTrend } from "../../../services/api";
import { Users, Ship, CheckCircle, TrendingUp, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import toast from "react-hot-toast";

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

// Custom Tooltip for Trend (Line Chart) - Identical to Operator
const CustomTrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-card p-4 rounded-lg shadow-elevation border border-surface-divider min-w-[200px]">
        <p className="text-sm font-bold text-foreground border-b border-surface-divider pb-2 mb-2 text-center">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((entry, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center gap-3 text-xs"
            >
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

import { isMonthDisabled } from "../../../utils/dateHelpers";

const AdminDashboard = () => {
  // --- STATE ---
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth(); // 0-11

  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  // Global Filters
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex + 1); // 1-12
  const [trendType, setTrendType] = useState("Bongkar");

  const [trendData, setTrendData] = useState([]);
  const [trendSeries, setTrendSeries] = useState([]);

  const [loading, setLoading] = useState(true);

  // Constants
  const MONTH_NAMES = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Effect: Reset selected month if it becomes invalid when year changes
  useEffect(() => {
    if (isMonthDisabled(selectedMonth - 1, selectedYear)) {
      // If currently selected month is disabled in the new year,
      // fallback to the max available month (usually current month if current year)
      // or January if past year (but past year all enabled).
      // Logic: If selectedYear is currentYear, max is currentMonth + 1.
      if (selectedYear === currentYear) {
        setSelectedMonth(currentMonthIndex + 1);
      }
    }
  }, [selectedYear]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Trend Chart: Filter by Year and Type (Monthly breakdown)
        const trend = await getDashboardTrend(selectedYear, trendType);

        setTrendData(trend.data || []);
        setTrendSeries(trend.series || []);
      } catch (error) {
        console.error("Failed to fetch admin dashboard", error);
        toast.error("Gagal memuat data dashboard");
        // Reset on error
        setTrendData([]);
        setTrendSeries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth, trendType]); // Refetch when any filter changes

  return (
    <div className="space-y-6">
      {/* Header & Global Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Ringkasan aktivitas pelabuhan bulan{" "}
            <span className="font-semibold text-primary">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-slate-50 border-none rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 bg-slate-50 border-none rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-slate-100 transition-colors min-w-[120px]"
          >
            {MONTH_NAMES.map((m, index) => {
              const disabled = isMonthDisabled(index, selectedYear);
              return (
                <option
                  key={index}
                  value={index + 1}
                  disabled={disabled}
                  className={
                    disabled ? "text-slate-300 bg-slate-50" : "text-slate-700"
                  }
                >
                  {m}
                </option>
              );
            })}
          </select>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* Type Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            {["Bongkar", "Muat"].map((type) => (
              <button
                key={type}
                onClick={() => setTrendType(type)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
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

      {/* Unified Dashboard Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {/* Chart Section (Inside Container) */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Tren Realisasi {trendType} (Januari - Desember)
            </h3>
          </div>

          <div
            className="flex-1 w-full min-w-0 min-h-0 relative mt-4"
            style={{ height: 400 }}
          >
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted animate-pulse">
                <Loader2 size={32} className="animate-spin mb-2 text-primary" />
                <span className="text-xs font-medium">
                  Memuat data grafik...
                </span>
              </div>
            ) : trendData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="text-center text-slate-400">
                  <TrendingUp size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium">Tidak ada data tren</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                >
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
                        value: "Volume (Ton)",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: "#9AA7B5",
                          fontSize: 12,
                          fontWeight: 600,
                        },
                      }}
                    />
                    <Tooltip
                      content={<CustomTrendTooltip />}
                      cursor={{
                        stroke: "#9AA7B5",
                        strokeWidth: 1,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="plainline"
                      wrapperStyle={{
                        top: -10,
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#6B7C93",
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
                          r: 4,
                          strokeWidth: 2,
                          fill: "#fff",
                          stroke: getColor(serie, index),
                        }}
                        activeDot={{
                          r: 6,
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
      </div>
    </div>
  );
};

export default AdminDashboard;
