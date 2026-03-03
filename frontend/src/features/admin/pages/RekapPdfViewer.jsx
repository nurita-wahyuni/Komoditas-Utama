import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import RekapPdfDocument from "../components/RekapPdfDocument";
import api from "../../../services/api";
import { ArrowLeft, Loader2 } from "lucide-react";

const RekapPdfViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
        
        // Use single endpoint to fetch all categories at once
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Menyiapkan Dokumen PDF...</h2>
        <p className="text-gray-500">Mohon tunggu sebentar</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-red-600">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
            title="Kembali"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Pratinjau Cetak Laporan</h1>
            <p className="text-xs text-gray-500">Periode: {startDate} - {endDate}</p>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden">
        <PDFViewer width="100%" height="100%" className="border-none">
          <RekapPdfDocument 
            dataLuarNegeri={dataLuarNegeri}
            dataDalamNegeri={dataDalamNegeri}
            dataPerintis={dataPerintis}
            dataRakyat={dataRakyat}
            startDate={startDate}
            endDate={endDate}
          />
        </PDFViewer>
      </div>
    </div>
  );
};

export default RekapPdfViewer;
