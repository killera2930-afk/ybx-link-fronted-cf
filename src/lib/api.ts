// src/lib/api.ts
import axios from "axios";

const getOrigin = () => {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL 
    ? (process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`)
    : "https://drive.ybxanime.com";
};

const API_URL = typeof window !== 'undefined' ? "" : (process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || "https://dl.ybxanime.com");

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

export const checkPassword = async (password: string) => {
  return api.post("/api/checkPassword", { pass: password });
};

export const getDirectory = async (path: string, password: string) => {
  return api.post(`/api/getDirectory?t=${Date.now()}`, { path, password });
};

export const createNewFolder = async (path: string, name: string, password: string) => {
  return api.post("/api/createNewFolder", { path, name, password });
};

export const renameFileFolder = async (path: string, name: string, password: string) => {
  return api.post("/api/renameFileFolder", { path, name, password });
};

export const deleteFileFolder = async (path: string, password: string) => {
  return api.post("/api/deleteFileFolder", { path, password });
};

export const startRemoteUpload = async (url: string, path: string, password: string) => {
  let filename = ""; 
  try {
      const decodedUrl = decodeURIComponent(url);
      const urlObj = new URL(decodedUrl);
      const extracted = urlObj.pathname.split('/').pop();
      if (extracted && extracted.includes('.')) {
          filename = extracted;
      }
  } catch (e) {}

  return api.post("/api/startFileDownloadFromUrl", { 
    url, 
    path, 
    filename,
    password,
    singleThreaded: false 
  });
};

export const getFileDownloadProgress = async (id: string, password: string) => {
  return api.post("/api/getFileDownloadProgress", { id, password });
};

export const getTelegramUploadProgress = async (id: string, password: string) => {
  return api.post("/api/getUploadProgress", { id, password });
};

// --- STRICT QUERY LINK GENERATION ---
export const getFileUrls = (id: string) => {
  const origin = getOrigin();
  return {
    directUrl: `${origin}/download?path=${id}`,
    streamUrl: `${origin}/watch?path=${id}`,
    downloadUrl: `${origin}/download?path=${id}`,
    vercelUrl: `${origin}/download?path=${id}`,
  };
};

export const getFileDownloadUrl = (path: string, id: string) => {
  const origin = getOrigin();
  return `${origin}/download?path=${id}`; 
};

export default api;
