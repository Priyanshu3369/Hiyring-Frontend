// src/services/userApi.js
// Thin wrappers around the user profile API endpoints.
// Components import these functions — not raw axios calls.

import api from "./api.js";

/** GET /api/v1/users/me — fetch authenticated user's profile */
export const fetchMyProfile = async () => {
    const { data } = await api.get("/v1/users/me");
    return data.data; // unwrap envelope
};

/** PUT /api/v1/users/me — update editable profile fields */
export const updateMyProfile = async (payload) => {
    const { data } = await api.put("/v1/users/me", payload);
    return data.data;
};

/**
 * POST /api/v1/users/me/avatar — upload avatar image
 * @param {File} file
 * @param {function} onProgress  (percent: number) => void   optional progress callback
 */
export const uploadAvatar = async (file, onProgress) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const { data } = await api.post("/v1/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percent);
            }
        },
    });

    return data.data;
};

/** GET /api/v1/users/:id — fetch public profile (no auth) */
export const fetchPublicProfile = async (id) => {
    const { data } = await api.get(`/v1/users/${id}`);
    return data.data;
};
