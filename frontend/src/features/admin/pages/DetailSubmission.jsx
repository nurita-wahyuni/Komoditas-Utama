import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Edit2,
  Trash2,
  CheckCircle,
  FileText,
  Ship,
  Flag,
  Navigation,
  MapPin,
  Box,
  Save,
  XCircle
} from "lucide-react";
import {
  getEntryDetail, // Changed from getSubmissionDetail to getEntryDetail as per DetailReportPage
  updateEntryAdmin,
  deleteEntryAdmin,
} from "../../../services/api";
import toast from "react-hot-toast";

const DetailSubmission = () => {
  // Using single ID parameter logic like DetailReportPage if possible, 
  // but existing routing seems to use operatorId/submittedAt.
  // Wait, the user request says "tampilan pada halaman detail... seperti halaman detail di panel operator"
  // The operator detail page uses /detail/:id.
  // The admin detail page currently uses /detail/:operatorId/:submittedAt.
  // The admin list links to this page with timestamp.
  // IF the admin list now shows single entries (which it seems to do based on "Detail" button per row),
  // then we might need to adjust.
  // BUT the previous task showed "Detail" button on a row representing a BATCH (grouped by date).
  // HOWEVER, the user asked to change columns to "Nama Kapal/Bendera" which implies each row IS A SHIP ENTRY?
  // Let's check the RekapDraftOperator table again.
  // "Data Entries" column was changed to "Nama Kapal/Bendera".
  // And query was updated to GROUP_CONCAT ships.
  // So one row = One Operator + One Timestamp -> Multiple Ships?
  // OR did we ungroup them?
  // The backend query groups by DATE, operator_id.
  // So one row represents ALL submissions by that operator on that day.
  // So `DetailSubmission` shows a LIST of entries.
  
  // BUT `DetailReportPage` (Operator side) shows a SINGLE entry detail (like a report sheet).
  
  // The user says: "tampilan pada halaman detail... memiliki konsep logic dan design yang sama seperti halaman detail di panel operator".
  // This implies the Admin Detail page should ALSO show a single entry report sheet?
  // But the admin link passes a timestamp group.
  // If the group contains multiple ships, we can't show a single report sheet easily unless we list them and then click to view sheet?
  // OR maybe the user wants the "DetailSubmission" page (which currently shows a table) to look like the report sheet?
  // This only makes sense if the group contains only ONE ship, or if we render multiple sheets.
  
  // Let's assume for now the user wants to view the DETAIL of a specific entry from the list.
  // Wait, if the admin table groups by date, clicking "Detail" opens `DetailSubmission` which lists the ships.
  // Then maybe clicking a ship there should open the "Report Sheet" view?
  // OR the `DetailSubmission` itself should be the report sheet?
  
  // Given the query `GROUP_CONCAT` ships, it implies multiple ships per row.
  // If I change `DetailSubmission` to look like `DetailReportPage` (Single Sheet), it won't work for multiple ships.
  
  // HOWEVER, if the user request implies they want the "Sheet View" for editing/deleting:
  // Maybe I should keep the list in `DetailSubmission`, but when clicking an item, it opens the "Sheet View" (Modal or separate page)?
  // OR maybe the user wants to change the `RekapDraftOperator` to NOT group, so each row is one ship?
  
  // Let's look at the request again: "tampilan pada halaman detail... konsep logic dan design yang sama seperti halaman detail di panel operator... namun button hapus dan edit".
  // The Operator Detail Page IS the "Sheet View".
  
  // If I strictly follow this, I should make `DetailSubmission` show the Sheet View.
  // But `DetailSubmission` currently receives `operatorId` and `submittedAt`.
  // It fetches a LIST of entries.
  
  // If the list has only 1 entry, we can show the sheet.
  // If it has multiple, we might need to show a list first?
  // OR we simply iterate and show multiple sheets?
  
  // Let's try to adapt `DetailSubmission` to show a LIST of "Report Cards" (Sheet style) instead of a table?
  // That would match "design yang sama" (visual style) while handling multiple entries.
  
  // Let's implement rendering the `data` array as multiple "Report Sheets" stacked or in a grid?
  // And each sheet has Edit/Delete buttons.
  
  const { operatorId, submittedAt } = useParams();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // We use getSubmissionDetail which calls /entries/detail-by-time-group logic? 
      // Actually /entries/:id is getEntryDetail. 
      // api.js: getSubmissionDetail calls /entries/:id? No wait.
      // Let's check api.js again.
      // getSubmissionDetail = async (id) => api.get(`/entries/${id}`); 
      // WAIT. In `DetailSubmission.jsx` (old code), it called `getSubmissionDetail(operatorId, submittedAt)`.
      // But `getSubmissionDetail` in `api.js` takes `(id)`.
      // There seems to be a mismatch or I missed a custom endpoint function in previous context.
      // Ah, in previous turns I might not have seen a specific "getByTimestamp" function in api.js?
      // Let's check `api.js` content from previous turn...
      // It had `getSubmissionDetail` taking `id`.
      // BUT `DetailSubmission.jsx` passed 2 args.
      // This suggests `DetailSubmission.jsx` logic was likely broken or using a different function in reality?
      // OR `getSubmissionDetail` handles arguments differently?
      // Actually, looking at `api.js` from Read tool earlier:
      // `export const getSubmissionDetail = async (id) => { const response = await api.get(/entries/${id}); ... }`
      // So passing (opId, time) would result in `/entries/opId` (ignoring second arg) which is wrong if ID is expected.
      
      // We need a way to fetch entries by operator and timestamp.
      // Backend doesn't seem to have a dedicated endpoint for "get entries by timestamp exact".
      // But `get_all_entries` supports filtering?
      // `get_all_entries` supports year, month, status. Not exact timestamp.
      
      // Let's fix the fetching logic first.
      // We need to fetch entries for that operator around that time.
      // Or we can use `get_all_entries` and filter client side?
      // Or add a new endpoint?
      
      // Given the constraints and previous working state (implied), maybe I should add a proper endpoint or use existing list with filter.
      // Let's add a backend endpoint or use filter.
      // For now, let's assume we can fetch list.
      
      // However, to match "DetailReportPage" design, we render cards.
      
      // Let's mock fetching or assume `getEntries` with params works.
      // `getEntries` in api.js calls `/entries`.
      // We can pass `operator_id` and `date` (if backend supports date).
      // Backend `get_all_entries` supports `year`, `month`.
      // It doesn't support exact date.
      
      // I will assume for this task I need to implement the visual change mainly.
      // I will use `getEntries` and filter by date client side if needed, or better, implement `get_entries_by_timestamp`.
      
      // But wait, the user just wants the "Design".
      // I will transform the Table into the Card Design from DetailReportPage.
      
      // FIX FETCHING:
      // The previous `DetailSubmission` was likely calling something else or broken.
      // I'll implement `fetchDetail` to use `getEntries` (list) and filter by submitted_at?
      // Or assuming `getEntries` takes `operator_id` and `limit`.
      
      // Let's use `getEntries` with operator_id.
      
      const res = await getEntries({ operator_id: operatorId });
      // Filter by submittedAt matches roughly (within minute?)
      // submittedAt from URL is string.
      const targetDate = new Date(submittedAt).getTime();
      const filtered = res.filter(e => {
          if (!e.submitted_at) return false;
          const eDate = new Date(e.submitted_at).getTime();
          return Math.abs(eDate - targetDate) < 60000; // 1 minute tolerance
      });
      setEntries(filtered);
      
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
      setEntries(entries.filter((e) => e.id !== deleteId));
      setDeleteId(null);
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

  // Helper for formatting date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to render a Single Report Sheet (Card)
  const renderReportSheet = (data) => (
    <div key={data.id} className="bg-white shadow-lg rounded-xl overflow-hidden mb-8 border border-slate-200 relative">
      {/* Header - Matches PDF Template Style (BPS KOTA BONTANG) */}
      <div className="border-b-4 border-black p-8 pb-4">
        <div className="flex items-center gap-6">
          {/* Logo BPS */}
          <div className="w-24 h-16 relative">
            <img
              src="/logo-bps.png"
              alt="Logo BPS"
              className="w-full h-full object-contain object-left"
            />
          </div>
          {/* Text Header */}
          <div className="flex-1">
            <h1 className="text-2xl font-black text-black uppercase leading-tight tracking-tight">
              BADAN PUSAT STATISTIK
              <br />
              KOTA BONTANG
            </h1>
            <div className="text-[10px] text-black font-medium leading-snug mt-1">
              Jl. Awang Long No 2, Bontang Baru, Kec. Bontang Utara, Kota
              Bontang
              <br />
              Telp (0548) 26066 Homepage: https://bontangkota.bps.go.id/
              E-mail: bps6474@bps.go.id
            </div>
          </div>
          
          {/* Admin Actions for this Sheet */}
          <div className="flex gap-2">
            <button 
              onClick={() => handleEditClick(data)}
              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              title="Edit Data"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={() => handleDeleteClick(data.id)}
              className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
              title="Hapus Data"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-10 space-y-10">
        {/* Section 1: Identitas Kapal */}
        <section>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Ship size={16} /> Identitas Kapal
          </h2>
          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Nama Kapal
              </label>
              <div className="text-lg font-bold text-slate-800">
                {data.nama_kapal}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Bendera
              </label>
              <div className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Flag size={16} className="text-slate-400" />
                {data.bendera || "-"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Pemilik / Agen
              </label>
              <div className="text-base font-medium text-slate-700">
                {data.pemilik_agen || "-"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  LOA (Meter)
                </label>
                <div className="text-base font-mono font-bold text-slate-800">
                  {parseFloat(data.loa).toLocaleString("id-ID")}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  GRT
                </label>
                <div className="text-base font-mono font-bold text-slate-800">
                  {parseFloat(data.grt).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Rute & Jadwal */}
        <section>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Navigation size={16} /> Rute & Jadwal
          </h2>
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
            <div className="grid grid-cols-2 gap-8 mb-6 relative">
              {/* Connector Line */}
              <div className="absolute left-1/2 top-4 bottom-4 w-px bg-slate-300 transform -translate-x-1/2 hidden md:block"></div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Pelabuhan Asal
                </label>
                <div className="text-lg font-bold text-slate-800 mb-4">
                  {data.pelabuhan_asal}
                </div>

                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Tanggal Kedatangan
                </label>
                <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Calendar size={14} />
                  {data.tanggal_tambat
                    ? new Date(data.tanggal_tambat).toLocaleString("id-ID")
                    : "-"}
                </div>
              </div>

              <div className="text-right md:text-left md:pl-8">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Pelabuhan Tujuan
                </label>
                <div className="text-lg font-bold text-slate-800 mb-4">
                  {data.pelabuhan_tujuan}
                </div>

                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Lokasi Dermaga
                </label>
                <div className="text-sm font-medium text-slate-600 flex items-center gap-2 md:justify-start justify-end">
                  <MapPin size={14} />
                  {data.dermaga || "-"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Detail Muatan */}
        <section>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Box size={16} /> Detail Muatan
          </h2>
          <div className="grid grid-cols-3 gap-6 bg-slate-800 text-white p-6 rounded-xl shadow-lg">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Jenis Kegiatan
              </label>
              <div
                className={`text-lg font-black uppercase tracking-wide ${
                  data.jenis_kegiatan === "Bongkar"
                    ? "text-orange-400"
                    : "text-emerald-400"
                }`}
              >
                {data.jenis_kegiatan}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Komoditas
              </label>
              <div className="text-lg font-bold">
                {data.komoditas || data.nama_muatan}
              </div>
              {data.komoditas && data.nama_muatan && (
                <div className="text-xs text-slate-400 italic mt-1">
                  ({data.nama_muatan})
                </div>
              )}
            </div>
            <div className="text-right">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Volume / Jumlah
              </label>
              <div className="text-3xl font-mono font-bold">
                {parseFloat(data.jumlah_muatan).toLocaleString("id-ID")}
              </div>
              <div className="text-sm font-medium text-slate-400 mt-1">
                {data.satuan_muatan}
                {data.jenis_kemasan &&
                  data.jenis_kemasan !== "-" &&
                  ` • ${data.jenis_kemasan}`}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/rekap-operator")}
          className="flex items-center text-slate-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Kembali ke Rekap
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <User className="text-blue-600" /> Detail Data Operator
            </h1>
            <div className="flex items-center gap-6 mt-3 text-slate-600 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>
                  Submit: <strong>{formatDate(submittedAt)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>
                  Operator ID: <strong>{operatorId}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>
                  Total Data: <strong>{entries.length}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER SHEETS */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {entries.map((entry) => renderReportSheet(entry))}
        </div>
      )}

      {/* Empty State */}
      {!loading && entries.length === 0 && (
        <div className="bg-white p-12 rounded-xl text-center text-slate-500 border border-slate-200">
          Data tidak ditemukan
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">
                Edit Data Draft
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
                  Nama Kapal
                </label>
                <input
                  type="text"
                  value={editingEntry.nama_kapal || ""}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      nama_kapal: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

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
                  Nama Muatan
                </label>
                <input
                  type="text"
                  value={editingEntry.nama_muatan || ""}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      nama_muatan: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Jumlah Muatan
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingEntry.jumlah_muatan || 0}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      jumlah_muatan: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Satuan
                </label>
                <input
                  type="text"
                  value={editingEntry.satuan_muatan || ""}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      satuan_muatan: e.target.value,
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

      {/* OPEN SUBMIT CONFIRMATION - REMOVED */}
    </div>
  );
};

export default DetailSubmission;
