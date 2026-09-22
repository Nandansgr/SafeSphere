import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
};

export const profileAPI = {
  getProfile: () => api.get("/profile"),
  updateProfile: (data) => api.put("/profile", data),
  updatePassword: (data) => api.put("/profile/password", data),
  uploadPicture: (formData) =>
    api.post("/profile/upload-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};

export const contactsAPI = {
  getAll: (params) => api.get("/contacts", { params }),
  getOne: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post("/contacts", data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export const sosAPI = {
  create: (data) => api.post("/sos", data),
  getAll: () => api.get("/sos"),
  getHistory: (params) => api.get("/sos/history", { params }),
};

export const incidentAPI = {
  create: (data) => api.post("/incident", data),
  getAll: (params) => api.get("/incident", { params }),
  getOne: (id) => api.get(`/incident/${id}`),
  update: (id, data) => api.put(`/incident/${id}`, data),
  delete: (id) => api.delete(`/incident/${id}`),
};

export default api;
