import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add navigate
import { getEntries, deleteEntry } from "../../../services/api";
import {
  FileText,
  Search,
  Eye,
  Ship,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import SummaryCard from "../../../components/shared/SummaryCard";

import { formatDateIndo, formatNumberIndo } from "../../../utils/dateHelpers";

const DataPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- AMBIL DATA DARI BACKEND ---
  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch 100 latest entries for this operator (no date filter, all statuses?)
      // Requirement: "Data yang di tampilkan, adalah 100 data terakhir yang di input"
      // Requirement: "tampilan yang di tampilkan berdasarkan tanggal terbaru penginputan dan wajib ber urut"
      
      // We'll fetch broadly and slice client side for now, or backend needs limit.
      // Assuming getEntries returns all if no year/month provided? 
      // Actually getEntries usually requires year/month or defaults to current.
      // Let's try to fetch all recent by NOT passing year/month if API supports it, 
      // OR we fetch current year.
      // Ideally backend should have a "recent" endpoint.
      // For now, let's fetch current year data.
      
      const res = await getEntries({
        operator_id: user?.id,
        grouped: true,
      });
      
      // If API requires month, we might need to loop or change API. 
      // But looking at previous usage, getEntries(user_id, year, month)
      // Let's assume we can fetch by year.
      
      let allData = Array.isArray(res) ? res : [];
      
      // Sort by Created At / Input Date (Desc) - assuming id or created_at proxy
      // Requirement: "berdasarkan tanggal terbaru penginputan" -> created_at ideally, or id desc
      // If created_at not available, use id desc (assuming auto-inc) or tanggal_laporan
      
      allData.sort((a, b) => (b.id || 0) - (a.id || 0));
      
      // Limit to 100
      const recentData = allData.slice(0, 100);
      
      setData(recentData);
    } catch (error) {
      console.error("Gagal ambil data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const displayData = data.filter((item) => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (item.operator_name || "").toLowerCase().includes(searchStr) ||
      (item.activities || "").toLowerCase().includes(searchStr) ||
      (item.categories || "").toLowerCase().includes(searchStr);
    return matchesSearch;
  });

  // delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus baris ini?")) return;
    try {
      await deleteEntry(id);
      toast.success("Data berhasil dihapus");
      // remove locally
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Gagal menghapus entri:", err);
      toast.error("Gagal menghapus data");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary-600" />
            Report Entry
          </h1>
          <p className="text-slate-500 mt-1">
            Riwayat 100 data terakhir yang diinput
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search */}
        <div className="border-b border-slate-200 p-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari entri..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4">Waktu Pelaporan</th>
                <th className="px-6 py-4">Kategori Pelayaran</th>
                <th className="px-6 py-4">Jenis Kegiatan</th>
                <th className="px-6 py-4 text-center">Jumlah Entri</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                      <p className="text-slate-500 font-medium">
                        Memuat data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : displayData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <Ship className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="text-slate-500">
                        <p className="font-medium text-slate-700">
                          Tidak ada data ditemukan
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                displayData.map((item, index) => (
                  <tr
                    key={item.timestamp || index}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {/* Waktu Pelaporan */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">
                          {formatDateIndo(item.date)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Pukul {new Date(item.date).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.categories.split(', ').map((cat, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Kegiatan */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.activities.split(', ').map((act, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            act === "Bongkar" ? "text-orange-600 bg-orange-50" : "text-emerald-600 bg-emerald-50"
                          }`}>
                            {act}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Jumlah Entri */}
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-700">
                      {item.total_entries}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                         item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                       }`}>
                         {item.status}
                       </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/laporan/detail/${item.timestamp}`)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center gap-2 font-bold text-xs"
                        title="Lihat Detail"
                      >
                        <Eye size={16} /> Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
           <span>Menampilkan {displayData.length} data</span>
           <span>Maksimal 100 data terakhir</span>
        </div>
      </div>
    </div>
  );
};

export default DataPage;
