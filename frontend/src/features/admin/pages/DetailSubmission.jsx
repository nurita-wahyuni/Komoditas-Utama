import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Edit2,
  Trash2,
  CheckCircle,
  Ship,
  Flag,
  Navigation,
  MapPin,
  Box,
  Save,
  XCircle,
  Loader2,
  AlertTriangle,
  Download
} from "lucide-react";
import { BlobProvider } from "@react-pdf/renderer";
import RekapPdfDocument from "../components/RekapPdfDocument";
import {
  getEntriesByGroup,
  updateEntryAdmin,
  deleteEntryAdmin,
} from "../../../services/api";
import toast from "react-hot-toast";

const DetailSubmission = () => {
  const { operatorId, submittedAt: rawSubmittedAt } = useParams();
  const submittedAt = decodeURIComponent(rawSubmittedAt);
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Confirm Delete State
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [operatorId, submittedAt]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await getEntriesByGroup(operatorId, submittedAt);
      // Backend should already return operator_name in each entry if joined
      setEntries(data || []);
    } catch (error) {
      console.error("Failed to fetch details", error);
      toast.error("Gagal memuat detail data");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (entry) => {
    setEditingEntry({ ...entry });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEntryAdmin(deleteId);
      toast.success("Data berhasil dihapus");
      const updatedEntries = entries.filter((e) => e.id !== deleteId);
      setEntries(updatedEntries);
      setDeleteId(null);
      
      // If no entries left in this group, go back
      if (updatedEntries.length === 0) {
        navigate("/admin/rekap-operator");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus data");
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      await updateEntryAdmin(editingEntry.id, editingEntry);
      toast.success("Data berhasil diperbarui");
      setIsEditOpen(false);
      fetchDetail(); // Refresh to get latest data
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = (blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_Admin_${submittedAt.replace(/[: ]/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
      toast.success("Laporan berhasil diunduh");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr.replace(" ", "T")).toLocaleString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatOnlyDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* HEADER NAVIGATION */}
      <div className="mb-8 max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/admin/rekap-operator")}
          className="flex items-center text-slate-500 hover:text-blue-600 mb-4 transition-colors font-medium print:hidden"
        >
          <ArrowLeft size={20} className="mr-2" /> Kembali ke Rekap Laporan
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <User className="text-blue-600" /> Detail Laporan Operator
            </h1>
            <div className="flex items-center gap-6 mt-3 text-slate-600 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  Waktu Submit: <strong>{formatDate(submittedAt)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>
                  Total Entri: <strong>{entries.length}</strong>
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {isDownloading ? (
              <BlobProvider
                document={
                  <RekapPdfDocument 
                    dataLuarNegeri={{ entries: entries.filter(e => e.kategori_pelayaran === 'Luar Negeri') }}
                    dataDalamNegeri={{ entries: entries.filter(e => e.kategori_pelayaran === 'Dalam Negeri') }}
                    dataPerintis={{ entries: entries.filter(e => e.kategori_pelayaran === 'Perintis') }}
                    dataRakyat={{ entries: entries.filter(e => e.kategori_pelayaran === 'Rakyat') }}
                    startDate={formatOnlyDate(submittedAt)}
                    endDate={formatOnlyDate(submittedAt)}
                  />
                }
              >
                {({ blob, loading: pdfLoading }) => {
                  if (!pdfLoading && blob) {
                    handleDownloadPDF(blob);
                  }
                  return (
                    <button className="px-4 py-2 bg-slate-400 text-white rounded-lg font-bold cursor-not-allowed flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" /> Memproses...
                    </button>
                  );
                }}
              </BlobProvider>
            ) : (
              <button 
                onClick={() => setIsDownloading(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2 shadow-lg"
              >
                <Download size={18} /> Unduh PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONSOLIDATED REPORT CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-600" />
          <p className="font-medium">Memuat rincian data...</p>
        </div>
      ) : entries.length > 0 ? (
        <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden mb-12 relative border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* BPS Header */}
          <div className="border-b-4 border-black p-10 pb-6 bg-white relative">
            <div className="flex items-center gap-8">
              <img src="/logo-bps.png" alt="Logo BPS" className="w-28 h-20 object-contain" />
              <div className="flex-1">
                <h1 className="text-3xl font-black text-black uppercase leading-tight tracking-tight">
                  BADAN PUSAT STATISTIK
                  <br />
                  KOTA BONTANG
                </h1>
                <div className="text-xs text-black font-medium leading-relaxed mt-2">
                  Jl. Awang Long No 2, Bontang Baru, Kec. Bontang Utara, Kota Bontang
                  <br />
                  Telp (0548) 26066 | Homepage: https://bontangkota.bps.go.id/ | E-mail: bps6474@bps.go.id
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 space-y-8">
            {/* Report Info */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Laporan Operasional Pelabuhan</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Operator: <span className="font-bold text-slate-700">{entries[0]?.operator_name}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waktu Pelaporan</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{formatDate(submittedAt)}</p>
              </div>
            </div>

            {/* Entries Table */}
            <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800 text-white uppercase text-[10px] tracking-widest font-bold">
                  <tr>
                    <th className="px-4 py-4 border-r border-slate-700">No</th>
                    <th className="px-4 py-4 border-r border-slate-700">Tanggal</th>
                    <th className="px-4 py-4 border-r border-slate-700">Kegiatan</th>
                    <th className="px-4 py-4 border-r border-slate-700">Komoditas</th>
                    <th className="px-4 py-4 border-r border-slate-700 text-right">Volume</th>
                    <th className="px-4 py-4 text-center">LOA/GRT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {entries.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-mono text-slate-400 text-center border-r border-slate-100">{index + 1}</td>
                      <td className="px-4 py-4 font-medium text-slate-700 border-r border-slate-100 whitespace-nowrap">
                        {formatOnlyDate(entry.tanggal_laporan)}
                      </td>
                      <td className="px-4 py-4 border-r border-slate-100">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                          entry.jenis_kegiatan === 'Bongkar' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {entry.jenis_kegiatan}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-r border-slate-100">
                        <div className="font-bold text-slate-800">{entry.komoditas || entry.nama_muatan}</div>
                        <div className="text-[10px] text-slate-400 italic">{entry.kategori_pelayaran}</div>
                      </td>
                      <td className="px-4 py-4 text-right border-r border-slate-100">
                        <div className="font-mono font-bold text-slate-800">
                          {parseFloat(entry.jumlah_muatan || 0).toLocaleString("id-ID")}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{entry.satuan_muatan}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between gap-2 px-2">
                            <span className="text-slate-400 font-bold">LOA:</span>
                            <span className="font-mono font-bold text-slate-700">{parseFloat(entry.loa || 0).toFixed(1)}m</span>
                          </div>
                          <div className="flex justify-between gap-2 px-2">
                            <span className="text-slate-400 font-bold">GRT:</span>
                            <span className="font-mono font-bold text-slate-700">{parseFloat(entry.grt || 0).toFixed(0)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="grid grid-cols-2 pt-10 border-t border-slate-100">
              <div className="text-xs text-slate-400 space-y-2">
                <p>Status Laporan: <span className="font-bold text-blue-600 uppercase tracking-wider">{entries[0]?.status}</span></p>
                <p>ID Transaksi: <span className="font-mono text-slate-500 uppercase">{submittedAt.replace(/[-: ]/g, '')}</span></p>
              </div>
              <div className="flex flex-col items-end">
                <div className="w-32 h-32 border-2 border-slate-100 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200 mb-2 border border-slate-100 shadow-inner">
                    <CheckCircle size={32} />
                  </div>
                  <span className="text-[8px] text-slate-400 font-bold uppercase text-center leading-tight">
                    Digital Signature<br />Verified
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 font-mono">
                  Sistem Informasi Pelaporan Pelabuhan (Simoppel)
                </p>
              </div>
            </div>
          </div>
          {/* Footer Stripe */}
          <div className="h-3 bg-slate-800 w-full"></div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl text-center text-slate-500 border border-slate-200 shadow-sm max-w-4xl mx-auto">
          <XCircle size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Data Tidak Ditemukan</h3>
          <p className="mt-1">Maaf, rincian data untuk grup laporan ini tidak dapat dimuat atau telah dihapus.</p>
          <button 
            onClick={() => navigate("/admin/rekap-operator")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Kembali ke Daftar
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                Edit Data Laporan
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Jenis Kegiatan
                </label>
                <select
                  value={editingEntry.jenis_kegiatan || "Bongkar"}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      jenis_kegiatan: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Bongkar">Bongkar</option>
                  <option value="Muat">Muat</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  LOA (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingEntry.loa || 0}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      loa: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  GRT
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingEntry.grt || 0}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      grt: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Komoditas
                </label>
                <input
                  type="text"
                  value={editingEntry.komoditas || ""}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      komoditas: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Berat (Ton)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingEntry.berat_ton || 0}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      berat_ton: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Jumlah Penumpang
                </label>
                <input
                  type="number"
                  value={editingEntry.jumlah_penumpang || 0}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      jumlah_penumpang: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Save size={18} /> Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Hapus Data?
              </h3>
              <p className="text-slate-500 mb-6 text-sm">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak
                dapat dibatalkan.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailSubmission;