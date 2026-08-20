// src/app/adminx/page.tsx
"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { 
  Upload, CheckCircle2, Loader2, FolderUp, Film, Music, 
  Image as ImageIcon, FileText, Folder, Sparkles, HardDrive, 
  Activity, Cloud, ShieldCheck, Zap
} from "lucide-react";
import LoginScreen from "@/components/auth/LoginScreen";
import Navbar from "@/components/dashboard/Navbar";
import FileGrid, { SortBy, SortOrder } from "@/components/dashboard/FileGrid";
import VideoPlayer from "@/components/modals/VideoPlayer";
import ImageViewer from "@/components/modals/ImageViewer";
import FileActionModal from "@/components/modals/FileActionModal";
import CreateFolderModal from "@/components/modals/CreateFolderModal";
import RenameModal from "@/components/modals/RenameModal";
import FileMenuModal from "@/components/modals/FileMenuModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import RemoteUploadModal from "@/components/modals/RemoteUploadModal";
import FolderUploadModal from "@/components/modals/FolderUploadModal";
import DragDropZone from "@/components/upload/DragDropZone";
import SearchFilters, { SearchFilterState, applyFileTypeFilter, applyFileSizeFilter, applyDateFilter } from "@/components/search/SearchFilters";
import BulkActions from "@/components/bulk/BulkActions";
import StorageStats from "@/components/stats/StorageStats";
import AudioPlayerBar from "@/components/audio/AudioPlayerBar";
import { 
  getDirectory, getFileUrls, createNewFolder, renameFileFolder, 
  deleteFileFolder, startRemoteUpload, getFileDownloadProgress, getTelegramUploadProgress 
} from "@/lib/api";
import { FileItem, DirectoryData } from "@/lib/types";
import { isVideoFile, isImageFile, formatBytes } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const API_URL = "";

type ViewMode = "grid" | "list";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [path, setPath] = useState("/");
  const [data, setData] = useState<DirectoryData>({ contents: {} });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const pathRef = useRef(path);
  useEffect(() => { pathRef.current = path; }, [path]);

  // Media Player States
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imageViewerData, setImageViewerData] = useState<{ url: string; name: string } | null>(null);
  const [audioItem, setAudioItem] = useState<FileItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  // Upload States
  const [uploadQueue, setUploadQueue] = useState<Array<{ file: File; progress: number; id: string; relativePath?: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoteUploading, setIsRemoteUploading] = useState(false);
  const [remoteProgress, setRemoteProgress] = useState(0);
  const [remoteStatus, setRemoteStatus] = useState(""); 

  // Modal Visibility
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showRemoteUpload, setShowRemoteUpload] = useState(false);
  const [showFolderUpload, setShowFolderUpload] = useState(false);
  const [pendingFolderFiles, setPendingFolderFiles] = useState<FileList | null>(null);
  
  const [menuItem, setMenuItem] = useState<FileItem | null>(null);
  const [renameItem, setRenameItem] = useState<FileItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<FileItem | null>(null);

  // Features State
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<FileItem[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>({
    type: "all",
    size: "all",
    date: "all"
  });

  // Load Saved Preferences
  useEffect(() => {
    const savedViewMode = localStorage.getItem("tgdrive_viewmode") as ViewMode | null;
    const savedSortBy = localStorage.getItem("tgdrive_sortby") as SortBy | null;
    const savedSortOrder = localStorage.getItem("tgdrive_sortorder") as SortOrder | null;
    
    if (savedViewMode) setViewMode(savedViewMode);
    if (savedSortBy) setSortBy(savedSortBy);
    if (savedSortOrder) setSortOrder(savedSortOrder);
  }, []);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
      if (e.key === "Escape") {
        setShowFilters(false);
        setShowStats(false);
        setSelectedFile(null);
        setMenuItem(null);
        setVideoUrl(null);
        setImageViewerData(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("tgdrive_viewmode", mode);
  };

  const handleSortChange = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    localStorage.setItem("tgdrive_sortby", newSortBy);
    localStorage.setItem("tgdrive_sortorder", newSortOrder);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) setSelectedItems([]);
  };

  const handleItemSelect = (item: FileItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleBulkDownload = () => {
    selectedItems.forEach(item => {
      if (item.type === "file") {
        const { vercelUrl } = getFileUrls(item.id);
        const link = document.createElement('a');
        link.href = vercelUrl;
        link.download = item.name;
        link.click();
      }
    });
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Permanently delete ${selectedItems.length} selected items?`)) return;
    
    try {
      for (const item of selectedItems) {
        const fullItemPath = path === "/" ? `/${item.id}` : `${path}${item.id}`;
        await deleteFileFolder(fullItemPath, password);
      }
      setSelectedItems([]);
      setSelectionMode(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      fetchDirectory(path);
    } catch (e) {
      alert("Bulk delete failed");
    }
  };

  const getAllFiles = (): FileItem[] => {
    return Object.values(data.contents || {});
  };

  // Filter Data by Active Category & Search Filters (Memoized for 0 lag)
  const filteredData = useMemo((): DirectoryData => {
    const items = Object.values(data.contents || {});
    const filtered = items.filter(item => {
      // Category Filter
      if (activeCategory === "folders" && item.type !== "folder") return false;
      if (activeCategory === "videos" && (item.type !== "file" || !isVideoFile(item.name))) return false;
      if (activeCategory === "images" && (item.type !== "file" || !isImageFile(item.name))) return false;
      if (activeCategory === "audio" && (item.type !== "file" || !item.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i))) return false;
      if (activeCategory === "documents" && (item.type !== "file" || !item.name.match(/\.(pdf|doc|docx|txt|zip|rar|tar|gz|7z)$/i))) return false;

      if (item.type === "folder") return true;

      // Search Modal Filters
      const typeMatch = applyFileTypeFilter(item.name, searchFilters.type);
      const sizeMatch = applyFileSizeFilter(item.size || 0, searchFilters.size);
      const dateMatch = applyDateFilter(item.upload_date || "", searchFilters.date);
      
      return typeMatch && sizeMatch && dateMatch;
    });

    return {
      contents: filtered.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {} as Record<string, FileItem>)
    };
  }, [data.contents, activeCategory, searchFilters]);

  const rawItems = Object.values(data.contents || {});
  
  const { totalFilesCount, totalFoldersCount, totalSizeBytes } = useMemo(() => {
    let files = 0;
    let folders = 0;
    let bytes = 0;
    for (const i of rawItems) {
      if (i.type === "file") {
        files++;
        bytes += (i.size || 0);
      } else {
        folders++;
      }
    }
    return { totalFilesCount: files, totalFoldersCount: folders, totalSizeBytes: bytes };
  }, [rawItems]);

  const hasActiveFilters = searchFilters.type !== "all" || searchFilters.size !== "all" || searchFilters.date !== "all";

  // Refresh Protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRemoteUploading || isUploading) {
        e.preventDefault();
        e.returnValue = "Upload in progress.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRemoteUploading, isUploading]);

  // Persistent Login
  useEffect(() => {
    const savedPass = localStorage.getItem("tgdrive_pass");
    if (savedPass) {
      setPassword(savedPass);
      setIsAuthenticated(true);
      fetchDirectory("/", savedPass);
    }
  }, []);

  const handleLoginSuccess = (pass: string) => {
    localStorage.setItem("tgdrive_pass", pass);
    setPassword(pass);
    setIsAuthenticated(true);
    fetchDirectory("/", pass);
  };

  const handleLogout = () => {
    localStorage.removeItem("tgdrive_pass");
    setIsAuthenticated(false);
    setPassword("");
    setData({ contents: {} });
  };

  const fetchDirectory = async (dirPath: string, pass: string = password) => {
    setLoading(true);
    try {
      const res = await getDirectory(dirPath, pass);
      if (res.data.status === "ok") {
        setData(res.data.data);
        setPath(dirPath);
      } else {
        console.error("API Error:", res.data);
      }
    } catch (error) { 
      console.error("Fetch failed", error); 
    }
    setLoading(false);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      const newPath = path === "/" 
        ? `/${item.id}/` 
        : `${path}${item.id}/`;
      fetchDirectory(newPath);
    } else if (isVideoFile(item.name)) {
      setVideoUrl(getFileUrls(item.id).vercelUrl);
    } else if (isImageFile(item.name)) {
      setImageViewerData({
        url: getFileUrls(item.id).vercelUrl,
        name: item.name
      });
    } else if (item.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i)) {
      setAudioItem(item);
    } else {
      setSelectedFile(item);
    }
  };

  const handleBack = () => {
    if (path === "/" || path.includes("/search_")) { 
      fetchDirectory("/"); 
      return; 
    }
    
    const parts = path.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.length === 0 ? "/" : `/${parts.join("/")}/`;
    fetchDirectory(newPath);
  };

  const handleNavigate = (targetPath: string) => {
    fetchDirectory(targetPath);
  };

  const handleSearch = (query: string) => {
    if (!query) { fetchDirectory("/"); return; }
    fetchDirectory(`/search_${encodeURIComponent(query)}`);
  };

  const handleCreateFolder = async (name: string) => {
    setShowCreateFolder(false);
    try { 
      await createNewFolder(path, name, password); 
      await new Promise(resolve => setTimeout(resolve, 500));
      fetchDirectory(path); 
    } 
    catch (e) { alert("Failed to create folder"); }
  };

  const executeRename = async (newName: string) => {
    if (!renameItem) return;
    try {
      const fullItemPath = path === "/" ? `/${renameItem.id}` : `${path}${renameItem.id}`;
      await renameFileFolder(fullItemPath, newName, password);
      setRenameItem(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      fetchDirectory(path);
    } catch (e) { alert("Rename failed"); }
  };

  const executeDelete = async () => {
    if (!deleteItem) return;
    try {
      const fullItemPath = path === "/" ? `/${deleteItem.id}` : `${path}${deleteItem.id}`;
      await deleteFileFolder(fullItemPath, password);
      setDeleteItem(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      fetchDirectory(path);
    } catch (e) { alert("Delete failed"); }
  };

  const uploadFile = async (file: File, uploadId: string, relativePath?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", pathRef.current);
    formData.append("password", password);
    formData.append("id", uploadId);
    formData.append("total_size", file.size.toString());
    
    if (relativePath) {
      formData.append("relative_path", relativePath);
    }

    try {
      await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          const progress = Math.round((p.loaded * 100) / (p.total || 1));
          setUploadQueue(prev => 
            prev.map(item => item.id === uploadId ? { ...item, progress } : item)
          );
        },
      });
      setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
    } catch (error) { 
      console.error("Upload failed:", error);
      setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
      alert(`Failed to upload ${relativePath || file.name}`);
    }
  };

  const processUploadQueue = async (files: File[], relativePaths?: string[]) => {
    setIsUploading(true);
    const currentPath = pathRef.current;
    
    const newUploads = files.map((file, index) => ({
      file,
      progress: 0,
      id: Math.random().toString(36).substring(7),
      relativePath: relativePaths?.[index],
    }));
    
    setUploadQueue(prev => [...prev, ...newUploads]);

    for (const upload of newUploads) {
      await uploadFile(upload.file, upload.id, upload.relativePath);
    }

    setIsUploading(false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    fetchDirectory(currentPath);
  };

  const handleFilesSelected = (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    processUploadQueue(filesArray);
  };

  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(e.target.files);
    }
  };

  const handleFolderUploadClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingFolderFiles(e.target.files);
      setShowFolderUpload(true);
    }
  };

  const processFolderUpload = async (folderName: string, flattenStructure: boolean) => {
    if (!pendingFolderFiles) return;
    setShowFolderUpload(false);
    
    if (flattenStructure) {
      handleFilesSelected(pendingFolderFiles);
    } else {
      const filesArray = Array.from(pendingFolderFiles);
      const relativePaths = filesArray.map(file => {
        // @ts-ignore
        const fullPath = file.webkitRelativePath || file.name;
        const parts = fullPath.split('/');
        if (parts.length > 1) {
          parts[0] = folderName;
          return parts.join('/');
        }
        return `${folderName}/${file.name}`;
      });
      processUploadQueue(filesArray, relativePaths);
    }
    setPendingFolderFiles(null);
  };

  const pollRemoteStatus = async (id: string) => {
    setIsRemoteUploading(true);
    setRemoteProgress(0);
    setRemoteStatus("Initializing...");

    let stage = "download"; 
    let uploadCompleted = false;
    const currentPath = pathRef.current;

    const intervalId = setInterval(async () => {
      try {
        if (stage === "download") {
          const dlRes = await getFileDownloadProgress(id, password);
          if (dlRes.data.status === "ok" && dlRes.data.data) {
            const [status, current, total] = dlRes.data.data;
            if (status === "running" || status === "Downloading") {
              setRemoteStatus("Downloading to VPS...");
              const pct = total > 0 ? Math.round((current / total) * 100) : 0;
              setRemoteProgress(pct);
            } else if (status === "completed") {
              setRemoteStatus("Processing...");
              setRemoteProgress(100);
              stage = "upload";
            } else if (status === "error") {
              clearInterval(intervalId);
              setIsRemoteUploading(false);
              alert("Remote Download Failed");
            }
          }
        }

        if (stage === "upload" && !uploadCompleted) {
          const upRes = await getTelegramUploadProgress(id, password);
          if (upRes.data.status === "ok" && upRes.data.data) {
            const [status, current, total] = upRes.data.data;
            if (status === "running") {
              const pct = total > 0 ? Math.round((current / total) * 100) : 0;
              setRemoteProgress(pct);
              setRemoteStatus("Mirroring to Telegram DC..."); 
            } else if (status === "completed") {
              uploadCompleted = true;
              clearInterval(intervalId);
              setRemoteStatus("Done!");
              setRemoteProgress(100);
              await new Promise(resolve => setTimeout(resolve, 1500));
              fetchDirectory(currentPath);
              setIsRemoteUploading(false);
            }
          }
        }
      } catch (e) { console.error(e); }
    }, 1500);
  };

  const handleRemoteUpload = async (url: string) => {
    setShowRemoteUpload(false);
    try {
      const res = await startRemoteUpload(url, path, password);
      if (res.data.status === "ok") {
        pollRemoteStatus(res.data.id);
      } else {
        alert("Error: " + res.data.status);
      }
    } catch (e) { alert("Failed to start remote upload"); }
  };

  if (!isAuthenticated) return <LoginScreen onSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen pb-24 relative bg-[#050814]">
      
      {/* Top Floating Glass Navbar */}
      <Navbar 
        currentPath={path} 
        onBack={handleBack} 
        onUpload={handleLocalUpload}
        onFolderUpload={handleFolderUploadClick}
        onSearch={handleSearch}
        onNavigate={handleNavigate}
        onCreateFolder={() => setShowCreateFolder(true)}
        onRemoteUpload={() => setShowRemoteUpload(true)}
        onLogout={handleLogout}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onToggleStats={() => setShowStats(!showStats)}
        onToggleSelectionMode={toggleSelectionMode}
        selectionMode={selectionMode}
        hasFilters={hasActiveFilters}
      />

      {/* Search Filters Drawer */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[100] pt-28 px-4">
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setShowFilters(false)}
            />
            <div className="relative max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()}>
              <SearchFilters
                filters={searchFilters}
                onFilterChange={setSearchFilters}
                onClose={() => setShowFilters(false)}
                totalFiles={rawItems.filter(i => i.type === "file").length}
                filteredFiles={Object.values(filteredData.contents || {}).filter(i => i.type === "file").length}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Storage Analytics Drawer */}
      {showStats && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowStats(false)}>
          <div className="cyber-glass rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <HardDrive size={22} className="text-cyan-400" />
                <span>Cloud Storage Analytics</span>
              </h2>
              <button onClick={() => setShowStats(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <StorageStats allFiles={getAllFiles()} />
          </div>
        </div>
      )}

      {/* Bulk Actions Floating Dock */}
      {selectionMode && (
        <BulkActions
          selectedItems={selectedItems}
          onDeselectAll={() => setSelectedItems([])}
          onBulkDownload={handleBulkDownload}
          onBulkDelete={handleBulkDelete}
        />
      )}

      {/* Global Drag & Drop Zone */}
      <DragDropZone 
        onFilesSelected={handleFilesSelected}
        isUploading={isUploading || isRemoteUploading}
      />

      {/* Main Dashboard Body */}
      <main className="pt-32 sm:pt-28 px-3 sm:px-8 max-w-[1700px] mx-auto space-y-6">
        
        {/* Hero Quick Metrics & Status Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-glass rounded-2xl p-4 sm:p-5 border border-white/[0.08] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />

          {/* Left Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                <Cloud size={22} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Directory Storage</span>
                <span className="text-lg font-black text-white font-mono">{formatBytes(totalSizeBytes)}</span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-mono">
                {totalFilesCount} Files
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-xl font-mono">
                {totalFoldersCount} Folders
              </span>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Encrypted Telegram Cloud CDN • Online</span>
          </div>
        </motion.div>

        {/* Quick Category Filter Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          {[
            { id: "all", label: "All Items", icon: <Sparkles size={14} /> },
            { id: "videos", label: "Videos", icon: <Film size={14} /> },
            { id: "images", label: "Images", icon: <ImageIcon size={14} /> },
            { id: "audio", label: "Audio", icon: <Music size={14} /> },
            { id: "documents", label: "Docs", icon: <FileText size={14} /> },
            { id: "folders", label: "Folders", icon: <Folder size={14} /> },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all whitespace-nowrap active:scale-95 ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/40"
                  : "cyber-glass text-slate-300 hover:text-white hover:bg-slate-800/80 border border-white/[0.06]"
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Upload Queue Progress Bars */}
        {uploadQueue.length > 0 && (
          <div className="space-y-2">
            {uploadQueue.map((upload) => (
              <div 
                key={upload.id}
                className="cyber-glass p-3.5 rounded-2xl flex items-center gap-3 border border-cyan-500/30 shadow-lg"
              >
                <div className="bg-cyan-500/20 p-2 rounded-xl text-cyan-300">
                  {upload.relativePath ? <FolderUp size={18} /> : <Upload size={18} className="animate-bounce" />}
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-200">
                    <span className="truncate max-w-[280px]" title={upload.relativePath || upload.file.name}>
                      {upload.relativePath || upload.file.name}
                    </span>
                    <span className="font-mono text-cyan-400">{upload.progress}%</span>
                  </div>
                  <div className="w-full bg-[#050814] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]" 
                      style={{ width: `${upload.progress}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Remote Upload Progress Bar */}
        {isRemoteUploading && (
          <div className="cyber-glass p-3.5 rounded-2xl flex items-center gap-3 border border-pink-500/30 shadow-lg">
            <div className="bg-pink-500/20 p-2 rounded-xl text-pink-300">
              {remoteStatus === "Done!" ? <CheckCircle2 size={18} /> : <Loader2 size={18} className="animate-spin" />}
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-200">
                <span>{remoteStatus}</span>
                <span className="font-mono text-pink-400">{remoteProgress}%</span>
              </div>
              <div className="w-full bg-[#050814] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-violet-500 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.8)]" 
                  style={{ width: `${remoteProgress}%` }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* File Grid / List Display */}
        <FileGrid 
          data={filteredData} 
          onItemClick={selectionMode ? handleItemSelect : handleItemClick} 
          onMenu={(item) => setMenuItem(item)} 
          loading={loading}
          viewMode={viewMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          selectionMode={selectionMode}
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
        />
      </main>

      {/* Interactive Modals */}
      <AnimatePresence>
        {selectedFile && (
          <FileActionModal 
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            onStream={isVideoFile(selectedFile.name) ? () => {
              setVideoUrl(getFileUrls(selectedFile.id).vercelUrl);
              setSelectedFile(null);
            } : undefined}
            onViewImage={isImageFile(selectedFile.name) ? () => {
              setImageViewerData({
                url: getFileUrls(selectedFile.id).vercelUrl,
                name: selectedFile.name
              });
              setSelectedFile(null);
            } : undefined}
            onPlayAudio={selectedFile.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i) ? () => {
              setAudioItem(selectedFile);
              setSelectedFile(null);
            } : undefined}
          />
        )}

        {menuItem && (
          <FileMenuModal 
            item={menuItem}
            onClose={() => setMenuItem(null)}
            onRename={() => { setRenameItem(menuItem); setMenuItem(null); }}
            onDelete={() => { setDeleteItem(menuItem); setMenuItem(null); }}
          />
        )}

        {renameItem && <RenameModal currentName={renameItem.name} onClose={() => setRenameItem(null)} onRename={executeRename} />}
        {deleteItem && <DeleteConfirmModal itemName={deleteItem.name} onConfirm={executeDelete} onCancel={() => setDeleteItem(null)} />}
        {showCreateFolder && <CreateFolderModal onClose={() => setShowCreateFolder(false)} onCreate={handleCreateFolder} />}
        {showRemoteUpload && <RemoteUploadModal onClose={() => setShowRemoteUpload(false)} onUpload={handleRemoteUpload} />}
        
        {showFolderUpload && pendingFolderFiles && (
          <FolderUploadModal
            fileCount={pendingFolderFiles.length}
            // @ts-ignore
            defaultFolderName={pendingFolderFiles[0]?.webkitRelativePath?.split('/')[0] || 'uploaded-folder'}
            onClose={() => {
              setShowFolderUpload(false);
              setPendingFolderFiles(null);
            }}
            onUpload={processFolderUpload}
          />
        )}
      </AnimatePresence>

      {/* Video Cinema Player */}
      {videoUrl && <VideoPlayer src={videoUrl} onClose={() => setVideoUrl(null)} />}
      
      {/* Image Lightbox */}
      {imageViewerData && (
        <ImageViewer 
          src={imageViewerData.url} 
          alt={imageViewerData.name} 
          onClose={() => setImageViewerData(null)} 
        />
      )}

      {/* Floating Audio Player */}
      <AnimatePresence>
        {audioItem && (
          <AudioPlayerBar item={audioItem} onClose={() => setAudioItem(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}
