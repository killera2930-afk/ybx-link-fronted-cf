// src/components/dashboard/FileGrid.tsx
import { AnimatePresence } from "framer-motion";
import { FileItem, DirectoryData } from "@/lib/types";
import FileCard from "./FileCard";
import FileList from "./FileList";
import { FolderOpen } from "lucide-react";

export type SortBy = "name" | "date" | "size";
export type SortOrder = "asc" | "desc";

interface FileGridProps {
  data: DirectoryData;
  onItemClick: (item: FileItem) => void;
  onMenu: (item: FileItem) => void;
  loading: boolean;
  viewMode: "grid" | "list";
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectionMode?: boolean;
  selectedItems?: FileItem[];
  onItemSelect?: (item: FileItem) => void;
}

export default function FileGrid({ 
  data, 
  onItemClick, 
  onMenu, 
  loading, 
  viewMode,
  sortBy,
  sortOrder,
  selectionMode = false,
  selectedItems = [],
  onItemSelect
}: FileGridProps) {
  const items = Object.values(data.contents || {});

  // Sort function
  const sortItems = (items: FileItem[]): FileItem[] => {
    const folders = items.filter(item => item.type === "folder");
    const files = items.filter(item => item.type === "file");

    const sortFunction = (a: FileItem, b: FileItem) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
          break;
        case "date":
          const dateA = new Date(a.upload_date || 0).getTime();
          const dateB = new Date(b.upload_date || 0).getTime();
          comparison = dateA - dateB;
          break;
        case "size":
          comparison = (a.size || 0) - (b.size || 0);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    };

    // Sort folders and files separately, then combine (folders first)
    return [...folders.sort(sortFunction), ...files.sort(sortFunction)];
  };

  const sortedItems = sortItems(items);

  if (loading) {
    return (
      <div className={viewMode === "grid" 
        ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse"
        : "space-y-2 animate-pulse"
      }>
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={viewMode === "grid" 
              ? "bg-slate-800/50 rounded-xl aspect-square" 
              : "bg-slate-800/50 rounded-xl h-16"
            }
          />
        ))}
      </div>
    );
  }

  if (sortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-600">
        <FolderOpen size={64} className="mb-4 opacity-20" />
        <p className="text-lg">This folder is empty</p>
        <p className="text-sm text-zinc-600 mt-2">Drag & drop files or click Upload to add content</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return <FileList 
      items={sortedItems} 
      onItemClick={onItemClick} 
      onMenu={onMenu}
      selectionMode={selectionMode}
      selectedItems={selectedItems}
      onItemSelect={onItemSelect}
    />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 pb-20">
      {sortedItems.map((item) => (
        <FileCard 
          key={item.id} 
          item={item} 
          onClick={onItemClick} 
          onMenu={(item, e) => {
            e.stopPropagation();
            onMenu(item);
          }}
          selectionMode={selectionMode}
          isSelected={selectedItems.some(i => i.id === item.id)}
          onSelect={onItemSelect}
        />
      ))}
    </div>
  );
}
