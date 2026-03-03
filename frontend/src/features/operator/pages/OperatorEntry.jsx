import { useState, useEffect } from "react";
import {
  getEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  manualSubmitEntries,
} from "../../../services/api";
import EntryForm from "../components/EntryForm";
import EntryTable from "../components/EntryTable";
import toast from "react-hot-toast";
import { AlertCircle, AlertTriangle, Send } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const OperatorEntry = () => {
  const { user } = useAuth();
  // --- STATE MANAGEMENT ---
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form & Interaction State
  const [editingEntry, setEditingEntry] = useState(null); // null = Add Mode, object = Edit Mode
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // --- DATA FETCHING ---
  const fetchAllData = async () => {
    try {
      // Don't set loading true on refresh to avoid UI flicker
      if (entries.length === 0) setLoading(true);
      setError(null);

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      // 1. Fetch Main History (Semua status untuk periode berjalan)
      const mainEntriesRes = await getEntries({
        operator_id: user?.id,
        tahun: currentYear,
        bulan: currentMonth,
      });
      setEntries(mainEntriesRes);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Gagal memuat data. Periksa koneksi server.");
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchAllData();
  }, [user?.id]);

  // --- HANDLERS ---

  // 1. Handle Form Submit (Create / Update)
  const handleFormSubmit = async (formData) => {
    try {
      setIsSubmittingForm(true);
      const payload = { ...formData };

      if (editingEntry) {
        await updateEntry(editingEntry.id, payload);
        toast.success("Data berhasil diperbarui");
      } else {
        await createEntry(payload);
        toast.success("Data berhasil ditambahkan");
      }

      await fetchAllData();
      setEditingEntry(null);
    } catch (err) {
      console.error("Submit Error:", err);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // 2. Handle Edit Click
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3. Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  // 4. Handle Delete Entry
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    try {
      await deleteEntry(id);
      toast.success("Data berhasil dihapus");
      await fetchAllData();
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Gagal menghapus data");
    }
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Entri Laporan Operasional
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola data kunjungan kapal untuk periode aktif.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center">
          <AlertCircle className="mr-2" /> {error}
        </div>
      )}

      {/* SECTION 2: ENTRY FORM */}
      <div>
        <EntryForm
          initialData={editingEntry}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
          isSubmitting={isSubmittingForm}
          isDisabled={false}
        />
      </div>
    </div>
  );
};

export default OperatorEntry;
