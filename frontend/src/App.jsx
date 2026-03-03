import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import LoginPage from "./features/auth/pages/LoginPage";
import OperatorDashboard from "./features/operator/pages/OperatorDashboard";
import OperatorEntry from "./features/operator/pages/OperatorEntry";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminOperators from "./features/admin/pages/AdminOperators";
import DataPage from "./features/operator/pages/DataPage";
import RekapFaxPage from "./features/operator/pages/RekapFaxPage";
import RekapDraftOperator from "./features/admin/pages/RekapDraftOperator";
import RekapDataEntries from "./features/admin/pages/RekapDataEntries";
import RekapPdfViewer from "./features/admin/pages/RekapPdfViewer";
import DetailSubmission from "./features/admin/pages/DetailSubmission";
import DetailReportPage from "./features/operator/pages/DetailReportPage";
import { Users } from "lucide-react";

// Wrapper for Operator Layout
const OperatorLayoutWrapper = () => (
  <div className="bg-background min-h-screen font-sans">
    <Sidebar />
    <Topbar />
    <main className="pl-64 pt-20 transition-all duration-300">
      <div className="p-8 max-w-7xl mx-auto">
        <Outlet />
      </div>
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<LoginPage />} />

          {/* OPERATOR ROUTES (Protected) */}
          <Route element={<ProtectedRoute allowedRoles={["OPERATOR"]} />}>
            <Route element={<OperatorLayoutWrapper />}>
              <Route path="/" element={<OperatorDashboard />} />
              <Route path="/entri" element={<OperatorEntry />} />
              <Route path="/laporan" element={<DataPage />} />
              <Route
                path="/laporan/detail/:id"
                element={<DetailReportPage />}
              />
              <Route path="/rekap" element={<RekapFaxPage />} />
              <Route path="/data" element={<DataPage />} />
            </Route>
          </Route>

          {/* ADMIN ROUTES (Protected) */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/operators"
              element={
                <AdminLayout>
                  <AdminOperators />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/rekap-entries"
              element={
                <AdminLayout>
                  <RekapDataEntries />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/rekap-operator"
              element={
                <AdminLayout>
                  <RekapDraftOperator />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/rekap-operator/detail/:operatorId/:submittedAt"
              element={
                <AdminLayout>
                  <DetailSubmission />
                </AdminLayout>
              }
            />
            <Route
              path="/admin/rekap-entries/print"
              element={<RekapPdfViewer />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
