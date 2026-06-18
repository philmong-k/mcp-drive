import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, Sparkles, Wand2 } from "lucide-react";

interface AudioVisualizerProps {
  isListening: boolean;
  onToggleListen: () => void;
  statusText: string;
}

export default function AudioVisualizer({
  isListening,
  onToggleListen,
  statusText,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [voiceVolume, setVoiceVolume] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let order = 0;
    const drawWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw active colorful wave or simple idling line
      if (isListening) {
        order += 0.12;
        // Background subtle grid lines
        ctx.strokeStyle = "rgba(51, 65, 85, 0.1)";
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 20) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, height);
          ctx.stroke();
        }

      // Generate 3 flowing sine waves of blue shades
        const waves = [
          { color: "rgba(59, 130, 246, 0.8)", amplitude: 22, frequency: 0.035, speed: 1.5 },
          { color: "rgba(96, 165, 250, 0.6)", amplitude: 15, frequency: 0.02, speed: 2.0 },
          { color: "rgba(147, 197, 253, 0.4)", amplitude: 10, frequency: 0.05, speed: 1.0 },
        ];

        waves.forEach((w) => {
          ctx.beginPath();
          ctx.strokeStyle = w.color;
          ctx.lineWidth = 2;
          for (let x = 0; x < width; x++) {
            const relativeAmp = Math.sin(x * 0.005 + Math.PI) * Math.sin(x * 0.005); // Fade at edges
            const y = centerY + Math.sin(x * w.frequency + order * w.speed) * w.amplitude * relativeAmp * (1 + Math.sin(order) * 0.2);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

        // Simulating mic volume fluctuation
        setVoiceVolume(Math.floor(20 + Math.random() * 65));
      } else {
        // Idle straight wave
        ctx.beginPath();
        ctx.strokeStyle = "rgba(71, 85, 105, 0.5)";
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        setVoiceVolume(0);
      }

      animationRef.current = requestAnimationFrame(drawWave);
    };

    drawWave();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isListening]);

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-[#141417] border border-slate-800 rounded-3xl shadow-lg relative overflow-hidden group">
      {/* Glow highlight */}
      <div className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10 blur-xl transition duration-500 group-hover:opacity-15 ${isListening ? "animate-pulse" : ""}`}></div>

      <div className="w-full flex items-center justify-between mb-3 z-10">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isListening ? "bg-blue-500 animate-ping" : "bg-slate-500"}`}></span>
          <h3 className="text-sm font-semibold tracking-tight text-white uppercase font-sans">
            AI Voice Module
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 py-0.5 px-2 bg-slate-900 border border-slate-800 rounded">
          <Volume2 size={13} className={isListening ? "text-blue-500 animate-bounce" : ""} />
          <span>PCM 16kHz</span>
        </div>
      </div>

      {/* Svg / Canvas Visualizer */}
      <div className="w-full h-18 bg-black/40 border border-slate-800/80 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={360}
          height={72}
          className="w-full h-full object-cover"
        />
        {isListening && (
          <div className="absolute right-3 bottom-1 text-[10px] font-mono text-blue-400/80">
            Gain: {voiceVolume}%
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between gap-3 z-10">
        <button
          onClick={onToggleListen}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isListening
              ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/15"
          }`}
        >
          {isListening ? (
            <>
              <MicOff size={15} />
              <span>음성 대화 중지</span>
            </>
          ) : (
            <>
              <Mic size={15} />
              <span>마이크 켜기 (음성 제어)</span>
            </>
          )}
        </button>
        
        <div className="flex-1 flex flex-col justify-center text-left">
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Voice Agent Status</span>
          <p className="text-xs font-semibold text-slate-350 line-clamp-1">
            {statusText}
          </p>
        </div>
      </div>
    </div>
  );
}
