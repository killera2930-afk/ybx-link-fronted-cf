// src/components/modals/VideoPlayer.tsx
import { 
  X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, PictureInPicture, Lock, Unlock, Check, Download, 
  RotateCcw, RotateCw, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  src: string;
  onClose: () => void;
}

export default function VideoPlayer({ src, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (showSettings) {
      setShowSettings(false);
      return;
    }
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, showSettings]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const togglePiP = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  const skipTime = (seconds: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
    }
  };

  const handleMouseMove = () => {
    if (isLocked) return;
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* Ambient Cinema Lighting Mesh */}
      <div className="absolute inset-0 bg-gradient-radial from-violet-600/15 via-cyan-600/10 to-transparent pointer-events-none blur-[100px]" />

      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-5xl aspect-video bg-[#050814] rounded-3xl overflow-hidden shadow-2xl border border-violet-500/30 group"
      >
        {/* Video Element */}
        <video 
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          playsInline
        />

        {/* Big Center Play/Pause Overlay Icon on hover/pause */}
        {!isPlaying && !isLocked && (
          <div 
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer pointer-events-auto"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/50 hover:scale-110 transition-transform">
              <Play size={36} className="text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Top Floating Bar */}
        <AnimatePresence>
          {(showControls || !isPlaying) && !isLocked && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-30"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles size={12} /> Cinema 4K
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLocked(true)}
                  className="p-2 text-slate-300 hover:text-white bg-black/40 hover:bg-black/60 rounded-xl transition-all"
                  title="Lock Screen"
                >
                  <Unlock size={18} />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-slate-300 hover:text-white bg-black/40 hover:bg-red-600 rounded-xl transition-all"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lock Mode Unlock Trigger */}
        {isLocked && (
          <button
            onClick={() => setIsLocked(false)}
            className="absolute top-4 right-4 p-3 bg-violet-600/90 text-white rounded-full shadow-lg shadow-violet-500/50 z-50 animate-bounce"
            title="Unlock Screen"
          >
            <Lock size={20} />
          </button>
        )}

        {/* Bottom Floating Controls Bar */}
        <AnimatePresence>
          {(showControls || !isPlaying) && !isLocked && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 z-30"
            >
              {/* Progress Slider */}
              <div className="relative group/seeker">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-lg appearance-none cursor-pointer accent-cyan-400 transition-all duration-150"
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between gap-3 pt-1">
                
                {/* Left Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    onClick={togglePlay}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </button>

                  <button 
                    onClick={(e) => skipTime(-10, e)}
                    className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors hidden sm:block"
                    title="Rewind 10s"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button 
                    onClick={(e) => skipTime(10, e)}
                    className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors hidden sm:block"
                    title="Forward 10s"
                  >
                    <RotateCw size={16} />
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button onClick={toggleMute} className="p-1.5 text-slate-300 hover:text-white">
                      {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 hidden sm:block"
                    />
                  </div>

                  {/* Time Indicator */}
                  <span className="text-xs font-mono text-slate-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  
                  {/* Speed Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-all"
                    >
                      {playbackSpeed}x
                    </button>

                    {showSettings && (
                      <div className="absolute bottom-10 right-0 bg-[#0c122c] border border-slate-800 rounded-xl p-1 shadow-2xl backdrop-blur-xl z-50">
                        {speeds.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSpeedChange(s)}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center justify-between gap-3 ${
                              playbackSpeed === s ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            <span>{s}x</span>
                            {playbackSpeed === s && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PiP Button */}
                  <button 
                    onClick={togglePiP}
                    className="p-2 text-slate-300 hover:text-white rounded-lg transition-colors hidden sm:block"
                    title="Picture in Picture"
                  >
                    <PictureInPicture size={18} />
                  </button>

                  {/* Fullscreen Button */}
                  <button 
                    onClick={toggleFullscreen}
                    className="p-2 text-slate-300 hover:text-white rounded-lg transition-colors"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
