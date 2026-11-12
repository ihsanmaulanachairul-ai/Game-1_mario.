import React from 'react';
import { X, Keyboard, Smartphone, Sparkles, ArrowUp, Zap } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-200 shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="font-pixel text-lg sm:text-xl text-sky-400 mb-1">
          HOW TO PLAY
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Guide Pip through Greenfield Crossing and reach the ancient Exit Gate!
        </p>

        {/* Section 1: Keyboard Controls */}
        <div className="mb-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-2.5">
            <Keyboard className="w-4 h-4" />
            <span>DESKTOP CONTROLS</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Move Left / Right</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-200">A / D or ← / →</kbd>
            </div>
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Jump (Hold=High)</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-200">Space / W / ↑</kbd>
            </div>
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Sprint</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-200">Shift</kbd>
            </div>
            <div className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">Staff Attack</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-mono text-slate-200">X / J</kbd>
            </div>
          </div>
        </div>

        {/* Section 2: Mobile Touch Controls */}
        <div className="mb-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 mb-2.5">
            <Smartphone className="w-4 h-4" />
            <span>TOUCH CONTROLS</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            Multi-touch supported! Use the left buttons to steer Pip and right buttons to sprint, swing staff, and jump.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
              <Zap className="w-3 h-3 text-amber-400" /> Sprint
            </span>
            <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
              <Sparkles className="w-3 h-3 text-indigo-400" /> Attack Staff
            </span>
            <span className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
              <ArrowUp className="w-3 h-3 text-emerald-400" /> Variable Jump
            </span>
          </div>
        </div>

        {/* Section 3: Gameplay Tips */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 mb-5 text-xs space-y-1.5 text-slate-300">
          <div className="font-bold text-emerald-300 mb-1">ADVENTURER HINTS</div>
          <p>• <strong className="text-slate-100">Stomp on Enemies:</strong> Jump right onto Slimes and Beetles to bounce high and defeat them!</p>
          <p>• <strong className="text-slate-100">Bump Mystery Crates:</strong> Jump into boxes from underneath or swing your staff to unveil crystals and hearts.</p>
          <p>• <strong className="text-slate-100">Spring Mushrooms:</strong> Step on bouncy red mushrooms for huge vertical boosts to reach sky crystals.</p>
          <p>• <strong className="text-slate-100">Exit Gate:</strong> Walk through the glowing stone arch at the far right to clear the level!</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-pixel text-xs transition cursor-pointer"
        >
          GOT IT, LET'S EXPLORE!
        </button>
      </div>
    </div>
  );
};
