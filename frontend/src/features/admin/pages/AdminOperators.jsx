import { useState, useEffect } from 'react';
import { 
  getOperators, 
  createOperator, 
  updateOperator, 
  deleteOperator 
} from '../../../services/api';
import SubmitModal from '../../operator/components/SubmitModal';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOperators = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    role: 'OPERATOR'
  });

  // Fetch Data
  const fetchOperators = async () => {
    try {
      setLoading(true);
      const data = await getOperators();
      setOperators(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch operators", error);
      toast.error("Gagal memuat data operator");
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  // Handlers
  const handleOpenModal = (operator = null) => {
    if (operator) {
      setEditingId(operator.id);
      setFormData({
        nama: operator.nama,
        email: operator.email || '',
        password: '', // Password empty when editing
        role: 'OPERATOR'
      });
    } else {
      setEditingId(null);
      setFormData({
        nama: '',
        email: '',
        password: '',
        role: 'OPERATOR'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nama: '', email: '', password: '', role: 'OPERATOR' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama) {
      toast.error("Nama wajib diisi");
      return;
    }

    if (!editingId && !formData.password) {
      toast.error("Password wajib diisi untuk operator baru");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        // Only send password if it's not empty
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await updateOperator(editingId, updateData);
        toast.success("Operator berhasil diperbarui");
      } else {
        await createOperator(formData);
        toast.success("Operator berhasil ditambahkan");
      }
      handleCloseModal();
      await fetchOperators();
    } catch (error) {
      console.error("Submit error", error);
      const errorMsg = error.response?.data?.detail;
      toast.error(Array.isArray(errorMsg) ? errorMsg[0].msg : (errorMsg || "Gagal menyimpan data"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus operator ini?")) {
      try {
        await deleteOperator(id);
        toast.success("Operator berhasil dihapus");
        await fetchOperators();
      } catch (error) {
        console.error("Delete error", error);
        toast.error("Gagal menghapus operator");
      }
    }
  };

  // Filter
  const filteredOperators = (Array.isArray(operators) ? operators : []).filter(op => 
    (op.nama || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (op.email && op.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <Users className="mr-3 text-blue-600" size={28} />
            Daftar Operator Pelayaran
          </h1>
          <p className="text-slate-500 mt-1">Kelola akun operator pelayaran yang terdaftar di sistem</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" />
          Tambah Operator
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Operator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Terdaftar</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOperators.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Tidak ada data operator ditemukan.
                  </td>
                </tr>
              ) : (
                filteredOperators.map((op, index) => (
                  <tr key={op.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{op.nama}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {op.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {op.created_at ? new Date(op.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleOpenModal(op)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(op.id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Operator' : 'Tambah Operator Baru'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  placeholder="Contoh: PT. Pelayaran Nasional"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Opsional)</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {editingId ? 'Password Baru (Kosongkan jika tidak ingin mengubah)' : 'Password'}
                </label>
                <input 
                  type="password" 
                  required={!editingId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={editingId ? '********' : 'Masukkan password'}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check size={18} className="mr-2" />
                      Simpan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOperators;
