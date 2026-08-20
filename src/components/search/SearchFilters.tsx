// src/components/search/SearchFilters.tsx
import { X, FileText, Image, Video, Music, File, Calendar, HardDrive } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type FileTypeFilter = "all" | "images" | "videos" | "audio" | "documents" | "other";
export type SizeFilter = "all" | "small" | "medium" | "large" | "huge";
export type DateFilter = "all" | "today" | "week" | "month" | "year";

export interface SearchFilterState {
  type: FileTypeFilter;
  size: SizeFilter;
  date: DateFilter;
}

interface SearchFiltersProps {
  filters: SearchFilterState;
  onFilterChange: (filters: SearchFilterState) => void;
  onClose: () => void;
  totalFiles: number;
  filteredFiles: number;
}

export default function SearchFilters({ 
  filters, 
  onFilterChange, 
  onClose,
  totalFiles,
  filteredFiles 
}: SearchFiltersProps) {
  const typeOptions: { value: FileTypeFilter; label: string; icon: any; extensions: string }[] = [
    { value: "all", label: "All Files", icon: File, extensions: "All types" },
    { value: "images", label: "Images", icon: Image, extensions: ".jpg, .png, .gif, .webp, .svg" },
    { value: "videos", label: "Videos", icon: Video, extensions: ".mp4, .mkv, .webm, .avi, .mov" },
    { value: "audio", label: "Audio", icon: Music, extensions: ".mp3, .wav, .ogg, .flac" },
    { value: "documents", label: "Documents", icon: FileText, extensions: ".pdf, .doc, .txt, .xlsx" },
    { value: "other", label: "Other", icon: File, extensions: "All other files" },
  ];

  const sizeOptions: { value: SizeFilter; label: string; range: string }[] = [
    { value: "all", label: "Any Size", range: "All files" },
    { value: "small", label: "Small", range: "< 10 MB" },
    { value: "medium", label: "Medium", range: "10 MB - 100 MB" },
    { value: "large", label: "Large", range: "100 MB - 1 GB" },
    { value: "huge", label: "Huge", range: "> 1 GB" },
  ];

  const dateOptions: { value: DateFilter; label: string; description: string }[] = [
    { value: "all", label: "All Time", description: "No date filter" },
    { value: "today", label: "Today", description: "Uploaded today" },
    { value: "week", label: "This Week", description: "Last 7 days" },
    { value: "month", label: "This Month", description: "Last 30 days" },
    { value: "year", label: "This Year", description: "Last 365 days" },
  ];

  const handleTypeChange = (type: FileTypeFilter) => {
    onFilterChange({ ...filters, type });
  };

  const handleSizeChange = (size: SizeFilter) => {
    onFilterChange({ ...filters, size });
  };

  const handleDateChange = (date: DateFilter) => {
    onFilterChange({ ...filters, date });
  };

  const resetFilters = () => {
    onFilterChange({ type: "all", size: "all", date: "all" });
  };

  const hasActiveFilters = filters.type !== "all" || filters.size !== "all" || filters.date !== "all";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl shadow-2xl overflow-hidden z-50 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
              {filteredFiles} / {totalFiles} files
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-zinc-500 hover:text-cyan-400 transition-colors"
            >
              Reset All
            </button>
          )}
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 space-y-6">
        
        {/* File Type */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-3 block flex items-center gap-2">
            <File size={16} className="text-cyan-400" />
            File Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {typeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleTypeChange(option.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    filters.type === option.value
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                      : "border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon size={20} className="mb-2" />
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-[10px] text-zinc-600 mt-1 truncate">
                    {option.extensions}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* File Size */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-3 block flex items-center gap-2">
            <HardDrive size={16} className="text-cyan-400" />
            File Size
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {sizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSizeChange(option.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  filters.size === option.value
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-[10px] text-zinc-600 mt-1">{option.range}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Date */}
        <div>
          <label className="text-sm font-medium text-zinc-300 mb-3 block flex items-center gap-2">
            <Calendar size={16} className="text-cyan-400" />
            Upload Date
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {dateOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleDateChange(option.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  filters.date === option.value
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                    : "border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white"
                }`}
              >
                <div className="text-sm font-medium">{option.label}</div>
                <div className="text-[10px] text-zinc-600 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      {hasActiveFilters && (
        <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/30">
          <div className="flex items-center justify-between text-sm">
            <div className="text-zinc-400">
              Active filters: {[
                filters.type !== "all" && `Type: ${filters.type}`,
                filters.size !== "all" && `Size: ${filters.size}`,
                filters.date !== "all" && `Date: ${filters.date}`
              ].filter(Boolean).join(", ")}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Helper functions to apply filters
export const applyFileTypeFilter = (filename: string, filter: FileTypeFilter): boolean => {
  if (filter === "all") return true;
  
  const name = filename.toLowerCase();
  
  const filters = {
    images: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico"],
    videos: [".mp4", ".mkv", ".webm", ".avi", ".mov", ".flv", ".wmv"],
    audio: [".mp3", ".wav", ".ogg", ".flac", ".m4a", ".aac"],
    documents: [".pdf", ".doc", ".docx", ".txt", ".xlsx", ".xls", ".ppt", ".pptx"],
  };
  
  if (filter === "other") {
    const allKnownExtensions = [...filters.images, ...filters.videos, ...filters.audio, ...filters.documents];
    return !allKnownExtensions.some(ext => name.endsWith(ext));
  }
  
  return filters[filter]?.some(ext => name.endsWith(ext)) || false;
};

export const applyFileSizeFilter = (size: number, filter: SizeFilter): boolean => {
  if (filter === "all") return true;
  
  const mb = size / (1024 * 1024);
  
  switch (filter) {
    case "small": return mb < 10;
    case "medium": return mb >= 10 && mb < 100;
    case "large": return mb >= 100 && mb < 1024;
    case "huge": return mb >= 1024;
    default: return true;
  }
};

export const applyDateFilter = (uploadDate: string, filter: DateFilter): boolean => {
  if (filter === "all") return true;
  
  const now = new Date();
  const fileDate = new Date(uploadDate);
  const diffMs = now.getTime() - fileDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  switch (filter) {
    case "today": return diffDays < 1;
    case "week": return diffDays < 7;
    case "month": return diffDays < 30;
    case "year": return diffDays < 365;
    default: return true;
  }
};
