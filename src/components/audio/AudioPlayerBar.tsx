// src/components/audio/AudioPlayerBar.tsx
import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Download, X, Music, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import { FileItem } from "@/lib/types";

interface AudioPlayerBarProps {
  item: FileItem | null;
  onClose: () => void;
}

export default function AudioPlayerBar({ item, onClose }: AudioPlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (item && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [item]);

  if (!item) return null;

  const streamUrl = `${process.env.NEXT_PUBLIC_API_URL}/view/${item.id}`;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl z-50 p-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 shadow-2xl shadow-cyan-500/20"
    >
      <div className="cyber-glass bg-[#080d24]/95 backdrop-blur-2xl rounded-2xl p-3.5 flex flex-col gap-2">
        <audio
          ref={audioRef}
          src={streamUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => !isLooping && setIsPlaying(false)}
          loop={isLooping}
        />

        <div className="flex items-center justify-between gap-3">
          
          {/* Song Info & Animated Visualizer */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Music size={18} />
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-white truncate" title={item.name}>
                {item.name}
              </p>
              
              {/* Soundwaves */}
              <div className="flex items-center gap-1 mt-0.5">
                {isPlaying ? (
                  <>
                    <span className="w-0.5 bg-cyan-400 rounded wave-bar-1" />
                    <span className="w-0.5 bg-cyan-400 rounded wave-bar-2" />
                    <span className="w-0.5 bg-cyan-400 rounded wave-bar-3" />
                    <span className="w-0.5 bg-cyan-400 rounded wave-bar-4" />
                    <span className="text-[10px] text-cyan-400 font-semibold ml-1">Playing HD Audio</span>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400">Paused</span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Loop Toggle */}
            <button
              onClick={() => setIsLooping(!isLooping)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isLooping ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40" : "text-slate-400 hover:text-white"
              }`}
              title="Repeat Track"
            >
              <Repeat size={15} />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            {/* Direct Download */}
            <a
              href={streamUrl}
              download={item.name}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Download Audio"
            >
              <Download size={16} />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
              title="Close Player"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar & Timers */}
        <div className="flex items-center gap-2.5 pt-1">
          <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <span className="text-[10px] font-mono text-slate-400 w-8">
            {formatTime(duration)}
          </span>
        </div>

      </div>
    </motion.div>
  );
}
