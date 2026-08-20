// src/components/dashboard/FileCard.tsx
import { memo } from "react";
import { MoreVertical, Folder, FileText, Film, Music, Image as ImageIcon, CheckCircle2, Circle, Play, Eye } from "lucide-react";
import { FileItem } from "@/lib/types";
import { formatBytes, isVideoFile, isImageFile } from "@/lib/utils";

interface FileCardProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
  onMenu: (item: FileItem, e: React.MouseEvent) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (item: FileItem) => void;
}

function FileCardComponent({ 
  item, 
  onClick, 
  onMenu,
  selectionMode = false,
  isSelected = false,
  onSelect
}: FileCardProps) {
  const isVideo = item.type === "file" && isVideoFile(item.name);
  const isImage = item.type === "file" && isImageFile(item.name);
  const isAudio = item.type === "file" && Boolean(item.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i));
  const isFolder = item.type === "folder";

  const getThemeConfig = () => {
    if (isFolder) return {
      border: "hover:border-amber-500/50",
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      icon: <Folder size={34} className="text-amber-400" />
    };
    if (isVideo) return {
      border: "hover:border-violet-500/50",
      badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
      icon: <Film size={34} className="text-violet-400" />
    };
    if (isImage) return {
      border: "hover:border-pink-500/50",
      badge: "bg-pink-500/15 text-pink-300 border-pink-500/30",
      icon: <ImageIcon size={34} className="text-pink-400" />
    };
    if (isAudio) return {
      border: "hover:border-cyan-500/50",
      badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      icon: <Music size={34} className="text-cyan-400" />
    };
    return {
      border: "hover:border-emerald-500/50",
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      icon: <FileText size={34} className="text-emerald-400" />
    };
  };

  const theme = getThemeConfig();

  const handleClick = (e: React.MouseEvent) => {
    if (selectionMode && onSelect) {
      e.stopPropagation();
      onSelect(item);
    } else {
      onClick(item);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectionMode) {
      onMenu(item, e);
    }
  };

  return (
    <div
      className={`group relative cyber-card rounded-2xl p-3 sm:p-3.5 cursor-pointer select-none ${theme.border} ${
        isSelected 
          ? "ring-2 ring-cyan-400 bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/20" 
          : ""
      }`}
      onClick={handleClick}
    >
      {/* Selection Checkbox */}
      {selectionMode && (
        <div className="absolute top-2.5 left-2.5 z-20">
          {isSelected ? (
            <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-md shadow-cyan-500/40 ring-2 ring-white">
              <CheckCircle2 size={16} className="text-white font-bold" />
            </div>
          ) : (
            <div className="w-6 h-6 bg-slate-900/90 border border-slate-600 rounded-full flex items-center justify-center hover:border-cyan-400">
              <Circle size={14} className="text-slate-400" />
            </div>
          )}
        </div>
      )}

      {/* Menu Actions Button */}
      {!selectionMode && (
        <button
          onClick={handleMenuClick}
          className="absolute top-2.5 right-2.5 p-1.5 bg-[#090e24]/90 hover:bg-[#151f47] border border-white/10 hover:border-cyan-400/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-20"
          title="Options"
        >
          <MoreVertical size={14} className="text-slate-300 hover:text-white" />
        </button>
      )}

      {/* Media Thumbnail / Icon Box */}
      <div className="aspect-[4/3] rounded-xl bg-[#070a1a] border border-white/[0.05] flex items-center justify-center mb-2.5 relative overflow-hidden">
        {isImage ? (
          <div className="relative w-full h-full">
            <img 
              src={`/view/${item.id}`}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : isVideo ? (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-[#120f2e] to-[#08071a]">
            {theme.icon}
            <div className="absolute w-8 h-8 rounded-full bg-violet-600/90 flex items-center justify-center shadow-md">
              <Play size={14} className="text-white fill-white ml-0.5" />
            </div>
          </div>
        ) : isAudio ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1a2e] to-[#060e1a] gap-1.5">
            {theme.icon}
            <div className="flex items-center gap-1">
              <span className="w-1 bg-cyan-400 rounded-full wave-bar-1" />
              <span className="w-1 bg-cyan-400 rounded-full wave-bar-2" />
              <span className="w-1 bg-cyan-400 rounded-full wave-bar-3" />
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {theme.icon}
          </div>
        )}
      </div>

      {/* File Details */}
      <div className="space-y-1 relative z-10">
        <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors" title={item.name}>
          {item.name}
        </p>
        
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          {item.type === "file" && item.size ? (
            <span className="text-slate-400 font-mono">{formatBytes(item.size)}</span>
          ) : (
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Folder size={11} /> Folder
            </span>
          )}

          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded border ${theme.badge}`}>
            {item.type === "folder" ? "DIR" : item.name.split('.').pop() || "FILE"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(FileCardComponent);
