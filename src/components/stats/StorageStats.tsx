// src/components/stats/StorageStats.tsx
import { HardDrive, FileText, Image, Video, Music, File, TrendingUp, Folder } from "lucide-react";
import { motion } from "framer-motion";
import { FileItem } from "@/lib/types";

interface StorageStatsProps {
  allFiles: FileItem[];
  onClose?: () => void;
}

export default function StorageStats({ allFiles, onClose }: StorageStatsProps) {
  // Calculate statistics
  const files = allFiles.filter(item => item.type === "file");
  const folders = allFiles.filter(item => item.type === "folder");
  
  const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
  
  // File type breakdown
  const getFileType = (filename: string): string => {
    const name = filename.toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].some(ext => name.endsWith(ext))) return "images";
    if ([".mp4", ".mkv", ".webm", ".avi", ".mov"].some(ext => name.endsWith(ext))) return "videos";
    if ([".mp3", ".wav", ".ogg", ".flac"].some(ext => name.endsWith(ext))) return "audio";
    if ([".pdf", ".doc", ".docx", ".txt", ".xlsx", ".xls"].some(ext => name.endsWith(ext))) return "documents";
    return "other";
  };

  const typeStats = files.reduce((acc, file) => {
    const type = getFileType(file.name);
    acc[type] = (acc[type] || 0) + (file.size || 0);
    return acc;
  }, {} as Record<string, number>);

  const typeCount = files.reduce((acc, file) => {
    const type = getFileType(file.name);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return { value: bytes, unit: "B" };
    if (bytes < 1024 * 1024) return { value: (bytes / 1024).toFixed(1), unit: "KB" };
    if (bytes < 1024 * 1024 * 1024) return { value: (bytes / (1024 * 1024)).toFixed(1), unit: "MB" };
    return { value: (bytes / (1024 * 1024 * 1024)).toFixed(2), unit: "GB" };
  };

  const totalFormatted = formatBytes(totalSize);

  const typeData = [
    { type: "images", label: "Images", icon: Image, color: "text-pink-400", bgColor: "bg-pink-500/10", borderColor: "border-pink-500/30" },
    { type: "videos", label: "Videos", icon: Video, color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
    { type: "audio", label: "Audio", icon: Music, color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30" },
    { type: "documents", label: "Documents", icon: FileText, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
    { type: "other", label: "Other", icon: File, color: "text-zinc-400", bgColor: "bg-zinc-500/10", borderColor: "border-zinc-500/30" },
  ];

  // Largest files
  const largestFiles = [...files]
    .sort((a, b) => (b.size || 0) - (a.size || 0))
    .slice(0, 5);

  // Recent uploads
  const recentFiles = [...files]
    .filter(f => f.upload_date)
    .sort((a, b) => new Date(b.upload_date!).getTime() - new Date(a.upload_date!).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Storage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-2xl border-2 border-cyan-500/30 bg-zinc-900/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <HardDrive size={24} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {totalFormatted.value} <span className="text-lg text-zinc-400">{totalFormatted.unit}</span>
              </div>
              <div className="text-sm text-zinc-500">Total Storage Used</div>
            </div>
          </div>
        </motion.div>

        {/* Total Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-2xl bg-zinc-900/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{files.length}</div>
              <div className="text-sm text-zinc-500">Total Files</div>
            </div>
          </div>
        </motion.div>

        {/* Total Folders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-2xl bg-zinc-900/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Folder size={24} className="text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{folders.length}</div>
              <div className="text-sm text-zinc-500">Total Folders</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* File Type Breakdown */}
      <div className="glass-card p-6 rounded-2xl bg-zinc-900/30">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-cyan-400" />
          Storage by Type
        </h3>
        <div className="space-y-3">
          {typeData.map((item, index) => {
            const Icon = item.icon;
            const size = typeStats[item.type] || 0;
            const count = typeCount[item.type] || 0;
            const percentage = totalSize > 0 ? (size / totalSize) * 100 : 0;
            const formatted = formatBytes(size);

            if (count === 0) return null;

            return (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${item.bgColor} ${item.borderColor}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Icon size={20} className={item.color} />
                    <span className="font-medium text-white">{item.label}</span>
                    <span className="text-sm text-zinc-500">({count} files)</span>
                  </div>
                  <div className="text-sm font-medium text-white">
                    {formatted.value} {formatted.unit}
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`h-full ${item.color.replace('text-', 'bg-')}`}
                  />
                </div>
                <div className="text-xs text-zinc-600 mt-1">
                  {percentage.toFixed(1)}% of total storage
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Largest Files & Recent Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Largest Files */}
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/30">
          <h3 className="text-lg font-semibold text-white mb-4">Largest Files</h3>
          <div className="space-y-2">
            {largestFiles.map((file, index) => {
              const formatted = formatBytes(file.size || 0);
              return (
                <div key={file.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs text-zinc-600 font-mono w-4">{index + 1}</span>
                    <FileText size={16} className="text-zinc-500 shrink-0" />
                    <span className="text-sm text-zinc-300 truncate" title={file.name}>{file.name}</span>
                  </div>
                  <span className="text-sm font-medium text-white ml-2">
                    {formatted.value} {formatted.unit}
                  </span>
                </div>
              );
            })}
            {largestFiles.length === 0 && (
              <div className="text-center text-zinc-600 py-4">No files yet</div>
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/30">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Uploads</h3>
          <div className="space-y-2">
            {recentFiles.map((file, index) => {
              const date = new Date(file.upload_date!);
              const formatted = formatBytes(file.size || 0);
              return (
                <div key={file.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs text-zinc-600 font-mono w-4">{index + 1}</span>
                    <FileText size={16} className="text-zinc-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-300 truncate" title={file.name}>{file.name}</div>
                      <div className="text-xs text-zinc-600">{date.toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 ml-2">
                    {formatted.value} {formatted.unit}
                  </span>
                </div>
              );
            })}
            {recentFiles.length === 0 && (
              <div className="text-center text-zinc-600 py-4">No recent files</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
