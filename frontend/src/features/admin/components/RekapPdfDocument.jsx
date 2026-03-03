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

// Register fonts if needed, otherwise use default Helvetica
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 20, // Reduced padding
    paddingTop: 30,
    fontSize: 9, // Slightly smaller font
    fontFamily: "Helvetica",
  },
  headerContainer: {
    flexDirection: "row",
    marginBottom: 10, // Reduced margin
    borderBottomWidth: 1.5,
    borderBottomColor: "#000",
    paddingBottom: 5,
    alignItems: "center",
  },
  logo: {
    width: 50,
    height: 35,
    marginRight: 10,
  },
  headerTextContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  headerAddress: {
    fontSize: 7,
    color: "#333",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
    marginTop: 5,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 9,
    textAlign: "center",
    marginBottom: 10,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  column: {
    width: "48%", // Split into two columns
  },
  section: {
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    padding: 3,
    marginBottom: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    minHeight: 14, // Compact row height
    alignItems: "center",
    paddingVertical: 1,
  },
  tableColLabel: {
    width: "60%",
    paddingLeft: 5,
  },
  tableColValue: {
    width: "40%",
    textAlign: "right",
    paddingRight: 5,
  },
  subHeader: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 3,
    marginBottom: 1,
    paddingLeft: 5,
    fontStyle: "italic",
  },
});

const Header = () => (
  <View style={styles.headerContainer}>
    {/* Explicitly construct URL to ensure it works in both dev and production if base path is root */}
    <Image 
      style={styles.logo} 
      src="/logo-bps.png" 
    />
    <View style={styles.headerTextContainer}>
      <Text style={styles.headerTitle}>BADAN PUSAT STATISTIK</Text>
      <Text style={styles.headerSubtitle}>KOTA BONTANG</Text>
      <Text style={styles.headerAddress}>Jl. Awang Long No 2, Bontang Baru, Kec. Bontang Utara, Kota Bontang</Text>
      <Text style={styles.headerAddress}>Telp (0548) 26066 Homepage: https://bontangkota.bps.go.id/ E-mail: bps6474@bps.go.id</Text>
    </View>
  </View>
);

const CategoryPage = ({ category, data, startDate, endDate }) => {
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "-";
    return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(
      num
    );
  };

  if (!data)
    return (
      <Page style={styles.page}>
        <Text>Loading data...</Text>
      </Page>
    );

  // Helper to extract value safely
  const getVal = (type, key) => data[type]?.[key]?.value || 0;
  const getCVal = (type, status, size) =>
    data.container_stats?.[type]?.[status]?.[size] || 0;

  return (
    <Page size="A4" style={styles.page}>
      <Header />

      <Text style={styles.title}>
        REKAPITULASI DATA PELAYARAN {category.toUpperCase()}
      </Text>
      <Text style={styles.subtitle}>
        Periode: {startDate} s/d {endDate}
      </Text>

      <View style={styles.contentContainer}>
        {/* LEFT COLUMN */}
        <View style={styles.column}>
          {/* 1. Kunjungan Kapal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Kunjungan Kapal</Text>
            <View style={styles.tableRow}>
              <Text style={styles.tableColLabel}>Unit</Text>
              <Text style={styles.tableColValue}>
                {formatNumber(data.header.unit)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableColLabel}>GRT</Text>
              <Text style={styles.tableColValue}>
                {formatNumber(data.header.total_grt)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableColLabel}>LOA (Panjang)</Text>
              <Text style={styles.tableColValue}>
                {formatNumber(data.header.total_loa)}
              </Text>
            </View>
          </View>

          {/* 2. Barang / Perdagangan */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              2. Barang/Perdagangan (Ton/MT)
            </Text>
            <View style={styles.tableRow}>
              <Text style={styles.tableColLabel}>Bongkar</Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getVal("bongkar", "TON dan MT"))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableColLabel}>Muat</Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getVal("muat", "TON dan MT"))}
              </Text>
            </View>
          </View>

          {/* 3. Penumpang */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Penumpang (Orang)</Text>
            <View style={styles.tableRow}>
              <Text style={styles.tableColLabel}>Turun/Debarkasi</Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getVal("bongkar", "Penumpang"))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableColLabel}>Naik/Embarkasi</Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getVal("muat", "Penumpang"))}
              </Text>
            </View>
          </View>
        </View>

        {/* RIGHT COLUMN */}
        <View style={styles.column}>
          {/* 4. Bongkar Peti Kemas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Bongkar Peti Kemas</Text>

            <Text style={styles.subHeader}>a. Isi</Text>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                20 Teus Ton
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Bongkar", "Isi", "20_ton"))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                20 Teus Box
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Bongkar", "Isi", "20_box"))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                40 Teus Ton
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Bongkar", "Isi", "40_ton"))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                40 Teus Box
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Bongkar", "Isi", "40_box"))}
              </Text>
            </View>

            <Text style={styles.subHeader}>b. Kosong</Text>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                20 Teus Box
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Bongkar", "Kosong", "20_box"))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                40 Teus Box
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Bongkar", "Kosong", "40_box"))}
              </Text>
            </View>
          </View>

          {/* 5. Muat Peti Kemas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Muat Peti Kemas</Text>

            <Text style={styles.subHeader}>a. Isi</Text>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                20 Teus Ton
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Muat", "Isi", "20_ton"))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                20 Teus Box
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Muat", "Isi", "20_box"))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                40 Teus Ton
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Muat", "Isi", "40_ton"))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                40 Teus Box
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Muat", "Isi", "40_box"))}
              </Text>
            </View>

            <Text style={styles.subHeader}>b. Kosong</Text>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                20 Teus Box
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Muat", "Kosong", "20_box"))}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableColLabel, { paddingLeft: 15 }]}>
                40 Teus Box
              </Text>
              <Text style={styles.tableColValue}>
                {formatNumber(getCVal("Muat", "Kosong", "40_box"))}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer / Generated Info */}
      <Text
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          fontSize: 7,
          textAlign: "center",
          color: "#888",
        }}
      >
        Dicetak pada: {new Date().toLocaleString("id-ID")} | Sistem Informasi
        Pelaporan Pelabuhan
      </Text>
    </Page>
  );
};

const RekapPdfDocument = ({
  dataLuarNegeri,
  dataDalamNegeri,
  dataPerintis,
  dataRakyat,
  startDate,
  endDate,
}) => (
  <Document>
    <CategoryPage
      category="Luar Negeri"
      data={dataLuarNegeri}
      startDate={startDate}
      endDate={endDate}
    />
    <CategoryPage
      category="Dalam Negeri"
      data={dataDalamNegeri}
      startDate={startDate}
      endDate={endDate}
    />
    <CategoryPage
      category="Perintis"
      data={dataPerintis}
      startDate={startDate}
      endDate={endDate}
    />
    <CategoryPage
      category="Rakyat"
      data={dataRakyat}
      startDate={startDate}
      endDate={endDate}
    />
  </Document>
);

export default RekapPdfDocument;
