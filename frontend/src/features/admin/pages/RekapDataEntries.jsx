import React, { useState, useEffect } from "react";
import { Printer, FileSpreadsheet, Calendar, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { getRekapEntries, exportRekapFax } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const RekapDataEntries = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Luar Negeri");
  const [dateFilterType, setDateFilterType] = useState("Bulan Ini");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const tabs = ["Luar Negeri", "Dalam Negeri", "Perintis", "Rakyat"];

  const fetchData = async () => {
    // Only fetch if dates are calculated
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const data = await getRekapEntries({
        category: activeTab,
        start_date: startDate,
        end_date: endDate,
      });
      setData(data);
    } catch (error) {
      console.error("Error fetching rekap data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize dates based on filter type
  useEffect(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    // Helper to get start/end of week (assuming Monday start)
    const getWeekRange = (date) => {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const monday = new Date(date.setDate(diff));
      const sunday = new Date(date.setDate(monday.getDate() + 6));
      return { start: monday, end: sunday };
    };

    if (dateFilterType === "Minggu Ini") {
      const week = getWeekRange(new Date());
      start = week.start;
      end = week.end;
    } else if (dateFilterType === "Bulan Ini") {
      start.setDate(1); // First day of current month
      end = today;
    } else if (dateFilterType === "Tahun Ini") {
      start = new Date(today.getFullYear(), 0, 1); // Jan 1st
      end = today;
    } else if (dateFilterType === "Tahun Lalu") {
      start = new Date(today.getFullYear() - 1, 0, 1); // Jan 1st Last Year
      end = new Date(today.getFullYear() - 1, 11, 31); // Dec 31st Last Year
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  }, [dateFilterType]);

  // Fetch Data
  useEffect(() => {
    // Wait until start/end are populated
    if (!startDate || !endDate) return;
    fetchData();
  }, [activeTab, startDate, endDate]);

  const handleExportExcel = async () => {
    // We use backend endpoint for precise FAX-AL format
    if (!startDate || !endDate) return;

    // Parse month/year from startDate (assuming monthly report logic)
    // The backend expects specific month/year.
    // If filter is range, we pick the month of startDate
    const d = new Date(startDate);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    try {
      const response = await api.get("/export/rekap-fax", {
        params: {
          bulan: month,
          tahun: year,
        },
        responseType: "blob", // Important for file download
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Rekap_FAX_AL_${month}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export Excel Failed", error);
      alert("Gagal export Excel");
    }
  };

  const handleExportPDF = () => {
    if (!startDate || !endDate) return;
    navigate(
      `/admin/rekap-entries/print?start_date=${startDate}&end_date=${endDate}`
    );
  };

  const formatNumber = (num) => {
    // If num is null, undefined, or NaN, return "0"
    if (num === null || num === undefined || isNaN(num)) {
      return "0";
    }
    return new Intl.NumberFormat("id-ID").format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Rekap Data Entries
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Laporan rekapitulasi data operasional per kategori
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="btn btn-secondary text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            <FileSpreadsheet size={18} className="mr-2" />
            Excel
          </button>
          <button
            onClick={handleExportPDF}
            className="btn btn-primary shadow-lg shadow-primary-500/30"
          >
            <Printer size={18} className="mr-2" />
            Cetak PDF
          </button>
        </div>
      </div>

      {/* Filter & Tabs Card */}
      <div className="card p-1">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-b border-slate-100">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
              <Calendar size={16} />
              <span className="font-medium">
                {startDate} - {endDate}
              </span>
            </div>
            <div className="relative">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                value={dateFilterType}
                onChange={(e) => setDateFilterType(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 appearance-none cursor-pointer hover:border-slate-300 transition-colors"
              >
                <option value="Minggu Ini">Minggu Ini</option>
                <option value="Bulan Ini">Bulan Ini</option>
                <option value="Tahun Ini">Tahun Ini</option>
                <option value="Tahun Lalu">Tahun Lalu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 animate-pulse">
              <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-slate-200 rounded"></div>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Header Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Total Unit
                  </p>
                  <p className="text-3xl font-black text-slate-800">
                    {formatNumber(data.header.unit)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Total GRT
                  </p>
                  <p className="text-3xl font-black text-slate-800">
                    {formatNumber(data.header.total_grt)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Total LOA
                  </p>
                  <p className="text-3xl font-black text-slate-800">
                    {formatNumber(data.header.total_loa)}
                  </p>
                </div>
              </div>

              {/* Data Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bongkar Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                    <h3 className="font-bold text-blue-800">
                      Kegiatan Bongkar
                    </h3>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Inbound
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-left">Komoditas</th>
                        <th className="px-6 py-3 text-right">Volume</th>
                        <th className="px-6 py-3 text-center">Satuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {Object.keys(data.bongkar).map((key) => (
                        <tr key={key} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-medium text-slate-700">
                            {key}
                          </td>
                          <td className="px-6 py-3 text-right font-mono text-slate-600">
                            {formatNumber(data.bongkar[key].value)}
                          </td>
                          <td className="px-6 py-3 text-center text-xs text-slate-400">
                            {data.bongkar[key].satuan}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Muat Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                    <h3 className="font-bold text-emerald-800">
                      Kegiatan Muat
                    </h3>
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      Outbound
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-left">Komoditas</th>
                        <th className="px-6 py-3 text-right">Volume</th>
                        <th className="px-6 py-3 text-center">Satuan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {Object.keys(data.muat).map((key) => (
                        <tr key={key} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3 font-medium text-slate-700">
                            {key}
                          </td>
                          <td className="px-6 py-3 text-right font-mono text-slate-600">
                            {formatNumber(data.muat[key].value)}
                          </td>
                          <td className="px-6 py-3 text-center text-xs text-slate-400">
                            {data.muat[key].satuan}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>Tidak ada data untuk ditampilkan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RekapDataEntries;
