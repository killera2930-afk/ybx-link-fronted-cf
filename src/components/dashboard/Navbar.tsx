// src/components/dashboard/Navbar.tsx
import { 
  Upload, Search, Cloud, FolderPlus, LogOut, 
  Grid3x3, List, FolderUp, Filter, BarChart3, 
  CheckSquare, Link2, Sparkles, X, SlidersHorizontal, HardDrive
} from "lucide-react";
import { useRef, useState } from "react";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { SortBy, SortOrder } from "./FileGrid";

type ViewMode = "grid" | "list";

interface NavbarProps {
  currentPath: string;
  onBack: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFolderUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (query: string) => void;
  onNavigate: (path: string) => void;
  onCreateFolder: () => void;
  onRemoteUpload: () => void;
  onLogout: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
  onToggleFilters?: () => void;
  onToggleStats?: () => void;
  onToggleSelectionMode?: () => void;
  selectionMode?: boolean;
  hasFilters?: boolean;
}

export default function Navbar({ 
  currentPath, 
  onBack, 
  onUpload, 
  onFolderUpload,
  onSearch, 
  onNavigate,
  onCreateFolder, 
  onRemoteUpload, 
  onLogout,
  viewMode,
  onViewModeChange,
  sortBy,
  sortOrder,
  onSortChange,
  onToggleFilters,
  onToggleStats,
  onToggleSelectionMode,
  selectionMode = false,
  hasFilters = false
}: NavbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    onSearch("");
  };

  const handleSortChange = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      onSortChange(newSortBy, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(newSortBy, "asc");
    }
    setShowSortMenu(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 cyber-glass border-b border-white/[0.08] px-3 sm:px-6 py-2.5 transition-all">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onUpload}
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={onFolderUpload}
      />

      {/* Main Bar Top Row */}
      <div className="flex items-center justify-between gap-2 md:gap-4">
        
        {/* Branding Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group shrink-0" 
          onClick={() => onNavigate("/")}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#090e24] border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-md">
              <Cloud size={20} className="group-hover:scale-110 transition-transform" />
            </div>
          </div>
          
          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-cyan-300 transition-colors">
                TG DRIVE
              </h1>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                AI Pro
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider">
              High-Speed Storage
            </span>
          </div>
        </div>

        {/* Futuristic Search Bar */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-4">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
              <Search size={16} />
            </div>
            
            <input
              type="text"
              placeholder="Search files, videos, documents... (Ctrl+K)"
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                onSearch(e.target.value);
              }}
              className="w-full bg-[#070b1e]/90 border border-slate-800/90 focus:border-cyan-400/80 rounded-xl pl-9 pr-14 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            />

            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-10 pr-2 flex items-center text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}

            <div className="hidden md:flex absolute inset-y-0 right-0 pr-2.5 items-center pointer-events-none">
              <span className="text-[10px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60 rounded-md px-1.5 py-0.5">
                ⌘K
              </span>
            </div>
          </form>
        </div>

        {/* Quick Action Docks */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Upload File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shimmer-btn flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-xl transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            title="Upload Files"
          >
            <Upload size={15} />
            <span className="hidden md:inline">Upload</span>
          </button>

          {/* New Folder Button */}
          <button
            onClick={onCreateFolder}
            className="flex items-center gap-1.5 bg-[#101738] hover:bg-[#182352] text-violet-300 border border-violet-500/30 hover:border-violet-400/60 text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-2 rounded-xl transition-all active:scale-95"
            title="Create New Folder"
          >
            <FolderPlus size={15} />
            <span className="hidden lg:inline">Folder</span>
          </button>

          {/* Remote URL Upload Button */}
          <button
            onClick={onRemoteUpload}
            className="hidden sm:flex items-center gap-1.5 bg-[#101738] hover:bg-[#182352] text-pink-300 border border-pink-500/30 hover:border-pink-400/60 text-xs sm:text-sm font-semibold px-2.5 py-2 rounded-xl transition-all active:scale-95"
            title="Direct URL Upload"
          >
            <Link2 size={15} />
            <span className="hidden xl:inline">Remote</span>
          </button>

          {/* Upload Directory */}
          <button
            onClick={() => folderInputRef.current?.click()}
            className="hidden sm:flex items-center p-2 bg-[#101738] hover:bg-[#182352] text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/60 rounded-xl transition-all active:scale-95"
            title="Upload Complete Folder"
          >
            <FolderUp size={16} />
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-[1px] h-6 bg-slate-800 mx-1" />

          {/* Storage Analytics Drawer */}
          {onToggleStats && (
            <button
              onClick={onToggleStats}
              className="p-2 bg-[#0c122c] hover:bg-[#151f47] text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/50 rounded-xl transition-all active:scale-95 relative"
              title="Storage Analytics"
            >
              <BarChart3 size={16} />
            </button>
          )}

          {/* Filter Drawer */}
          {onToggleFilters && (
            <button
              onClick={onToggleFilters}
              className={`p-2 rounded-xl border transition-all active:scale-95 relative ${
                hasFilters 
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20" 
                  : "bg-[#0c122c] hover:bg-[#151f47] text-slate-300 border-slate-800"
              }`}
              title="Search Filters"
            >
              <Filter size={16} />
              {hasFilters && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
              )}
            </button>
          )}

          {/* Selection Mode Toggle */}
          {onToggleSelectionMode && (
            <button
              onClick={onToggleSelectionMode}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                selectionMode 
                  ? "bg-pink-500/20 text-pink-300 border-pink-400 shadow-md shadow-pink-500/20" 
                  : "bg-[#0c122c] hover:bg-[#151f47] text-slate-300 border-slate-800"
              }`}
              title="Batch Selection Mode"
            >
              <CheckSquare size={16} />
            </button>
          )}

          {/* View Mode Toggle (Grid / List) */}
          <div className="flex items-center bg-[#070b1e] border border-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid" 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <Grid3x3 size={14} />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list" 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-800/30 rounded-xl transition-all active:scale-95"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>

        </div>
      </div>

      {/* Breadcrumb Navigation Row */}
      <div className="mt-2 pt-2 border-t border-white/[0.05] flex items-center justify-between overflow-x-auto scrollbar-hide">
        <Breadcrumbs currentPath={currentPath} onNavigate={onNavigate} onBack={onBack} />
        
        {/* Quick Sort Dropdown */}
        <div className="relative shrink-0 ml-2">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 bg-[#090d24] border border-slate-800/80 px-2.5 py-1 rounded-lg transition-all"
          >
            <SlidersHorizontal size={12} />
            <span className="capitalize">Sort: {sortBy} ({sortOrder})</span>
          </button>

          {showSortMenu && (
            <div className="absolute right-0 mt-1 w-36 bg-[#0c122c] border border-slate-800 rounded-xl shadow-2xl z-50 p-1 backdrop-blur-xl">
              <button
                onClick={() => handleSortChange("name")}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  sortBy === "name" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                Name ({sortOrder === "asc" ? "A-Z" : "Z-A"})
              </button>
              <button
                onClick={() => handleSortChange("date")}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  sortBy === "date" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                Date Modified
              </button>
              <button
                onClick={() => handleSortChange("size")}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  sortBy === "size" ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                File Size
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
