import axios from "axios";

const API_URL = "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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
  getAll:   (params)   => api.get("/resumes", { params }),
  getById:  (id)       => api.get(`/resumes/${id}`),
  create:   (data)     => api.post("/resumes", data),
  update:   (id, data) => api.put(`/resumes/${id}`, data),
  delete:   (id)       => api.delete(`/resumes/${id}`),
  download: (id)       => api.get(`/resumes/${id}/download`, { responseType: "blob" }),
};

export const aiAPI = {
  enhanceSummary:    (data) => api.post("/ai/enhance-summary", data),
  enhanceProject:    (data) => api.post("/ai/enhance-project", data),
  enhanceExperience: (data) => api.post("/ai/enhance-experience", data),
  suggestSkills:     (data) => api.post("/ai/suggest-skills", data),
};

export const atsAPI = {
  check:          (data) => api.post("/ats/check", data),
  updateSummary:  (data) => api.post("/ats/update-summary", data),
  updateProjects: (data) => api.post("/ats/update-projects", data),
};

export const interviewAPI = {
  generate: (data) => api.post("/interview/generate", data),
};

export default api;