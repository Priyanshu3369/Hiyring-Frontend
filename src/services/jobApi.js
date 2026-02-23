// src/services/jobApi.js
import api from "./api.js";

/**
 * GET /api/v1/jobs — fetch all jobs with required skills
 */
export const getAllJobs = async () => {
    const { data } = await api.get("/v1/jobs");
    return data.data; // unwrap envelope
};

/**
 * GET /api/v1/jobs/saved — fetch user's saved jobs
 */
export const getSavedJobs = async () => {
    const { data } = await api.get("/v1/jobs/saved");
    return data.data; // unwrap envelope — controller already flattens jobs
};

/**
 * POST /api/v1/jobs/saved/:jobId — toggle save/unsave
 * Returns { saved: true/false }
 */
export const toggleSaveJob = async (jobId) => {
    const { data } = await api.post(`/v1/jobs/saved/${jobId}`);
    return data.data; // { saved: true/false }
};

/**
 * GET /api/v1/applications — fetch user's applications
 */
export const getMyApplications = async () => {
    const { data } = await api.get("/v1/applications");
    return data.data;
};

/**
 * POST /api/v1/applications — apply for a job
 */
export const applyForJob = async (jobId) => {
    const { data } = await api.post("/v1/applications", { jobId });
    return data.data;
};
