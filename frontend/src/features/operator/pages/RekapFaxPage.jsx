import React, { useEffect, useState } from "react";
import { getRekapFax, getSummary } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Printer } from "lucide-react";

const RekapFaxPage = () => {
  const [data, setData] = useState({ dn: {}, ln: {} });

  useEffect(() => {
    const fetchData = async () => {
      const res = await getRekapFax();
      // Ensure res is array
      const dataArray = Array.isArray(res) ? res : [];
      const dn =
        dataArray.find((d) => d.grup_pelayaran === "Dalam Negeri") || {};
      const ln =
        dataArray.find((d) => d.grup_pelayaran === "Luar Negeri") || {};
      setData({ dn, ln });
    };
    fetchData();
  }, []);

  const ReportSection = ({ title, dnValue, lnValue, unit = "" }) => (
    <div className="grid grid-cols-3 border-b border-slate-200 py-2 text-sm">
      <div className="pl-4 text-slate-600">{title}</div>
      <div className="text-center font-semibold">
        {dnValue?.toLocaleString() || 0} {unit}
      </div>
      <div className="text-center font-semibold">
        {lnValue?.toLocaleString() || 0} {unit}
      </div>
    </div>
  );

  return (
    <div className="ml-64 p-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto border-2 border-slate-800 p-8 shadow-lg">
        <div className="flex justify-between items-start mb-6 border-b-2 border-slate-800 pb-4">
          <h1 className="text-2xl font-bold uppercase">Rekap FAX-AL</h1>
          <button
            onClick={() => window.print()}
            className="bg-slate-800 text-white p-2 rounded no-print"
          >
            <Printer size={20} />
          </button>
        </div>

        <div className="mb-4 font-bold">Bulan Laporan: Desember 2025</div>

        {/* Header Tabel */}
        <div className="grid grid-cols-3 bg-slate-800 text-white py-2 font-bold text-center">
          <div>Keterangan</div>
          <div>Pelayaran Dalam Negeri</div>
          <div>Pelayaran Luar Negeri</div>
        </div>

        {/* 1. Kunjungan Kapal */}
        <div className="bg-slate-100 py-1 px-2 font-bold text-sm border-b">
          1. Kunjungan Kapal
        </div>
        <ReportSection
          title="Unit"
          dnValue={data.dn.unit}
          lnValue={data.ln.unit}
        />
        <ReportSection
          title="GRT"
          dnValue={data.dn.total_grt}
          lnValue={data.ln.total_grt}
        />
        <ReportSection
          title="LOA"
          dnValue={data.dn.total_loa}
          lnValue={data.ln.total_loa}
        />

        {/* 2. Barang / Perdagangan */}
        <div className="bg-slate-100 py-1 px-2 font-bold text-sm border-b">
          2. Barang (Ton)
        </div>
        <ReportSection
          title="Bongkar"
          dnValue={data.dn.bongkar_ton}
          lnValue={data.ln.bongkar_ton}
        />
        <ReportSection
          title="Muat"
          dnValue={data.dn.muat_ton}
          lnValue={data.ln.muat_ton}
        />

        {/* 3. Penumpang */}
        <div className="bg-slate-100 py-1 px-2 font-bold text-sm border-b">
          3. Penumpang (Orang)
        </div>
        <ReportSection
          title="Turun / Debarkasi"
          dnValue={data.dn.penumpang_turun}
          lnValue={data.ln.penumpang_turun}
        />
        <ReportSection
          title="Naik / Embarkasi"
          dnValue={data.dn.penumpang_naik}
          lnValue={data.ln.penumpang_naik}
        />

        <div className="mt-12 text-right">
          <p>Bontang, {new Date().toLocaleDateString("id-ID")}</p>
          <div className="h-20"></div>
          <p className="font-bold underline">Petugas Operasional Pelabuhan</p>
        </div>
      </div>
    </div>
  );
};

export default RekapFaxPage;
