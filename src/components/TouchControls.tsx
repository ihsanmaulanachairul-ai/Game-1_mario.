import React, { useCallback } from 'react';
import { phaserBridge } from '../game/PhaserGameBridge';
import { ArrowLeft, ArrowRight, ArrowUp, Zap, Sparkles } from 'lucide-react';

interface TouchControlsProps {
  isPortrait: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ isPortrait }) => {
  const handlePointerDown = useCallback((action: 'left' | 'right' | 'jump' | 'sprint' | 'attack', e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture errors on unsupported devices
    }
    phaserBridge.setTouchInput(action, true);
  }, []);

  const handlePointerUp = useCallback((action: 'left' | 'right' | 'jump' | 'sprint' | 'attack', e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
    phaserBridge.setTouchInput(action, false);
  }, []);

  const handlePointerCancel = useCallback((action: 'left' | 'right' | 'jump' | 'sprint' | 'attack') => {
    phaserBridge.setTouchInput(action, false);
  }, []);

  // Shared button style
  const btnBase = "active:scale-95 transition-transform flex items-center justify-center font-bold shadow-lg select-none no-touch-callout touch-none cursor-pointer border-2";

  if (isPortrait) {
    // Portrait mode: Clean tactile gamepad strip below the canvas
    return (
      <div className="w-full bg-slate-900/95 border-t border-slate-800 p-4 pb-6 flex items-center justify-between select-none touch-none no-touch-callout">
        {/* D-Pad: Left & Right */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`${btnBase} w-16 h-16 rounded-2xl bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 active:bg-sky-600 active:border-sky-400`}
            onPointerDown={(e) => handlePointerDown('left', e)}
            onPointerUp={(e) => handlePointerUp('left', e)}
            onPointerCancel={() => handlePointerCancel('left')}
            onPointerLeave={() => handlePointerCancel('left')}
            aria-label="Move Left"
          >
            <ArrowLeft className="w-7 h-7 pointer-events-none" />
          </button>
          <button
            type="button"
            className={`${btnBase} w-16 h-16 rounded-2xl bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700 active:bg-sky-600 active:border-sky-400`}
            onPointerDown={(e) => handlePointerDown('right', e)}
            onPointerUp={(e) => handlePointerUp('right', e)}
            onPointerCancel={() => handlePointerCancel('right')}
            onPointerLeave={() => handlePointerCancel('right')}
            aria-label="Move Right"
          >
            <ArrowRight className="w-7 h-7 pointer-events-none" />
          </button>
        </div>

        {/* Center: Sprint Toggle Button */}
        <button
          type="button"
          className={`${btnBase} w-14 h-14 rounded-2xl bg-amber-950/70 border-amber-600/60 text-amber-300 hover:bg-amber-900/80 active:bg-amber-600 active:text-white`}
          onPointerDown={(e) => handlePointerDown('sprint', e)}
          onPointerUp={(e) => handlePointerUp('sprint', e)}
          onPointerCancel={() => handlePointerCancel('sprint')}
          onPointerLeave={() => handlePointerCancel('sprint')}
          aria-label="Sprint"
        >
          <div className="flex flex-col items-center pointer-events-none">
            <Zap className="w-5 h-5" />
            <span className="text-[9px] font-pixel">RUN</span>
          </div>
        </button>

        {/* Action Cluster: Attack & Jump */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`${btnBase} w-14 h-14 rounded-2xl bg-indigo-950/80 border-indigo-500/70 text-indigo-200 hover:bg-indigo-900 active:bg-indigo-600 active:text-white`}
            onPointerDown={(e) => handlePointerDown('attack', e)}
            onPointerUp={(e) => handlePointerUp('attack', e)}
            onPointerCancel={() => handlePointerCancel('attack')}
            onPointerLeave={() => handlePointerCancel('attack')}
            aria-label="Attack Staff"
          >
            <div className="flex flex-col items-center pointer-events-none">
              <Sparkles className="w-5 h-5" />
              <span className="text-[9px] font-pixel">HIT</span>
            </div>
          </button>
          <button
            type="button"
            className={`${btnBase} w-16 h-16 rounded-2xl bg-emerald-950/80 border-emerald-500/70 text-emerald-200 hover:bg-emerald-900 active:bg-emerald-600 active:text-white`}
            onPointerDown={(e) => handlePointerDown('jump', e)}
            onPointerUp={(e) => handlePointerUp('jump', e)}
            onPointerCancel={() => handlePointerCancel('jump')}
            onPointerLeave={() => handlePointerCancel('jump')}
            aria-label="Jump"
          >
            <div className="flex flex-col items-center pointer-events-none">
              <ArrowUp className="w-7 h-7" />
              <span className="text-[9px] font-pixel">JUMP</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Landscape mode: Floating ergonomic touch controls overlaying canvas bottom corners
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex justify-between items-end p-4 pb-6 no-touch-callout">
      {/* Bottom Left: Directional Buttons */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          type="button"
          className={`${btnBase} w-16 h-16 rounded-full bg-slate-900/80 backdrop-blur-sm border-slate-600/70 text-white active:bg-sky-600 active:border-sky-400`}
          onPointerDown={(e) => handlePointerDown('left', e)}
          onPointerUp={(e) => handlePointerUp('left', e)}
          onPointerCancel={() => handlePointerCancel('left')}
          onPointerLeave={() => handlePointerCancel('left')}
          aria-label="Left"
        >
          <ArrowLeft className="w-7 h-7 pointer-events-none" />
        </button>
        <button
          type="button"
          className={`${btnBase} w-16 h-16 rounded-full bg-slate-900/80 backdrop-blur-sm border-slate-600/70 text-white active:bg-sky-600 active:border-sky-400`}
          onPointerDown={(e) => handlePointerDown('right', e)}
          onPointerUp={(e) => handlePointerUp('right', e)}
          onPointerCancel={() => handlePointerCancel('right')}
          onPointerLeave={() => handlePointerCancel('right')}
          aria-label="Right"
        >
          <ArrowRight className="w-7 h-7 pointer-events-none" />
        </button>
      </div>

      {/* Bottom Right: Action Cluster (Sprint, Staff Attack, Jump) */}
      <div className="pointer-events-auto flex items-end gap-3">
        <button
          type="button"
          className={`${btnBase} w-12 h-12 rounded-full bg-amber-950/80 backdrop-blur-sm border-amber-500/70 text-amber-300 active:bg-amber-600 active:text-white`}
          onPointerDown={(e) => handlePointerDown('sprint', e)}
          onPointerUp={(e) => handlePointerUp('sprint', e)}
          onPointerCancel={() => handlePointerCancel('sprint')}
          onPointerLeave={() => handlePointerCancel('sprint')}
          aria-label="Sprint"
        >
          <Zap className="w-5 h-5 pointer-events-none" />
        </button>

        <button
          type="button"
          className={`${btnBase} w-14 h-14 rounded-full bg-indigo-950/80 backdrop-blur-sm border-indigo-500/70 text-indigo-300 active:bg-indigo-600 active:text-white`}
          onPointerDown={(e) => handlePointerDown('attack', e)}
          onPointerUp={(e) => handlePointerUp('attack', e)}
          onPointerCancel={() => handlePointerCancel('attack')}
          onPointerLeave={() => handlePointerCancel('attack')}
          aria-label="Attack"
        >
          <div className="flex flex-col items-center pointer-events-none">
            <Sparkles className="w-4 h-4" />
            <span className="text-[8px] font-pixel">X</span>
          </div>
        </button>

        <button
          type="button"
          className={`${btnBase} w-16 h-16 rounded-full bg-emerald-950/85 backdrop-blur-sm border-emerald-500/70 text-emerald-300 active:bg-emerald-600 active:text-white`}
          onPointerDown={(e) => handlePointerDown('jump', e)}
          onPointerUp={(e) => handlePointerUp('jump', e)}
          onPointerCancel={() => handlePointerCancel('jump')}
          onPointerLeave={() => handlePointerCancel('jump')}
          aria-label="Jump"
        >
          <div className="flex flex-col items-center pointer-events-none">
            <ArrowUp className="w-6 h-6" />
            <span className="text-[8px] font-pixel">A</span>
          </div>
        </button>
      </div>
    </div>
  );
};
