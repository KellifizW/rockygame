import React from 'react';
import { Player } from '../game/types';

interface VictoryScreenProps {
  player: Player;
  floor: number;
  onRestart: () => void;
  onMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ player, floor, onRestart, onMenu }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] gap-8 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <div className="text-4xl sm:text-6xl font-pixel text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] tracking-wide">
          VICTORY
        </div>
        <p className="text-sm text-slate-400 uppercase tracking-[0.3em]">The Emberwyrm has fallen. The depths are yours.</p>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-3 text-center">
        <div className="bg-slate-900/80 border-2 border-slate-700 px-6 py-4">
          <div className="text-2xl font-bold text-amber-400">{floor}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Depth Reached</div>
        </div>
        <div className="bg-slate-900/80 border-2 border-slate-700 px-6 py-4">
          <div className="text-2xl font-bold text-amber-400">{player.kills}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Monsters Slain</div>
        </div>
        <div className="bg-slate-900/80 border-2 border-slate-700 px-6 py-4">
          <div className="text-2xl font-bold text-amber-400">{player.gold}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Gold Hoarded</div>
        </div>
      </div>

      <div className="relative z-10 text-center">
        <div className="text-xs text-slate-300 mb-1">
          A run worthy of <span className="text-pink-400 font-bold">{player.name}</span>, the {player.characterClass}.
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest">Level {player.level}</div>
      </div>

      <div className="relative z-10 flex gap-3 w-full max-w-md">
        <button
          onClick={onRestart}
          className="flex-1 bg-amber-500/10 border-2 border-amber-500 text-amber-500 hover:bg-amber-500/20 font-bold uppercase tracking-[0.2em] py-3 px-6 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
        >
          Play Again ▶
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
