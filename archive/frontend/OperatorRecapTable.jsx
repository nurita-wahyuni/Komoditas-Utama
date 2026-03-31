import PropTypes from "prop-types";
import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

const OperatorRecapTable = ({ operators, loading }) => {
  // Handle prop name mismatch if necessary, assuming 'operators' is the data source
  const data = operators || [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 font-bold tracking-wider">
              Operator Name
            </th>
            <th className="px-6 py-4 font-bold tracking-wider text-center">
              Status Laporan
            </th>
            <th className="px-6 py-4 font-bold tracking-wider text-center">
              Total Unit
            </th>
            <th className="px-6 py-4 font-bold tracking-wider text-center">
              Total LOA (m)
            </th>
            <th className="px-6 py-4 font-bold tracking-wider text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
            // Skeleton Rows
            [...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="h-10 bg-slate-100 rounded-lg w-48"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-slate-100 rounded-full w-24 mx-auto"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-slate-100 rounded w-12 mx-auto"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 bg-slate-100 rounded w-16 mx-auto"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-8 bg-slate-100 rounded-lg w-24 ml-auto"></div>
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle size={32} className="text-slate-300" />
                  <p>Tidak ada data operator ditemukan.</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className="group hover:bg-slate-50/80 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm border border-white group-hover:scale-105 transition-transform duration-300">
                      {row.nama ? row.nama.substring(0, 2).toUpperCase() : "OP"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{row.nama}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ID: {row.username || "-"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {/* Logic for status badge based on activity */}
                  {row.period_status === "ACTIVE" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircle size={12} />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                      <AlertCircle size={12} />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-bold text-slate-700">
                    {row.total_unit || 0}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-mono text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                    {(row.total_loa || 0).toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="btn btn-secondary text-xs py-1.5 px-3 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50">
                    <ExternalLink size={14} className="mr-1.5" />
                    Detail
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

OperatorRecapTable.propTypes = {
  operators: PropTypes.array, // Changed from data to operators
  loading: PropTypes.bool,
};

export default OperatorRecapTable;
