import PropTypes from 'prop-types';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const SubmitModal = ({ isOpen, onClose, onConfirm, isSubmitting, draftCount, period }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 flex items-center">
            <AlertTriangle className="text-amber-500 mr-2" size={20} />
            Konfirmasi Submit Periode
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 mb-4">
            Anda akan melakukan submit laporan untuk periode <span className="font-bold text-slate-800">{period}</span>.
          </p>
          
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Perhatian</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    Terdapat <span className="font-bold">{draftCount} data draft</span> yang akan disubmit.
                    Setelah disubmit, data <span className="font-bold">TIDAK DAPAT DIUBAH</span> kembali kecuali dengan request ke Admin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Pastikan seluruh data sudah benar sebelum melanjutkan.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle size={16} className="mr-2" />
                Ya, Submit Sekarang
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

SubmitModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  draftCount: PropTypes.number.isRequired,
  period: PropTypes.string.isRequired
};

export default SubmitModal;
