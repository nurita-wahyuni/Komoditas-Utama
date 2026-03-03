import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Save,
  RefreshCw,
  XCircle,
  Ship,
  MapPin,
  Package,
  Calendar,
} from "lucide-react";

// --- CONSTANTS FOR DROPDOWNS ---
const COUNTRIES = [
  "Indonesia",
  "Singapore",
  "Malaysia",
  "Panama",
  "Liberia",
  "Marshall Islands",
  "China",
  "Hong Kong",
  "Vietnam",
  "Thailand",
  "Japan",
  "South Korea",
  "India",
  "Greece",
  "Malta",
  "USA",
  "UK",
  "Netherlands",
].sort();

const PORTS = [
  "Tanjung Priok",
  "Tanjung Perak",
  "Belawan",
  "Makassar",
  "Batam",
  "Dumai",
  "Cilegon",
  "Semarang",
  "Banjarmasin",
  "Balikpapan",
  "Pontianak",
  "Singapore",
  "Shanghai",
  "Port Klang",
  "Laem Chabang",
  "Rotterdam",
].sort();

const BERTHS = [
  "Dermaga Umum 01",
  "Dermaga Umum 02",
  "Dermaga Umum 03",
  "Terminal Petikemas A",
  "Terminal Petikemas B",
  "Dermaga Curah Cair",
  "Dermaga Curah Kering",
  "Jetty Khusus I",
  "Jetty Khusus II",
  "Lainnya",
];

const COMMODITIES = [
  "TON dan MT",
  "Sirtu, Pasir, Batu",
  "BBM",
  "Motor",
  "Mobil",
  "Truk",
  "Bus",
  "Alat Berat",
  "Container (kosong)",
  "Penumpang",
];

const UNIT_MAPPING = {
  "TON dan MT": "Ton/MT",
  "Sirtu, Pasir, Batu": "M3",
  BBM: "KL",
  Motor: "Unit",
  Mobil: "Unit",
  Truk: "Unit",
  Bus: "Unit",
  "Alat Berat": "Unit",
  "Container (kosong)": "Teus",
  Penumpang: "Orang",
};

const EntryForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  isDisabled,
}) => {
  const defaultFormState = {
    nama_kapal: "",
    kategori_pelayaran: "Dalam Negeri",
    loa: 0,
    grt: 0,
    jenis_kegiatan: "Bongkar",
    bendera: "",
    pemilik_agen: "",
    pelabuhan_asal: "",
    pelabuhan_tujuan: "",
    tanggal_tambat: "",
    dermaga: "",
    keterangan: "",
    jenis_muatan: "Barang",
    komoditas: "", // New Field
    nama_muatan: "", // Now optional/secondary
    jumlah_muatan: 0,
    satuan_muatan: "", // Auto-populated
    jenis_kemasan: "Curah",
    tanggal_laporan: new Date().toISOString().split("T")[0],
  };

  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultFormState,
        ...initialData,
        // Ensure komoditas is set if editing old data that might match?
        // For now, if old data doesn't have komoditas, user picks it.
      });
    } else {
      setFormData(defaultFormState);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    // Handle Commodity Change specifically
    if (name === "komoditas") {
      const unit = UNIT_MAPPING[value] || "";

      // Auto-set fields based on commodity
      let kemasan = formData.jenis_kemasan;
      let j_muatan = "Barang";
      let n_muatan = formData.nama_muatan;

      if (value.includes("Container")) kemasan = "Peti Kemas";
      else if (["Motor", "Mobil", "Truk", "Bus", "Alat Berat"].includes(value))
        kemasan = "Unit";
      else if (value === "Penumpang") {
        j_muatan = "Manusia";
        kemasan = "-";
      } else {
        j_muatan = "Barang"; // Default
      }

      if (value === "Container (kosong)") {
        n_muatan = "Kontainer kosong";
      }

      setFormData((prev) => ({
        ...prev,
        komoditas: value,
        satuan_muatan: unit,
        jenis_muatan: j_muatan,
        jenis_kemasan: kemasan,
        nama_muatan: n_muatan,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. IDENTITAS KAPAL */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-slate-100">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Ship className="text-primary-600" size={20} />
          <h3 className="text-lg font-bold text-slate-800">Identitas Kapal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="label-text">
              Nama Kapal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_kapal"
              value={formData.nama_kapal}
              onChange={handleChange}
              className="input-field"
              placeholder="Contoh: KM. Sejahtera"
              required
              disabled={isDisabled}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-text">
              Bendera <span className="text-red-500">*</span>
            </label>
            <select
              name="bendera"
              value={formData.bendera}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isDisabled}
            >
              <option value="">Pilih Negara...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label-text">
              Pemilik / Agent <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pemilik_agen"
              value={formData.pemilik_agen}
              onChange={handleChange}
              className="input-field"
              placeholder="Nama Pemilik / Agen"
              required
              disabled={isDisabled}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-text">Kategori Pelayaran</label>
            <select
              name="kategori_pelayaran"
              value={formData.kategori_pelayaran}
              onChange={handleChange}
              className="input-field"
              disabled={isDisabled}
            >
              <option value="Dalam Negeri">Dalam Negeri</option>
              <option value="Luar Negeri">Luar Negeri</option>
              <option value="Perintis">Perintis</option>
              <option value="Rakyat">Rakyat</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. DIMENSI & KEGIATAN */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-slate-100">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <MapPin className="text-primary-600" size={20} />
          <h3 className="text-lg font-bold text-slate-800">
            Dimensi & Kegiatan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className="label-text">LOA (m)</label>
            <input
              type="number"
              name="loa"
              value={formData.loa}
              onChange={handleChange}
              className="input-field"
              min="0"
              step="0.01"
              disabled={isDisabled}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-text">GRT</label>
            <input
              type="number"
              name="grt"
              value={formData.grt}
              onChange={handleChange}
              className="input-field"
              min="0"
              disabled={isDisabled}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="label-text">Jenis Kegiatan</label>
            <select
              name="jenis_kegiatan"
              value={formData.jenis_kegiatan}
              onChange={handleChange}
              className="input-field"
              disabled={isDisabled}
            >
              <option value="Bongkar">Bongkar</option>
              <option value="Muat">Muat</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. DETAIL MUATAN */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-slate-100">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Package className="text-primary-600" size={20} />
          <h3 className="text-lg font-bold text-slate-800">Detail Muatan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="label-text">
              Komoditas <span className="text-red-500">*</span>
            </label>
            <select
              name="komoditas"
              value={formData.komoditas || ""}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isDisabled}
            >
              <option value="">Pilih Komoditas...</option>
              {COMMODITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label-text">
              Keterangan Barang / Jenis Hewan
            </label>
            <input
              type="text"
              name="nama_muatan"
              value={formData.nama_muatan}
              onChange={handleChange}
              className="input-field"
              placeholder="Contoh: Beras, Semen, Sapi..."
              disabled={
                isDisabled || formData.komoditas === "Container (kosong)"
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label-text">
                Jumlah / Massa / Penumpang{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="jumlah_muatan"
                value={formData.jumlah_muatan}
                onChange={handleChange}
                className="input-field"
                min="0"
                step="0.01"
                required
                disabled={isDisabled}
              />
            </div>
            <div className="space-y-1.5">
              <label className="label-text">
                Satuan{" "}
                <span className="text-slate-400 text-xs">(Otomatis)</span>
              </label>
              <input
                type="text"
                name="satuan_muatan"
                value={formData.satuan_muatan}
                className="input-field bg-slate-100 font-medium text-slate-700"
                readOnly
              />
            </div>
          </div>

          {formData.komoditas !== "Penumpang" && (
            <div className="space-y-1.5">
              <label className="label-text">
                Jenis Kemasan <span className="text-red-500">*</span>
              </label>
              <select
                name="jenis_kemasan"
                value={formData.jenis_kemasan}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isDisabled}
              >
                <option value="Curah">Curah</option>
                <option value="Bag">Bag</option>
                <option value="Box">Box</option>
                <option value="Drum">Drum</option>
                <option value="Peti Kemas">Peti Kemas</option>
                <option value="Kandang">Kandang</option>
                <option value="Unit">Unit</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 4. JADWAL & LAPORAN */}
      <div className="bg-white p-6 rounded-xl shadow-soft border border-slate-100">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <Calendar className="text-primary-600" size={20} />
          <h3 className="text-lg font-bold text-slate-800">Jadwal & Laporan</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="label-text">
              Tiba dari Pelabuhan Asal <span className="text-red-500">*</span>
            </label>
            <select
              name="pelabuhan_asal"
              value={formData.pelabuhan_asal}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isDisabled}
            >
              <option value="">Pilih Pelabuhan</option>
              {PORTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label-text">
              Keberangkatan ke Pelabuhan Tujuan{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              name="pelabuhan_tujuan"
              value={formData.pelabuhan_tujuan}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isDisabled}
            >
              <option value="">Pilih Pelabuhan</option>
              {PORTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label-text">Tambat (Tanggal & Jam)</label>
            <input
              type="datetime-local"
              name="tanggal_tambat"
              value={formData.tanggal_tambat}
              onChange={handleChange}
              className="input-field"
              disabled={isDisabled}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-text">
              Kolom Dermaga <span className="text-red-500">*</span>
            </label>
            <select
              name="dermaga"
              value={formData.dermaga}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isDisabled}
            >
              <option value="">Pilih Dermaga...</option>
              {BERTHS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="label-text">
              Tgl Kedatangan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal_kedatangan"
              value={formData.tanggal_kedatangan || ""}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isDisabled}
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-text">
              Tgl Keberangkatan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal_keberangkatan"
              value={formData.tanggal_keberangkatan || ""}
              onChange={handleChange}
              className="input-field"
              required
              disabled={isDisabled}
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="label-text">Keterangan</label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              className="input-field h-24 resize-none"
              placeholder="Catatan tambahan (maksimal 500 karakter)..."
              maxLength={500}
              disabled={isDisabled}
            />
            <div className="text-right text-xs text-slate-400">0/500</div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="label-text">
              Tanggal Laporan <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal_laporan"
              value={formData.tanggal_laporan}
              className="input-field bg-slate-100 font-medium text-slate-600 cursor-not-allowed"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting || isDisabled}
          >
            <XCircle size={18} className="mr-2" />
            Batal
          </button>
        )}

        {!isDisabled && (
          <>
            <button
              type="button"
              className="btn btn-secondary text-slate-600"
              onClick={() => setFormData(defaultFormState)}
              disabled={isSubmitting}
            >
              <RefreshCw size={18} className="mr-2" />
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary shadow-lg shadow-primary-500/30"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Menyimpan...</>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {initialData ? "Update Data" : "Simpan Data"}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </form>
  );
};

EntryForm.propTypes = {
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  isSubmitting: PropTypes.bool,
  isDisabled: PropTypes.bool,
};

export default EntryForm;
