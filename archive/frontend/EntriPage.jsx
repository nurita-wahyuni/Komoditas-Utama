import React, { useState } from 'react';
import axios from 'axios';
import { Save, Trash2 } from 'lucide-react';

const EntriPage = () => {
  // --- STATE & LOGIC (TIDAK BERUBAH) ---
  const fieldOrder = [
    'ln_bongkar', 'ln_muat', 'ln_loa', 
    'dn_bongkar', 'dn_muat', 'dn_loa', 
    'pr_bongkar', 'pr_muat', 'pr_loa', 
    'rk_bongkar', 'rk_muat', 'rk_loa'
  ];

  const [rows, setRows] = useState([
    { 
      ln_bongkar: '', ln_muat: '', ln_loa: '', 
      dn_bongkar: '', dn_muat: '', dn_loa: '',
      pr_bongkar: '', pr_muat: '', pr_loa: '',
      rk_bongkar: '', rk_muat: '', rk_loa: ''
    }
  ]);

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows(prev => [...prev, { 
      ln_bongkar: '', ln_muat: '', ln_loa: '', 
      dn_bongkar: '', dn_muat: '', dn_loa: '',
      pr_bongkar: '', pr_muat: '', pr_loa: '',
      rk_bongkar: '', rk_muat: '', rk_loa: ''
    }]);
  };

  const handleKeyDown = (e, index, field) => {
    const currentFieldIndex = fieldOrder.indexOf(field);
    
    // Enter / Down
    if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      if (index === rows.length - 1) {
        addRow();
        setTimeout(() => {
          const nextInput = document.getElementById(`input-${index + 1}-${field}`);
          if (nextInput) nextInput.focus();
        }, 50);
      } else {
        const nextInput = document.getElementById(`input-${index + 1}-${field}`);
        if (nextInput) nextInput.focus();
      }
    }

    // Up
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (index > 0) {
        const prevInput = document.getElementById(`input-${index - 1}-${field}`);
        if (prevInput) prevInput.focus();
      }
    }

    // Right
    if (e.key === 'ArrowRight') {
      if (currentFieldIndex < fieldOrder.length - 1) {
        const nextField = fieldOrder[currentFieldIndex + 1];
        const nextInput = document.getElementById(`input-${index}-${nextField}`);
        if (nextInput) nextInput.focus();
      }
    }

    // Left
    if (e.key === 'ArrowLeft') {
      if (currentFieldIndex > 0) {
        const prevField = fieldOrder[currentFieldIndex - 1];
        const prevInput = document.getElementById(`input-${index}-${prevField}`);
        if (prevInput) prevInput.focus();
      }
    }
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      const updatedRows = rows.filter((_, i) => i !== index);
      setRows(updatedRows);
    }
  };

  const totalLnLoa = rows.reduce((acc, row) => acc + (parseFloat(row.ln_loa) || 0), 0);
  const totalDnLoa = rows.reduce((acc, row) => acc + (parseFloat(row.dn_loa) || 0), 0);
  const totalPrLoa = rows.reduce((acc, row) => acc + (parseFloat(row.pr_loa) || 0), 0);
  const totalRkLoa = rows.reduce((acc, row) => acc + (parseFloat(row.rk_loa) || 0), 0);

  const handleSave = async () => {
    const dataToSend = [];
    rows.forEach(row => {
      if (row.ln_bongkar || row.ln_muat || row.ln_loa) dataToSend.push({ kategori_pelayaran: 'Luar Negeri', nama_kapal: row.ln_bongkar || row.ln_muat || '-', loa: parseFloat(row.ln_loa) || 0, grt: 0 });
      if (row.dn_bongkar || row.dn_muat || row.dn_loa) dataToSend.push({ kategori_pelayaran: 'Dalam Negeri', nama_kapal: row.dn_bongkar || row.dn_muat || '-', loa: parseFloat(row.dn_loa) || 0, grt: 0 });
      if (row.pr_bongkar || row.pr_muat || row.pr_loa) dataToSend.push({ kategori_pelayaran: 'Perintis', nama_kapal: row.pr_bongkar || row.pr_muat || '-', loa: parseFloat(row.pr_loa) || 0, grt: 0 });
      if (row.rk_bongkar || row.rk_muat || row.rk_loa) dataToSend.push({ kategori_pelayaran: 'Rakyat', nama_kapal: row.rk_bongkar || row.rk_muat || '-', loa: parseFloat(row.rk_loa) || 0, grt: 0 });
    });

    if (dataToSend.length === 0) return alert("Data kosong!");

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/entri', dataToSend);
      alert(response.data.message);
      setRows([{ ln_bongkar: '', ln_muat: '', ln_loa: '', dn_bongkar: '', dn_muat: '', dn_loa: '', pr_bongkar: '', pr_muat: '', pr_loa: '', rk_bongkar: '', rk_muat: '', rk_loa: '' }]);
    } catch (error) {
      console.error(error);
      alert("Gagal simpan.");
    }
  };

  // --- TAMPILAN DIPERKECIL DI SINI ---
  return (
    <div className="ml-64 p-4 bg-slate-50 min-h-screen overflow-auto">
      
      {/* Container Table: w-fit agar mengikuti konten, max-w-full agar tidak melebar */}
      <div className="bg-white shadow-sm rounded border border-slate-300 w-fit">
        
        {/* Header Compact */}
        <div className="p-3 border-b border-slate-200 flex justify-between items-center sticky left-0 top-0 bg-white z-20">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Entri Data</h2>
            <p className="text-xs text-slate-500">Navigasi Keyboard Aktif</p>
          </div>
          <button onClick={handleSave} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 text-xs rounded shadow">
            <Save size={14} /> Simpan
          </button>
        </div>

        <div className="pb-2">
          <table className="text-center border-collapse table-fixed">
            <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-tight">
              <tr>
                {/* Kolom NO diperkecil (w-8) */}
                <th rowSpan="2" className="border p-1 w-8 sticky left-0 bg-slate-100 z-10">No</th>
                
                <th colSpan="3" className="border p-1 bg-blue-100 text-blue-800">Luar Negeri</th>
                <th colSpan="3" className="border p-1 bg-green-100 text-green-800">Dalam Negeri</th>
                <th colSpan="3" className="border p-1 bg-orange-100 text-orange-800">Perintis</th>
                <th colSpan="3" className="border p-1 bg-purple-100 text-purple-800">Rakyat</th>
                
                <th rowSpan="2" className="border p-1 w-8 sticky right-0 bg-slate-100 z-10">Act</th>
              </tr>
              <tr>
                {['blue', 'green', 'orange', 'purple'].map((color, i) => (
                  <React.Fragment key={i}>
                    {/* Lebar kolom diperkecil: Nama (w-24), LOA (w-16) */}
                    <th className={`border p-1 bg-${color}-50 w-24`}>Bongkar</th>
                    <th className={`border p-1 bg-${color}-50 w-24`}>Muat</th>
                    <th className={`border p-1 bg-${color}-50 w-16`}>LOA</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            
            <tbody className="text-[11px] text-slate-700">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="border bg-slate-100 font-semibold sticky left-0 z-10 text-center">{index + 1}</td>
                  
                  {[
                    { f: 'ln_bongkar', c: 'blue', w: 'w-24' }, { f: 'ln_muat', c: 'blue', w: 'w-24' }, { f: 'ln_loa', c: 'blue', type: 'number', w: 'w-16' },
                    { f: 'dn_bongkar', c: 'green', w: 'w-24' }, { f: 'dn_muat', c: 'green', w: 'w-24' }, { f: 'dn_loa', c: 'green', type: 'number', w: 'w-16' },
                    { f: 'pr_bongkar', c: 'orange', w: 'w-24' }, { f: 'pr_muat', c: 'orange', w: 'w-24' }, { f: 'pr_loa', c: 'orange', type: 'number', w: 'w-16' },
                    { f: 'rk_bongkar', c: 'purple', w: 'w-24' }, { f: 'rk_muat', c: 'purple', w: 'w-24' }, { f: 'rk_loa', c: 'purple', type: 'number', w: 'w-16' },
                  ].map((col, idx) => (
                    <td key={idx} className={`border p-0 ${col.w}`}>
                      <input 
                        id={`input-${index}-${col.f}`}
                        type={col.type || "text"} 
                        // Padding diperkecil (px-1 py-0.5) agar baris tipis
                        className={`w-full px-1 py-1 outline-none focus:bg-${col.c}-100 transition-colors bg-transparent ${col.type === 'number' ? 'text-center font-mono' : ''}`}
                        value={row[col.f]} 
                        onChange={(e) => handleChange(index, col.f, e.target.value)} 
                        onKeyDown={(e) => handleKeyDown(e, index, col.f)} 
                      />
                    </td>
                  ))}

                  <td className="border p-0 text-center sticky right-0 bg-white z-10">
                    <button onClick={() => removeRow(index)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}

              {/* BARIS TOTAL COMPACT */}
              <tr className="bg-yellow-400 font-bold text-slate-900 border-t-2 border-slate-500 text-[11px]">
                <td className="border p-1 sticky left-0 bg-yellow-400 z-10">TOT</td>
                {[totalLnLoa, totalDnLoa, totalPrLoa, totalRkLoa].map((val, i) => (
                  <React.Fragment key={i}>
                    <td className="border p-1 bg-yellow-400" colSpan="2"></td>
                    <td className="border p-1 bg-yellow-400 font-mono">{val.toLocaleString('id-ID')}</td>
                  </React.Fragment>
                ))}
                <td className="border p-1 sticky right-0 bg-yellow-400 z-10"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EntriPage;