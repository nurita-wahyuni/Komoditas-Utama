import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEntryDetail } from "../../../services/api";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Box,
  Flag,
  Ship,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const DetailReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const isTimestamp = id.includes(" ") || id.includes("T") || id.includes("-");
        const res = await getEntryDetail(id, isTimestamp ? { by_timestamp: true } : {});
        setData(res);
      } catch (err) {
        console.error("Failed to fetch detail:", err);
        toast.error("Gagal memuat detail laporan");
        navigate("/laporan");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  if (!data) return null;

  // Handle both single entry and grouped entries
  const entries = data.entries || [data];
  const firstEntry = entries[0];
  const reportTimestamp = data.timestamp || firstEntry.submitted_at;
  const operatorName = data.operator_name || firstEntry.operator_name;
  const reportStatus = data.status || firstEntry.status;

  const formatOnlyDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 print:p-0 print:bg-white relative">
      {/* Toolbar (Hidden on Print) */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden relative z-10">
        <button
          onClick={() => navigate("/laporan")}
          className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200"
        >
          <ArrowLeft size={20} className="mr-2" />
          Kembali ke Laporan Saya
        </button>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center border border-orange-200">
          <FileText size={16} className="mr-2" />
          Mode Baca Saja (Read-Only)
        </div>
      </div>

      {/* Paper Sheet */}
      <div className="max-w-5xl mx-auto bg-white shadow-2xl print:shadow-none min-h-[1123px] relative z-10 print:w-full print:max-w-none rounded-xl overflow-hidden border border-slate-200 print:border-none">
        {/* Header - Matches PDF Template Style (BPS KOTA BONTANG) */}
        <div className="p-8 pb-6 bg-white border-b-4 border-slate-900">
          <div className="flex items-center gap-8">
            {/* Logo BPS */}
            <div className="w-24 h-20 flex-shrink-0">
              <img
                src="/logo-bps.png"
                alt="Logo BPS"
                className="w-full h-full object-contain"
              />
            </div>
            {/* Text Header */}
            <div className="flex-1">
              <h1 className="text-3xl font-black text-slate-900 uppercase leading-none tracking-tight">
                BADAN PUSAT STATISTIK
                <br />
                KOTA BONTANG
              </h1>
              <div className="text-xs text-slate-600 font-medium leading-relaxed mt-2 max-w-xl">
                Jl. Awang Long No 2, Bontang Baru, Kec. Bontang Utara, Kota
                Bontang
                <br />
                Telp (0548) 26066 | Homepage: https://bontangkota.bps.go.id/ |
                E-mail: bps6474@bps.go.id
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-10 space-y-8">
          {/* Title Area */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                LAPORAN OPERASIONAL PELABUHAN
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Operator: <span className="text-slate-900 font-bold">{operatorName}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Pelaporan</p>
              <p className="text-sm font-bold text-slate-800">
                {formatOnlyDate(reportTimestamp)}
              </p>
              <p className="text-xs font-mono text-slate-500">
                Pukul {new Date(reportTimestamp).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Table Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-4 py-4 text-center border-r border-slate-700 w-12">No</th>
                  <th className="px-6 py-4 border-r border-slate-700 w-32">Tanggal</th>
                  <th className="px-6 py-4 border-r border-slate-700 w-28">Kegiatan</th>
                  <th className="px-6 py-4 border-r border-slate-700">Komoditas</th>
                  <th className="px-6 py-4 border-r border-slate-700 text-right w-32">Volume</th>
                  <th className="px-6 py-4 text-left w-32">LOA/GRT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-6 text-center text-slate-400 font-mono border-r border-slate-100">
                      {index + 1}
                    </td>
                    <td className="px-6 py-6 font-bold text-slate-700 border-r border-slate-100">
                      {formatOnlyDate(item.tanggal_laporan)}
                    </td>
                    <td className="px-6 py-6 border-r border-slate-100">
                      <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                        item.jenis_kegiatan === 'Bongkar' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.jenis_kegiatan}
                      </span>
                    </td>
                    <td className="px-6 py-6 border-r border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 leading-none mb-1">
                          {item.komoditas || item.nama_muatan}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium italic">
                          {item.kategori_pelayaran}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right border-r border-slate-100">
                      <div className="flex flex-col">
                        <span className="font-mono font-black text-slate-900 text-lg leading-none">
                          {parseFloat(item.jumlah_muatan).toLocaleString("id-ID")}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                          {item.satuan_muatan}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">LOA:</span>
                          <span className="text-xs font-mono font-bold text-slate-700">{parseFloat(item.loa).toLocaleString("id-ID")}m</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">GRT:</span>
                          <span className="text-xs font-mono font-bold text-slate-700">{parseFloat(item.grt).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stripe */}
        <div className="h-3 bg-slate-900 w-full absolute bottom-0"></div>
      </div>
    </div>
  );
};

export default DetailReportPage;
