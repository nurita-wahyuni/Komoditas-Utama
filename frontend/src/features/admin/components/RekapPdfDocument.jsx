import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { formatDateIndo, formatNumberIndo } from "../../../utils/dateHelpers";

// Register fonts if needed
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  // Page Border
  pageBorder: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    pointerEvents: "none",
  },
  // Watermark
  watermark: {
    position: "absolute",
    top: "40%",
    left: "15%",
    fontSize: 60,
    color: "#F1F5F9",
    opacity: 0.5,
    transform: "rotate(-45deg)",
    fontWeight: "bold",
    zIndex: -1,
  },
  // Header Style: Official Letterhead
  headerContainer: {
    flexDirection: "row",
    marginBottom: 5,
    paddingBottom: 10,
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 45,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
    textAlign: "center",
  },
  headerInstitution: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  headerAddress: {
    fontSize: 8,
    color: "#333",
    lineHeight: 1.2,
  },
  headerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    marginBottom: 15,
  },
  // Report Title Section
  titleSection: {
    textAlign: "center",
    marginBottom: 20,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textDecoration: "underline",
    marginBottom: 5,
  },
  reportSubtitle: {
    fontSize: 9,
    color: "#333",
  },
  // Table Styling
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableHeaderCell: {
    backgroundColor: "#f0f0f0",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: "left",
  },
  // Column Widths
  colNo: { width: "5%" },
  colDate: { width: "15%" },
  colActivity: { width: "15%" },
  colCommodity: { width: "35%" },
  colVolume: { width: "15%" },
  colUnit: { width: "15%" },
  
  // Summary Section
  summarySection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  summaryItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  summaryLabel: {
    width: 150,
    fontWeight: "bold",
  },
  summaryValue: {
    flex: 1,
  },
  // Footer: Signature Section
  footerSection: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureContainer: {
    width: 200,
    textAlign: "center",
  },
  signatureSpace: {
    height: 50,
  },
  signatureName: {
    fontWeight: "bold",
    textDecoration: "underline",
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#666",
  },
});

const OfficialHeader = () => (
  <View fixed>
    <View style={styles.headerContainer}>
      <Image style={styles.logo} src="/logo-bps.png" />
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerInstitution}>BADAN PUSAT STATISTIK KOTA BONTANG</Text>
        <Text style={styles.headerAddress}>
          Jl. Awang Long No 2, Bontang Baru, Kec. Bontang Utara, Kota Bontang
        </Text>
        <Text style={styles.headerAddress}>
          Telepon: (0548) 26066 | Website: https://bontangkota.bps.go.id | Email: bps6474@bps.go.id
        </Text>
      </View>
    </View>
    <View style={styles.headerDivider} />
  </View>
);

const SummarySection = ({ data, entries }) => {
  // Use pre-calculated data from backend if available, fallback to basic calc
  const totalVisits = data?.header?.unit || entries.length;
  
  // Get total cargo from pre-calculated summary (TON dan MT aggregate)
  const bongkarTotal = data?.bongkar?.["TON dan MT"]?.value || 0;
  const muatTotal = data?.muat?.["TON dan MT"]?.value || 0;
  const totalCargo = bongkarTotal + muatTotal;

  // If pre-calculated is 0, fallback to basic sum of entries (for safety)
  const displayCargo = totalCargo > 0 ? totalCargo : entries.reduce((acc, curr) => acc + (parseFloat(curr.jumlah_muatan) || 0), 0);

  return (
    <View style={styles.summarySection} wrap={false}>
      <Text style={styles.summaryTitle}>RINGKASAN OPERASIONAL</Text>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Total Kunjungan Kapal</Text>
        <Text style={styles.summaryValue}>: {totalVisits} Unit</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Total Muatan / Penumpang</Text>
        <Text style={styles.summaryValue}>: {formatNumberIndo(displayCargo)} Ton / Orang</Text>
      </View>
    </View>
  );
};

const RekapPdfDocument = ({
  dataLuarNegeri = { entries: [], header: { unit: 0 }, bongkar: {}, muat: {} },
  dataDalamNegeri = { entries: [], header: { unit: 0 }, bongkar: {}, muat: {} },
  dataPerintis = { entries: [], header: { unit: 0 }, bongkar: {}, muat: {} },
  dataRakyat = { entries: [], header: { unit: 0 }, bongkar: {}, muat: {} },
  startDate,
  endDate,
}) => {
  const generatedDate = formatDateIndo(new Date());

  // Page 1 Data: International (Luar Negeri)
  const internationalEntries = dataLuarNegeri?.entries || [];

  // Page 2 Data: Combined (Domestic + Pioneer + Public)
  const combinedEntries = [
    ...(dataDalamNegeri?.entries || []),
    ...(dataPerintis?.entries || []),
    ...(dataRakyat?.entries || []),
  ].sort((a, b) => {
    const dateA = a && a.tanggal_laporan ? new Date(a.tanggal_laporan) : new Date(0);
    const dateB = b && b.tanggal_laporan ? new Date(b.tanggal_laporan) : new Date(0);
    return dateA - dateB;
  });

  return (
    <Document title={`Laporan Rekapitulasi Operasional ${startDate} - ${endDate}`}>
      {/* Page 1: International Operations Recap */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder} fixed />
        <Text style={styles.watermark} fixed>OFFICIAL REPORT</Text>
        
        <OfficialHeader />

        <View style={styles.titleSection}>
          <Text style={styles.reportTitle}>LAPORAN REKAPITULASI OPERASIONAL LUAR NEGERI</Text>
          <Text style={styles.reportSubtitle}>Periode Pelaporan: {startDate} s/d {endDate}</Text>
        </View>

        {internationalEntries.length > 0 ? (
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableHeaderCell, styles.colNo]}><Text>No</Text></View>
              <View style={[styles.tableHeaderCell, styles.colDate]}><Text>Tanggal</Text></View>
              <View style={[styles.tableHeaderCell, styles.colActivity]}><Text>Kegiatan</Text></View>
              <View style={[styles.tableHeaderCell, styles.colCommodity]}><Text>Komoditas</Text></View>
              <View style={[styles.tableHeaderCell, styles.colVolume]}><Text>Volume</Text></View>
              <View style={[styles.tableHeaderCell, styles.colUnit]}><Text>Satuan</Text></View>
            </View>

            {/* Table Body */}
            {internationalEntries.map((entry, index) => (
              <View style={styles.tableRow} key={entry.id}>
                <View style={[styles.tableCell, styles.colNo]}><Text>{index + 1}</Text></View>
                <View style={[styles.tableCell, styles.colDate]}><Text>{entry.tanggal_laporan || "-"}</Text></View>
                <View style={[styles.tableCell, styles.colActivity]}><Text>{entry.jenis_kegiatan || "-"}</Text></View>
                <View style={[styles.tableCell, styles.colCommodity]}>
                  <Text style={{ fontWeight: "bold" }}>{entry.komoditas || entry.nama_muatan || "-"}</Text>
                </View>
                <View style={[styles.tableCell, styles.colVolume]}><Text>{formatNumberIndo(entry.jumlah_muatan)}</Text></View>
                <View style={[styles.tableCell, styles.colUnit]}><Text>{entry.satuan_muatan || "-"}</Text></View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ textAlign: "center", marginTop: 20, fontStyle: "italic" }}>Tidak ada data operasional luar negeri tersedia.</Text>
        )}

        <SummarySection data={dataLuarNegeri} entries={internationalEntries} />

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} fixed />
      </Page>

      {/* Page 2: Domestic, Pioneer, and Public Operations Recap */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageBorder} fixed />
        <Text style={styles.watermark} fixed>OFFICIAL REPORT</Text>
        
        <OfficialHeader />

        <View style={styles.titleSection}>
          <Text style={styles.reportTitle}>LAPORAN REKAPITULASI OPERASIONAL DALAM NEGERI, PERINTIS, DAN RAKYAT</Text>
          <Text style={styles.reportSubtitle}>Periode Pelaporan: {startDate} s/d {endDate}</Text>
        </View>

        {combinedEntries.length > 0 ? (
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableHeaderCell, styles.colNo]}><Text>No</Text></View>
              <View style={[styles.tableHeaderCell, styles.colDate]}><Text>Tanggal</Text></View>
              <View style={[styles.tableHeaderCell, styles.colActivity]}><Text>Kegiatan</Text></View>
              <View style={[styles.tableHeaderCell, styles.colCommodity]}><Text>Komoditas / Kategori</Text></View>
              <View style={[styles.tableHeaderCell, styles.colVolume]}><Text>Volume</Text></View>
              <View style={[styles.tableHeaderCell, styles.colUnit]}><Text>Satuan</Text></View>
            </View>

            {/* Table Body */}
            {combinedEntries.map((entry, index) => (
              <View style={styles.tableRow} key={entry.id}>
                <View style={[styles.tableCell, styles.colNo]}><Text>{index + 1}</Text></View>
                <View style={[styles.tableCell, styles.colDate]}><Text>{entry.tanggal_laporan || "-"}</Text></View>
                <View style={[styles.tableCell, styles.colActivity]}><Text>{entry.jenis_kegiatan || "-"}</Text></View>
                <View style={[styles.tableCell, styles.colCommodity]}>
                  <Text style={{ fontWeight: "bold" }}>{entry.komoditas || entry.nama_muatan || "-"}</Text>
                  <Text style={{ fontSize: 7, color: "#666", marginTop: 2 }}>{entry.kategori_pelayaran}</Text>
                </View>
                <View style={[styles.tableCell, styles.colVolume]}><Text>{formatNumberIndo(entry.jumlah_muatan)}</Text></View>
                <View style={[styles.tableCell, styles.colUnit]}><Text>{entry.satuan_muatan || "-"}</Text></View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ textAlign: "center", marginTop: 20, fontStyle: "italic" }}>Tidak ada data operasional dalam negeri, perintis, atau rakyat tersedia.</Text>
        )}

        {/* Use combined data for summary calculation on Page 2 */}
        <SummarySection 
          data={{
            header: {
              unit: (dataDalamNegeri?.header?.unit || 0) + (dataPerintis?.header?.unit || 0) + (dataRakyat?.header?.unit || 0)
            },
            bongkar: {
              "TON dan MT": {
                value: (dataDalamNegeri?.bongkar?.["TON dan MT"]?.value || 0) + 
                       (dataPerintis?.bongkar?.["TON dan MT"]?.value || 0) + 
                       (dataRakyat?.bongkar?.["TON dan MT"]?.value || 0)
              }
            },
            muat: {
              "TON dan MT": {
                value: (dataDalamNegeri?.muat?.["TON dan MT"]?.value || 0) + 
                       (dataPerintis?.muat?.["TON dan MT"]?.value || 0) + 
                       (dataRakyat?.muat?.["TON dan MT"]?.value || 0)
              }
            }
          }}
          entries={combinedEntries} 
        />
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} fixed />
      </Page>
    </Document>
  );
};

export default RekapPdfDocument;
