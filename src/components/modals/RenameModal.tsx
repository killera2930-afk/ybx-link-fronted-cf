// src/components/modals/RenameModal.tsx
import { X, Edit3 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface RenameModalProps {
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export default function RenameModal({ currentName, onClose, onRename }: RenameModalProps) {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name !== currentName) onRename(name);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-sm p-[1px] rounded-3xl bg-gradient-to-b from-cyan-500/40 via-blue-500/30 to-violet-500/30 shadow-2xl shadow-cyan-500/10"
      >
        <div className="cyber-glass bg-[#080d24]/95 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Edit3 size={18} />
              </div>
              <span>Rename Item</span>
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-full transition-colors">
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              autoFocus
              type="text"
              className="w-full bg-[#050814] border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-2.5 pt-1">
              <button 
                type="button" 
                onClick={onClose} 
                className="flex-1 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!name.trim() || name === currentName}
                className="shimmer-btn flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
