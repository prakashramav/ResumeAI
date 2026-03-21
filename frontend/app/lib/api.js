import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // send cookies with every request 
})

api.interceptors.request.use((config) => {
    if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )auth_token_ref=([^;]*)/);
    const token = match ? decodeURIComponent(match[1]) : sessionStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.message || "Something went wrong";
    // If 401, clear stale cookies
    if (err.response?.status === 401 && typeof document !== "undefined") {
      document.cookie = "auth_token_ref=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      sessionStorage.removeItem("token");
    }
    return Promise.reject(new Error(message));
  }
);

export const resumeAPI = {
  getAll:    (params) => api.get("/resumes", { params }),
  getById:   (id)     => api.get(`/resumes/${id}`),
  create:    (data)   => api.post("/resumes", data),
  update:    (id, data) => api.put(`/resumes/${id}`, data),
  delete:    (id)     => api.delete(`/resumes/${id}`),
  download:  (id)     => api.get(`/resumes/${id}/download`, { responseType: "blob" }),
};

export const aiAPI = {
  enhanceSummary:    (data) => api.post("/ai/enhance-summary", data),
  enhanceProject:    (data) => api.post("/ai/enhance-project", data),
  enhanceExperience: (data) => api.post("/ai/enhance-experience", data),
  suggestSkills:     (data) => api.post("/ai/suggest-skills", data),
};

export const atsAPI = {
  check: (data) => api.post("/ats/check", data),
};

export const interviewAPI = {
  generate: (data) => api.post("/interview/generate", data),
};

export default api;