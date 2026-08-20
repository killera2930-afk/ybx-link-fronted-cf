// src/components/navigation/Breadcrumbs.tsx
import { ChevronRight, Home, Folder } from "lucide-react";
import { motion } from "framer-motion";

interface BreadcrumbsProps {
  currentPath?: string;
  path?: string;
  onNavigate: (path: string) => void;
  onBack?: () => void;
}

export default function Breadcrumbs({ currentPath, path, onNavigate }: BreadcrumbsProps) {
  const activePath = currentPath || path || "/";
  const parts = activePath.split("/").filter(Boolean);
  
  if (activePath.includes("/search_")) {
    const searchTerm = decodeURIComponent(activePath.split("search_")[1]);
    return (
      <div className="flex items-center gap-2 text-xs font-medium">
        <button 
          onClick={() => onNavigate("/")}
          className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
        >
          <Home size={13} />
          <span>Home</span>
        </button>
        <ChevronRight size={12} className="text-slate-600" />
        <span className="text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
          Search: <span className="text-cyan-300">"{searchTerm}"</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium overflow-x-auto scrollbar-hide py-0.5">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate("/")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          parts.length === 0 
            ? "bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-300 border border-cyan-400/40 shadow-sm" 
            : "text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60"
        }`}
      >
        <Home size={13} />
        <span>Root</span>
      </motion.button>
      
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        const breadcrumbPath = `/${parts.slice(0, index + 1).join("/")}/`;
        
        return (
          <div key={index} className="flex items-center gap-1.5 shrink-0">
            <ChevronRight size={12} className="text-slate-600" />
            {isLast ? (
              <span className="flex items-center gap-1 text-cyan-300 font-semibold bg-[#11193c] border border-cyan-500/30 px-2.5 py-1 rounded-lg shadow-sm truncate max-w-[180px]" title={part}>
                <Folder size={12} className="text-cyan-400" />
                {part}
              </span>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(breadcrumbPath)}
                className="text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 px-2 py-1 rounded-lg transition-colors truncate max-w-[150px]"
                title={part}
              >
                {part}
              </motion.button>
            )}
          </div>
        );
      })}
    </div>
  );
}
