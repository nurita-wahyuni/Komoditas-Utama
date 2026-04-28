import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PDFDownloadLink, BlobProvider } from "@react-pdf/renderer";
import RekapPdfDocument from "../components/RekapPdfDocument";
import api from "../../../services/api";
import { ArrowLeft, Loader2, Download, FileText, CheckCircle } from "lucide-react";

const RekapPdfViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloaded, setDownloaded] = useState(false);
  
  const [dataLuarNegeri, setDataLuarNegeri] = useState(null);
  const [dataDalamNegeri, setDataDalamNegeri] = useState(null);
  const [dataPerintis, setDataPerintis] = useState(null);
  const [dataRakyat, setDataRakyat] = useState(null);

  useEffect(() => {
    if (!startDate || !endDate) {
      setError("Tanggal tidak valid. Silakan kembali dan pilih periode.");
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const response = await api.get("/admin/rekap-entries/all", { 
          params: { start_date: startDate, end_date: endDate } 
        });

        const allData = response.data;
        setDataLuarNegeri(allData["Luar Negeri"]);
        setDataDalamNegeri(allData["Dalam Negeri"]);
        setDataPerintis(allData["Perintis"]);
        setDataRakyat(allData["Rakyat"]);
        
      } catch (err) {
        console.error("Error generating PDF data:", err);
        setError("Gagal memuat data untuk laporan PDF.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [startDate, endDate]);

  // Auto-download logic using BlobProvider
  const handleAutoDownload = (blob) => {
    if (blob && !downloaded) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_Rekap_Operasional_${startDate}_ke_${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloaded(true);
      
      // Optionally go back after some delay
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Menyiapkan Dokumen PDF...</h2>
        <p className="text-slate-500 mt-2">Data sedang diproses untuk diunduh otomatis</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <span className="text-2xl text-red-600 font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-slate-600 mb-6 text-sm">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
          {downloaded ? (
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          ) : (
            <Download className="w-10 h-10 text-emerald-500 animate-bounce" />
          )}
        </div>
        
        <h1 className="text-2xl font-black text-slate-800 mb-2">
          {downloaded ? "Laporan Berhasil Diunduh" : "Mengunduh Laporan PDF"}
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Dokumen rekap operasional periode <br />
          <span className="font-bold text-slate-700">{startDate} s/d {endDate}</span>
          <br />sedang dikirim ke perangkat Anda.
        </p>

        {/* Hidden PDF Generator for Auto-Download */}
        {!downloaded && (
          <BlobProvider
            document={
              <RekapPdfDocument 
                dataLuarNegeri={dataLuarNegeri}
                dataDalamNegeri={dataDalamNegeri}
                 dataPerintis={dataPerintis}
                 dataRakyat={dataRakyat}
                 startDate={startDate}
                 endDate={endDate}
               />
             }
           >
             {({ blob, loading: pdfLoading }) => {
               if (!pdfLoading && blob) {
                 handleAutoDownload(blob);
               }
               return null;
             }}
           </BlobProvider>
         )}

         <div className="flex flex-col gap-3">
           <button
             onClick={() => navigate(-1)}
             className="flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
           >
             <ArrowLeft size={18} /> Kembali ke Rekap
           </button>
           
           <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-4">
             Sistem Informasi Pelaporan Pelabuhan
           </p>
         </div>
       </div>
     </div>
   );
};

export default RekapPdfViewer;
