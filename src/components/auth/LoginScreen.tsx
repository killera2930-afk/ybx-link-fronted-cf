// src/components/auth/LoginScreen.tsx
import { useState } from "react";
import { LogIn, Lock, ShieldCheck, Sparkles, KeyRound, Cpu, AlertCircle } from "lucide-react";
import { checkPassword } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface LoginScreenProps {
  onSuccess: (pass: string) => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError(false);
    try {
      const res = await checkPassword(password);
      if (res.data.status === "ok") {
        onSuccess(password);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#050814]">
      {/* Lightweight Ambient Gradients (0% CPU/GPU overhead) */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Glow Border Wrapper */}
        <div className="p-[1px] rounded-3xl bg-gradient-to-b from-cyan-500/40 via-violet-500/30 to-pink-500/30 shadow-2xl shadow-cyan-500/10">
          <div className="cyber-glass rounded-3xl p-8 md:p-10 relative overflow-hidden backdrop-blur-2xl bg-[#090d21]/90">
            
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* Holographic Lock Icon Badge */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-2xl blur-lg opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#101738] to-[#0a0f28] border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
                  <Lock className="w-8 h-8 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  <Sparkles className="w-4 h-4 text-violet-300 absolute -top-1 -right-1 animate-bounce" />
                </div>
              </div>
            </div>

            {/* Heading & Subtitle */}
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight">
                <span className="gradient-text-neon font-black">TG DRIVE</span>{" "}
                <span className="text-white">PORTAL</span>
              </h1>
              <p className="text-slate-400 text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 font-medium">
                <Cpu size={14} className="text-cyan-400 animate-pulse" />
                Next-Gen Cloud Storage Gateway
              </p>
            </div>

            {/* Input Form */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  placeholder="Enter Security Access Key"
                  className={`w-full bg-[#060918]/80 border ${
                    error 
                      ? "border-red-500/80 focus:border-red-400 shadow-lg shadow-red-500/20" 
                      : "border-slate-800 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                  } rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 text-sm font-medium outline-none transition-all duration-300`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  autoFocus
                />
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    className="flex items-center gap-2 text-xs font-semibold text-red-400 bg-red-950/40 border border-red-800/40 px-3.5 py-2 rounded-lg"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Invalid credentials. Access Denied.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Unlock Button */}
              <button
                onClick={handleLogin}
                disabled={loading || !password.trim()}
                className="shimmer-btn w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span className="tracking-wide">Authorize & Enter</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer Badge */}
            <div className="mt-8 pt-6 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>AES-256 Encrypted Telegram Storage System</span>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
