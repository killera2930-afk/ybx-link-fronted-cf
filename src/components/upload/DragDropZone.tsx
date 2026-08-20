// src/components/upload/DragDropZone.tsx
import { Upload, Sparkles, Cloud } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DragDropZoneProps {
  onFilesSelected: (files: FileList) => void;
  isUploading?: boolean;
}

export default function DragDropZone({ onFilesSelected, isUploading }: DragDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      
      if (e.dataTransfer?.types.includes('Files') && !isUploading) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);

      if (isUploading) return;

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
    };

    document.body.addEventListener('dragenter', handleDragEnter as any);
    document.body.addEventListener('dragleave', handleDragLeave as any);
    document.body.addEventListener('dragover', handleDragOver as any);
    document.body.addEventListener('drop', handleDrop as any);

    return () => {
      document.body.removeEventListener('dragenter', handleDragEnter as any);
      document.body.removeEventListener('dragleave', handleDragLeave as any);
      document.body.removeEventListener('dragover', handleDragOver as any);
      document.body.removeEventListener('drop', handleDrop as any);
    };
  }, [isUploading, onFilesSelected]);

  return (
    <AnimatePresence>
      {isDragging && !isUploading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 pointer-events-none"
        >
          <div className="border-2 border-dashed border-cyan-400 rounded-3xl p-12 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-pink-500/10 shadow-[0_0_50px_rgba(6,182,212,0.3)] max-w-lg w-full text-center relative overflow-hidden">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-cyan-500/40 animate-bounce">
              <Upload size={44} className="text-white" />
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2">
              <span className="gradient-text-neon">DROP FILES</span> TO UPLOAD
            </h3>
            <p className="text-sm text-cyan-200 font-medium">
              Release to instantly mirror to Telegram Storage Cloud
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
