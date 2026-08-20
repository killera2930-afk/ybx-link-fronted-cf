// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- ADD THIS FUNCTION ---
export const isImageFile = (filename: string) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico", ".tiff"];
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
};

export const isVideoFile = (filename: string) => {
  const videoExtensions = [".mp4", ".mkv", ".webm", ".avi", ".mov", ".flv"];
  return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
