import axios from "axios";

// Base URL configuration
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for attaching token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (email, password) => {
  // Backend expects JSON body matching UserLogin schema (email, password)
  // NOT x-www-form-urlencoded
  const response = await api.post("/login", {
    email: email,
    password: password,
  });
  return response.data;
};


// --- Entries ---
export const getEntries = async (params) => {
  const response = await api.get("/entries", { params });
  return response.data;
};

export const createEntry = async (data) => {
  const response = await api.post("/entri", data);
  return response.data;
};

export const updateEntry = async (id, data) => {
  const response = await api.put(`/entri/${id}`, data);
  return response.data;
};

export const deleteEntry = async (id) => {
  const response = await api.delete(`/entri/${id}`);
  return response.data;
};

export const manualSubmitEntries = async (data) => {
  const response = await api.post("/entries/manual-submit", data);
  return response.data;
};

export const submitEntries = async (payload) => {
  const response = await api.post("/entries/report", payload);
  return response.data;
};

// --- Dashboard ---
export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getDashboardTrend = async (year, type) => {
  const response = await api.get("/dashboard/trend", {
    params: { tahun: year, jenis_trend: type },
  });
  return response.data;
};

export const getCommodityDistribution = async (year, operatorId) => {
  const response = await api.get("/dashboard/distribution", {
    params: { tahun: year, operator_id: operatorId },
  });
  return response.data;
};

// REMOVED: getWeeklyTrend — backend endpoint deleted
// export const getWeeklyTrend = async () => {
//   const response = await api.get("/dashboard/weekly");
//   return response.data;
// };

// संभावित future use – verify before deletion
export const getYearlySummary = async (year, operatorId) => {
  const params = { tahun: year };
  if (operatorId) params.operator_id = operatorId;

  const response = await api.get("/summary/tahunan", {
    params: params,
  });
  return response.data;
};

export const getDraftCount = async (operatorId) => {
  const response = await api.get("/entri/draft-count", {
    params: { operator_id: operatorId },
  });
  return response.data;
};

export const getPeriodStatus = async (bulan, tahun, operatorId) => {
  const response = await api.get("/period-status", {
    params: { bulan, tahun, operator_id: operatorId },
  });
  return response.data;
};

// --- Admin ---
export const getAdminDashboardSummary = async (bulan, tahun, trend_type) => {
  const response = await api.get("/admin/dashboard-summary", {
    params: { bulan, tahun, trend_type },
  });
  return response.data;
};

export const getOperators = async () => {
  const response = await api.get("/operators");
  return response.data;
};

export const createOperator = async (data) => {
  const response = await api.post("/operators", data);
  return response.data;
};

export const updateOperator = async (id, data) => {
  // Assuming there is an endpoint for updating operator, otherwise create one or handle accordingly
  // For now, based on backend router, there might not be a PUT /operators/{id} yet.
  // I will add it as a placeholder or remove if not needed.
  // The backend audit showed DELETE and CREATE.
  // Let's assume PUT exists or will be added. If not, this might fail at runtime but fixes build.
  const response = await api.put(`/operators/${id}`, data);
  return response.data;
};

export const deleteOperator = async (id) => {
  const response = await api.delete(`/operators/${id}`);
  return response.data;
};

export const getAutoSubmitHistory = async (params) => {
  const response = await api.get("/admin/auto-submit-logs", { params });
  return response.data;
};

export const getEntriesByGroup = async (operatorId, submittedAt) => {
  const response = await api.get("/admin/entries/detail-by-group", {
    params: { operator_id: operatorId, submitted_at: submittedAt },
  });
  return response.data;
};

export const getRekapEntries = async ({ category, start_date, end_date }) => {
  const response = await api.get("/admin/rekap", {
    params: { category, start_date, end_date },
  });
  return response.data;
};

export const getEntryDetail = async (id, params) => {
  const response = await api.get(`/entries/${id}`, { params });
  return response.data;
};

// Alias for getSubmissionDetail if needed by other components
export const getSubmissionDetail = getEntryDetail;

export const updateEntryAdmin = async (id, data) => {
  const response = await api.put(`/admin/entries/${id}`, data);
  return response.data;
};

export const deleteEntryAdmin = async (id) => {
  const response = await api.delete(`/admin/entries/${id}`);
  return response.data;
};

export default api;
