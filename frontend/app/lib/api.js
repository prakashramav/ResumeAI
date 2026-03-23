import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
})

api.interceptors.request.use((config) => {
  return config;
});


api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

export const resumeAPI = {
  getAll:    (params)   => api.get("/api/resumes", { params }),
  getById:   (id)       => api.get(`/api/resumes/${id}`),
  create:    (data)     => api.post("/api/resumes", data),
  update:    (id, data) => api.put(`/api/resumes/${id}`, data),
  delete:    (id)       => api.delete(`/api/resumes/${id}`),
  download:  (id)       => api.get(`/api/resumes/${id}/download`, { responseType: "blob" }),
};

export const aiAPI = {
  enhanceSummary:    (data) => api.post("/api/ai/enhance-summary", data),
  enhanceProject:    (data) => api.post("/api/ai/enhance-project", data),
  enhanceExperience: (data) => api.post("/api/ai/enhance-experience", data),
  suggestSkills:     (data) => api.post("/api/ai/suggest-skills", data),
};

export const atsAPI = {
  check:          (data) => api.post("/api/ats/check", data),
  updateSummary:  (data) => api.post("/api/ats/update-summary", data),
  updateProjects: (data) => api.post("/api/ats/update-projects", data), // ← NEW
};

export const interviewAPI = {
  generate: (data) => api.post("/api/interview/generate", data),
};

export default api;