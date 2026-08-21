import React from 'react';
import { Player } from '../game/types';

interface GameOverScreenProps {
  player: Player;
  floor: number;
  onRestart: () => void;
  onMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ player, floor, onRestart, onMenu }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] gap-8 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <div className="text-4xl sm:text-6xl font-pixel text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] tracking-wide">
          YOU DIED
        </div>
        <p className="text-sm text-slate-400 uppercase tracking-[0.3em]">The dungeon claims another hero…</p>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-900/80 border-2 border-slate-700 px-6 py-4">
          <div className="text-2xl font-bold text-red-400">{floor}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Depth Reached</div>
        </div>
        <div className="bg-slate-900/80 border-2 border-slate-700 px-6 py-4">
          <div className="text-2xl font-bold text-red-400">{player.kills}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Monsters Slain</div>
        </div>
        <div className="bg-slate-900/80 border-2 border-slate-700 px-6 py-4">
          <div className="text-2xl font-bold text-red-400">{player.gold}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Gold Lost</div>
        </div>
      </div>

      <div className="relative z-10 flex gap-3 w-full max-w-md">
        <button
          onClick={onRestart}
          className="flex-1 bg-red-900/20 border-2 border-red-500 text-red-400 hover:bg-red-900/40 font-bold uppercase tracking-[0.2em] py-3 px-6 shadow-[0_0_15px_rgba(220,38,38,0.25)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all cursor-pointer"
        >
          Try Again ▶
        </button>
        <button
          onClick={onMenu}
          className="flex-1 bg-slate-800/60 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 font-bold uppercase tracking-[0.2em] py-3 px-6 transition-all cursor-pointer"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};
