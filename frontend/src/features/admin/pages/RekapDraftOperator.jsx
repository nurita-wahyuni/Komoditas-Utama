import { useState, useEffect } from "react";
import { getAutoSubmitHistory } from "../../../services/api";
import {
  Users,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

import { useNavigate } from "react-router-dom";

const RekapDraftOperator = () => {
  const navigate = useNavigate();
  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [filterType, setFilterType] = useState("all"); // latest, week, month, all
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // desc, asc
  const [page, setPage] = useState(1);
  // Default limit to a reasonable number since dropdown is removed, or keep state but remove UI
  const [limit] = useState(10);

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1); // Reset to page 1 on search
      fetchData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fetch on other changes
  useEffect(() => {
    fetchData();
  }, [filterType, sortOrder, page, limit]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        filter: filterType,
        search: searchTerm,
        sort: sortOrder,
        page: page,
        limit: limit,
      };
      const response = await getAutoSubmitHistory(params);

      // Safety check: response might be array directly or {data: [], total: ...}
      // Based on API implementation, if it returns list directly:
      if (Array.isArray(response)) {
        setData(response);
        setTotalData(response.length);
        setTotalPages(Math.ceil(response.length / limit));
      } else if (response && Array.isArray(response.data)) {
        setData(response.data);
        setTotalData(response.total || 0);
        setTotalPages(response.total_pages || 1);
      } else {
        // Fallback
        setData([]);
        setTotalData(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Gagal memuat data history");
      setData([]); // Ensure data is array on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            Rekap Laporan Operator
          </h1>
          <p className="text-slate-500 mt-1">
            Monitoring data laporan yang masuk dari Operator.
          </p>
        </div>
        {/* Export buttons removed */}
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Left: Filter & Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Filter size={16} className="text-slate-500" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="1_month">1 Bulan yang lalu</option>
              <option value="3_months">3 Bulan yang lalu</option>
              <option value="6_months">6 Bulan yang lalu</option>
              <option value="all">Semua (1 Tahun)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <ArrowUpDown size={16} className="text-slate-500" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
          </div>
        </div>

        {/* Right: Search */}
        <div className="relative w-full lg:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Cari nama operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* TABLE CONTENT */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Tanggal Laporan</th>
                <th className="px-6 py-4 font-semibold">Nama Operator</th>
                <th className="px-6 py-4 font-semibold text-center">Jumlah Data</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-40"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Clock size={48} className="text-slate-200 mb-4" />
                      <p className="text-lg font-medium text-slate-500">
                        Tidak ada riwayat laporan
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Coba ubah filter waktu atau kata kunci pencarian.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      {formatDate(row.date)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {row.operator_name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {row.total_entries} Data
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/rekap-operator/detail/${row.operator_id}/${encodeURIComponent(
                              row.timestamp ||
                                row.date.replace(" ", "T") + ":00"
                            )}`
                          )
                        }
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition shadow-sm"
                      >
                        <ExternalLink size={14} className="mr-1.5" />
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {(page - 1) * limit + 1} - {Math.min(page * limit, totalData)}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-slate-700">{totalData}</span>{" "}
            data
          </div>

          <div className="flex items-center gap-4">
            {/* Limit dropdown removed */}

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-4 text-sm font-medium text-slate-700">
                Hal {page} dari {totalPages || 1}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RekapDraftOperator;
