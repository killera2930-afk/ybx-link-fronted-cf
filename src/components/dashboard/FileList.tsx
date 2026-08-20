// src/components/dashboard/FileList.tsx
import { memo } from "react";
import { FileText, Folder, Film, Music, Image as ImageIcon, MoreVertical, CheckCircle2, Circle } from "lucide-react";
import { FileItem } from "@/lib/types";
import { formatBytes, isVideoFile, isImageFile } from "@/lib/utils";

interface FileListProps {
  items: FileItem[];
  onItemClick: (item: FileItem) => void;
  onMenu: (item: FileItem) => void;
  selectionMode?: boolean;
  selectedItems?: FileItem[];
  onItemSelect?: (item: FileItem) => void;
}

function FileListComponent({ 
  items, 
  onItemClick, 
  onMenu, 
  selectionMode = false,
  selectedItems = [],
  onItemSelect
}: FileListProps) {
  const getItemTheme = (item: FileItem) => {
    if (item.type === "folder") return {
      icon: <Folder size={18} className="text-amber-400" />,
      badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      border: "hover:border-amber-500/40"
    };
    if (isVideoFile(item.name)) return {
      icon: <Film size={18} className="text-violet-400" />,
      badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
      border: "hover:border-violet-500/40"
    };
    if (isImageFile(item.name)) return {
      icon: <ImageIcon size={18} className="text-pink-400" />,
      badge: "bg-pink-500/15 text-pink-300 border-pink-500/30",
      border: "hover:border-pink-500/40"
    };
    if (item.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i)) return {
      icon: <Music size={18} className="text-cyan-400" />,
      badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      border: "hover:border-cyan-500/40"
    };
    return {
      icon: <FileText size={18} className="text-emerald-400" />,
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      border: "hover:border-emerald-500/40"
    };
  };

  const isSelected = (item: FileItem) => selectedItems.some(i => i.id === item.id);

  const handleClick = (item: FileItem, e: React.MouseEvent) => {
    if (selectionMode && onItemSelect) {
      e.stopPropagation();
      onItemSelect(item);
    } else {
      onItemClick(item);
    }
  };

  return (
    <div className="space-y-1">
      {items.map((item, idx) => {
        const theme = getItemTheme(item);
        const selected = isSelected(item);

        return (
          <div
            key={item.id || idx}
            className={`group relative cyber-card rounded-xl px-3 py-2 flex items-center gap-3 transition-all duration-150 cursor-pointer ${theme.border} ${
              selected 
                ? "bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400" 
                : "hover:bg-[#0c122c]"
            }`}
            onClick={(e) => handleClick(item, e)}
          >
            {/* Selection Checkbox */}
            {selectionMode && (
              <div className="shrink-0 relative z-10">
                {selected ? (
                  <div className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                    <CheckCircle2 size={14} className="text-white font-bold" />
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-slate-900 border border-slate-600 rounded-full flex items-center justify-center hover:border-cyan-400">
                    <Circle size={12} className="text-slate-500" />
                  </div>
                )}
              </div>
            )}

            {/* Type Icon */}
            <div className="shrink-0 w-7 h-7 rounded-lg bg-[#070b1e] border border-white/5 flex items-center justify-center">
              {theme.icon}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white truncate transition-colors">
                {item.name}
              </p>
            </div>

            {/* File Type Pill */}
            <div className="shrink-0 hidden sm:block">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${theme.badge}`}>
                {item.type === "folder" ? "DIR" : item.name.split('.').pop() || "FILE"}
              </span>
            </div>

            {/* File Size */}
            <div className="shrink-0 hidden md:block w-20 text-right">
              <span className="text-xs text-slate-400 font-mono">
                {item.type === "file" && item.size ? formatBytes(item.size) : "—"}
              </span>
            </div>

            {/* Menu Trigger Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenu(item);
              }}
              className="shrink-0 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all opacity-70 group-hover:opacity-100"
              title="Options"
            >
              <MoreVertical size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default memo(FileListComponent);
