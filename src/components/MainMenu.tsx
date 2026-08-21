import React from 'react';

interface MainMenuProps {
  hasSave: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  onHelp: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ hasSave, onNewGame, onContinue, onHelp }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-transparent to-[#020617] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)' }}></div>

      <div className="relative z-10 flex flex-col items-center gap-10 w-full max-w-xl">
        {/* Title block */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.4em] animate-pulse">
            ⌁ a procedurally generated roguelike ⌁
          </div>
          <h1 className="font-pixel text-3xl sm:text-5xl leading-tight text-amber-400 drop-shadow-[0_0_18px_rgba(245,158,11,0.6)] tracking-wide">
            PIXEL
          </h1>
          <h1 className="font-pixel text-3xl sm:text-5xl leading-tight text-slate-100 drop-shadow-[0_0_18px_rgba(226,232,240,0.4)] tracking-wide">
            DUNGEON
          </h1>
          <h1 className="font-pixel text-3xl sm:text-5xl leading-tight text-pink-400 drop-shadow-[0_0_18px_rgba(244,114,182,0.6)] tracking-wide">
            CRAWLER
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 tracking-widest max-w-md">
            Descend the depths, slay monsters, hoard gold, and slay the Emberwyrm.
          </p>
        </div>

        {/* Menu buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={onNewGame}
            className="group relative w-full bg-amber-500/10 border-2 border-amber-500 text-amber-500 hover:bg-amber-500/20 font-bold uppercase tracking-[0.2em] py-4 px-6 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_28px_rgba(245,158,11,0.5)] transition-all cursor-pointer overflow-hidden"
          >
            <span className="relative z-10">▶ New Game</span>
            <div className="absolute inset-0 bg-amber-500/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          </button>

          <button
            onClick={onContinue}
            disabled={!hasSave}
            className="group relative w-full bg-slate-700/20 border-2 border-slate-500 text-slate-200 hover:bg-slate-600/30 font-bold uppercase tracking-[0.2em] py-4 px-6 shadow-[0_0_10px_rgba(100,116,139,0.2)] hover:shadow-[0_0_20px_rgba(100,116,139,0.4)] transition-all cursor-pointer overflow-hidden disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-700/20 disabled:hover:shadow-[0_0_10px_rgba(100,116,139,0.2)]"
          >
            <span className="relative z-10">↻ Continue Run</span>
          </button>

          <button
            onClick={onHelp}
            className="group relative w-full bg-blue-900/20 border-2 border-blue-500/60 text-blue-300 hover:bg-blue-900/40 font-bold uppercase tracking-[0.2em] py-4 px-6 shadow-[0_0_10px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all cursor-pointer overflow-hidden"
          >
            <span className="relative z-10">? How to Play</span>
          </button>
        </div>

        <div className="flex flex-col items-center gap-1 text-[10px] text-slate-600 uppercase tracking-[0.3em]">
          <span>v1.1.0 — a turn-based dungeon crawler</span>
          <span>WASD / Arrow Keys to move · click to act</span>
        </div>
      </div>
    </div>
  );
};
