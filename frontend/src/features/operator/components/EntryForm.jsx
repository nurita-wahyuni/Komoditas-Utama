import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Trash2, Save } from "lucide-react";
import { submitEntries } from "../../../services/api";
import toast from "react-hot-toast";

const DRAFT_STORAGE_KEY = "simoppel_entry_draft";

const CATEGORIES = [
  { key: "luar_negeri", title: "Luar Negeri" },
  { key: "dalam_negeri", title: "Dalam Negeri" },
  { key: "perintis", title: "Perintis" },
  { key: "rakyat", title: "Rakyat" },
];

const JENIS_KEGIATAN_OPTIONS = ["Bongkar", "Muat"];

const KOMODITAS_OPTIONS = [
  "LPG",
  "LNG",
  "PUPUK",
  "AMMONIA",
  "AMMONIUM NITRATE",
];

const SATUAN_OPTIONS = ["Ton"];

const TableField = ({ children, className = "" }) => (
  <td className={`px-2 py-2 align-top border-t border-slate-200 ${className}`}> {children} </td>
);

TableField.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const createEmptyRow = () => ({
  loa: "",
  grt: "",
  activity: "Bongkar", // Default activity
  commodity: "LPG", // Default commodity
  description: "-", // Default description
  amount: "",
  unit: "Ton", // Default unit
  packaging: "Curah", // Default packaging
});

const createInitialEntriesState = () => ({
  luar_negeri: [createEmptyRow()],
  dalam_negeri: [createEmptyRow()],
  perintis: [createEmptyRow()],
  rakyat: [createEmptyRow()],
});

const COMMODITY_UNIT_MAPPING = {
  LPG: "Ton",
  LNG: "Ton",
  PUPUK: "Ton",
  AMMONIA: "Ton",
  "AMMONIUM NITRATE": "Ton",
};

const hasRowData = (row) => {
  const loaHasValue = row.loa !== "" && row.loa !== "0";
  const grtHasValue = row.grt !== "" && row.grt !== "0";
  const activityHasValue =
    typeof row.activity === "string" && row.activity.trim() !== "";
  const commodityHasValue =
    typeof row.commodity === "string" && row.commodity.trim() !== "";
  const descriptionHasValue =
    typeof row.description === "string" && row.description.trim() !== "";
  const amountHasValue = row.amount !== "" && row.amount !== "0";
  const unitHasValue = typeof row.unit === "string" && row.unit.trim() !== "";
  const packagingHasValue =
    typeof row.packaging === "string" && row.packaging.trim() !== "";

  return (
    loaHasValue ||
    grtHasValue ||
    activityHasValue ||
    commodityHasValue ||
    descriptionHasValue ||
    amountHasValue ||
    unitHasValue ||
    packagingHasValue
  );
};

const getAmountPlaceholder = (commodity) => {
  if (commodity === "Penumpang") return "Jumlah Penumpang";
  if (commodity === "BBM") return "Volume BBM";
  return "Jumlah / Massa";
};

const formatNumber = (value) => {
  if (!Number.isFinite(value) || value === 0) return "0";
  return value.toLocaleString("id-ID", { maximumFractionDigits: 3 });
};

// Helper to get number from potentially comma-separated string
const parseInputNumber = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const normalized = val.replace(",", ".");
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

const EntryCategoryCard = ({
  title,
  rows,
  isDisabled,
  onRowActivate,
  onRowChange,
  onRowDelete,
}) => {
  const tableRef = useRef(null);

  const handleEnterNavigation = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const focusable = Array.from(
      tableRef.current.querySelectorAll(
        "input:not([disabled]), select:not([disabled])"
      )
    );
    const idx = focusable.indexOf(e.target);
    if (idx >= 0) {
      const next = focusable[idx + 1];
      if (next) {
        next.focus();
      } else {
        // at end of table; add a new row if allowed
        const lastRowIndex = rows.length - 1;
        onRowActivate(lastRowIndex);
      }
    }
  };
  const dataRows = rows.filter(hasRowData);

  const totalLoa = dataRows.reduce(
    (acc, r) => acc + parseInputNumber(r.loa),
    0
  );
  const totalGrt = dataRows.reduce(
    (acc, r) => acc + parseInputNumber(r.grt),
    0
  );
  const totalAmount = dataRows.reduce(
    (acc, r) => acc + parseInputNumber(r.amount),
    0
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-soft border border-slate-100">
      {/* Cargo Detail Header (Simplified) */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-800">
            Detail Muatan ({title})
          </h3>
        </div>
      </div>

      <div className="overflow-x-auto" ref={tableRef}>
        <table className="w-full min-w-[1100px] border border-slate-200 rounded-lg overflow-hidden table-fixed">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
              <th className="px-3 py-3 w-[100px] whitespace-nowrap">LOA</th>
              <th className="px-3 py-3 w-[100px] whitespace-nowrap">GRT</th>
              <th className="px-3 py-3 w-[150px] whitespace-nowrap text-center">Jenis Kegiatan</th>
              <th className="px-3 py-3 w-[250px] whitespace-nowrap">Komoditas</th>
              <th className="px-3 py-3 w-[290px] whitespace-nowrap">Jumlah/Massa</th>
              <th className="px-3 py-3 w-[120px] whitespace-nowrap">Satuan</th>
              <th className="px-3 py-3 w-[80px] text-center whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <TableField>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    className="input-field px-2 text-sm h-9"
                    disabled={isDisabled}
                    value={row.loa}
                    onFocus={() => onRowActivate(rowIndex)}
                    onKeyDown={handleEnterNavigation}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                        onRowChange(rowIndex, "loa", val);
                      }
                    }}
                  />
                </TableField>
                <TableField>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    className="input-field px-2 text-sm h-9"
                    disabled={isDisabled}
                    value={row.grt}
                    onFocus={() => onRowActivate(rowIndex)}
                    onKeyDown={handleEnterNavigation}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                        onRowChange(rowIndex, "grt", val);
                      }
                    }}
                  />
                </TableField>
                <TableField className="text-center">
                  <select
                    className="input-field px-2 text-sm h-9 w-full max-w-[130px] mx-auto block"
                    disabled={isDisabled}
                    value={row.activity}
                    onFocus={() => onRowActivate(rowIndex)}
                    onKeyDown={handleEnterNavigation}
                    onChange={(e) =>
                      onRowChange(rowIndex, "activity", e.target.value)
                    }
                  >
                    {JENIS_KEGIATAN_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </TableField>
                <TableField>
                  <select
                    className="input-field px-2 text-sm h-9"
                    disabled={isDisabled}
                    value={row.commodity}
                    onFocus={() => onRowActivate(rowIndex)}
                    onKeyDown={handleEnterNavigation}
                    onChange={(e) => {
                      const nextCommodity = e.target.value;
                      onRowChange(rowIndex, "commodity", nextCommodity);
                      const mappedUnit =
                        COMMODITY_UNIT_MAPPING[nextCommodity] || "Ton";
                      onRowChange(rowIndex, "unit", mappedUnit);
                    }}
                  >
                    {KOMODITAS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </TableField>
                <TableField>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder={getAmountPlaceholder(row.commodity)}
                    className="input-field px-2 text-sm h-9"
                    disabled={isDisabled}
                    value={row.amount}
                    onFocus={() => onRowActivate(rowIndex)}
                    onKeyDown={handleEnterNavigation}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                        onRowChange(rowIndex, "amount", val);
                      }
                    }}
                  />
                </TableField>
                <TableField>
                  <input
                    type="text"
                    className="input-field px-2 text-sm h-9 bg-slate-50 font-semibold"
                    disabled={true}
                    value={row.unit || "Ton"}
                  />
                </TableField>
                <TableField className="text-center">
                  {!isDisabled && (
                    <button
                      type="button"
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Hapus baris"
                      onClick={() => onRowDelete(rowIndex)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </TableField>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
              Jumlah LOA
            </div>
            <div className="text-lg font-bold text-slate-800">
              {formatNumber(totalLoa)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
              Jumlah GRT
            </div>
            <div className="text-lg font-bold text-slate-800">
              {formatNumber(totalGrt)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
              Total Jumlah/Massa
            </div>
            <div className="text-lg font-bold text-slate-800">
              {formatNumber(totalAmount)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EntryCategoryCard.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      loa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      grt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      activity: PropTypes.string.isRequired,
      commodity: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      unit: PropTypes.string.isRequired,
      packaging: PropTypes.string.isRequired,
    })
  ).isRequired,
  isDisabled: PropTypes.bool,
  onRowActivate: PropTypes.func.isRequired,
  onRowChange: PropTypes.func.isRequired,
  onRowDelete: PropTypes.func.isRequired,
};

const EntryForm = (props) => {
  const { isDisabled, entryMonth, entryYear } = props;
  
  // Initial state logic to load from localStorage
  const getInitialState = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        // Only load if period matches or if we want to be flexible
        // Let's load it regardless but keep it in mind
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load draft", e);
    }
    return createInitialEntriesState();
  };

  const [entries, setEntries] = useState(getInitialState);
  const [draftStatus, setDraftStatus] = useState("saved");
  const isFirstRenderRef = useRef(true);
  const skipNextAutosaveRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const saveDraftToLocal = (data) => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      setDraftStatus("saved");
    } catch (e) {
      console.error("Failed to save draft", e);
    }
  };

  const handleManualSave = () => {
    saveDraftToLocal(entries);
    toast.success("Draft berhasil disimpan");
  };

  const updateRowField = (categoryKey, rowIndex, field, value) => {
    setDraftStatus("saving");
    setEntries((prev) => {
      const nextRows = prev[categoryKey].map((row, idx) => {
        if (idx !== rowIndex) return row;
        return { ...row, [field]: value };
      });
      return { ...prev, [categoryKey]: nextRows };
    });
  };

  const handleRowActivate = (categoryKey, rowIndex) => {
    const currentRows = entries[categoryKey];
    const isLastRow = rowIndex === currentRows.length - 1;
    const hasAnyRowData = currentRows.some(hasRowData);
    if (!isLastRow || !hasAnyRowData) return;

    setDraftStatus("saving");
    setEntries((prev) => {
      const prevRows = prev[categoryKey];
      return {
        ...prev,
        [categoryKey]: [...prevRows, createEmptyRow()],
      };
    });
  };

  const handleRowDelete = (categoryKey, rowIndex) => {
    setDraftStatus("saving");
    setEntries((prev) => {
      const newRows = prev[categoryKey].filter((_, idx) => idx !== rowIndex);
      return {
        ...prev,
        [categoryKey]: newRows.length ? newRows : [createEmptyRow()],
      };
    });
  };

  const handleSubmitData = async () => {
    setSubmitError("");

    // Helper to normalize rows and ensure numeric fields are numbers for the backend
    const normalizeRows = (rows) =>
      rows.filter(hasRowData).map((row) => ({
        ...row,
        loa: parseInputNumber(row.loa),
        grt: parseInputNumber(row.grt),
        amount: parseInputNumber(row.amount),
      }));

    const payload = {
      luar_negeri: normalizeRows(entries.luar_negeri),
      dalam_negeri: normalizeRows(entries.dalam_negeri),
      perintis: normalizeRows(entries.perintis),
      rakyat: normalizeRows(entries.rakyat),
      entri_bulan: entryMonth,
      entri_tahun: entryYear,
    };

    try {
      setIsSubmitting(true);
      await submitEntries(payload);
      skipNextAutosaveRef.current = true;
      const initialState = createInitialEntriesState();
      setEntries(initialState);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setDraftStatus("saved");
      toast.success("Data berhasil di-submit");
    } catch (err) {
      console.error("Submit failed", err);
      setSubmitError("Gagal mengirim data. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      saveDraftToLocal(entries);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [entries]);

  return (
    <div className="space-y-8">
      <div className="flex justify-end items-center gap-4">
        <button
          type="button"
          className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 border-none flex items-center"
          onClick={handleManualSave}
          disabled={isDisabled || isSubmitting}
        >
          <Save size={18} className="mr-2" />
          Simpan Draft
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmitData}
          disabled={isDisabled || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Data"}
        </button>
        <div className="text-xs font-semibold text-slate-500">
          {draftStatus === "saving" ? "Saving draft..." : "Draft Tersimpan ✓"}
        </div>
      </div>
      {submitError && (
        <div className="text-right text-sm font-medium text-red-600">
          {submitError}
        </div>
      )}
      {CATEGORIES.map((c) => (
        <EntryCategoryCard
          key={c.key}
          title={c.title}
          isDisabled={isDisabled}
          rows={entries[c.key]}
          onRowActivate={(rowIndex) => handleRowActivate(c.key, rowIndex)}
          onRowChange={(rowIndex, field, value) =>
            updateRowField(c.key, rowIndex, field, value)
          }
          onRowDelete={(rowIndex) => handleRowDelete(c.key, rowIndex)}
        />
      ))}
    </div>
  );
};

EntryForm.propTypes = {
  isDisabled: PropTypes.bool,
  entryMonth: PropTypes.number,
  entryYear: PropTypes.number,
};

export default EntryForm;
