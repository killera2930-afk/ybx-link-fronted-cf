// src/components/modals/DeleteConfirmModal.tsx
import { AlertTriangle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ itemName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-sm p-[1px] rounded-3xl bg-gradient-to-b from-red-500/40 via-pink-500/30 to-violet-500/30 shadow-2xl shadow-red-500/20"
      >
        <div className="cyber-glass bg-[#080d24]/95 rounded-3xl p-6 relative overflow-hidden text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <Trash2 size={24} />
          </div>
          
          <h3 className="text-base font-bold text-white mb-1.5">Confirm Deletion</h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Are you sure you want to permanently delete <br/>
            <span className="text-white font-semibold break-all">"{itemName}"</span>?
          </p>

          <div className="flex gap-2.5">
            <button 
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="shimmer-btn flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-red-500/30 transition-all active:scale-95"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
