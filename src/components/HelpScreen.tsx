import React from 'react';
import { FINAL_FLOOR } from '../game/engine';

interface HelpScreenProps {
  onBack: () => void;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ onBack }) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-[#020617] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl max-h-full overflow-y-auto scrollbar-hide">
        <h2 className="font-pixel text-xl sm:text-2xl text-blue-400 tracking-wide drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">
          HOW TO PLAY
        </h2>

        <div className="grid sm:grid-cols-2 gap-3 w-full text-xs">
          <section className="bg-slate-900/80 border-2 border-slate-700 p-4">
            <h3 className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2">🎮 Controls</h3>
            <ul className="space-y-1.5 text-slate-300">
              <li><span className="text-slate-100 font-bold">WASD / Arrows</span> — move</li>
              <li><span className="text-slate-100 font-bold">Walk into an enemy</span> — start combat</li>
              <li><span className="text-slate-100 font-bold">Step on ▼ stairs</span> — descend a floor</li>
              <li><span className="text-slate-100 font-bold">Click buttons</span> — attack, special, heal, flee</li>
            </ul>
          </section>

          <section className="bg-slate-900/80 border-2 border-slate-700 p-4">
            <h3 className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2">⚔️ Combat</h3>
            <ul className="space-y-1.5 text-slate-300">
              <li><span className="text-slate-100 font-bold">Strike</span> — roll d20 + ATK vs enemy AC</li>
              <li><span className="text-slate-100 font-bold">Special</span> — your class ability (limited uses)</li>
              <li><span className="text-slate-100 font-bold">Heal</span> — drink a potion (2d4+2 HP)</li>
              <li><span className="text-slate-100 font-bold">Retreat</span> — attempt to flee (random check)</li>
            </ul>
          </section>

          <section className="bg-slate-900/80 border-2 border-slate-700 p-4">
            <h3 className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2">🗺️ Progression</h3>
            <ul className="space-y-1.5 text-slate-300">
              <li><span className="text-slate-100 font-bold">Defeat enemies</span> to gain XP and gold</li>
              <li><span className="text-slate-100 font-bold">Level up</span> for more HP and attack</li>
              <li><span className="text-slate-100 font-bold">Between floors</span>, spend gold at the merchant</li>
              <li><span className="text-slate-100 font-bold">Reach floor {FINAL_FLOOR}</span> and slay the Emberwyrm to win</li>
            </ul>
          </section>

          <section className="bg-slate-900/80 border-2 border-slate-700 p-4">
            <h3 className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-2">💀 Survival</h3>
            <ul className="space-y-1.5 text-slate-300">
              <li><span className="text-slate-100 font-bold">Fog of war</span> hides unexplored areas</li>
              <li><span className="text-slate-100 font-bold">Monsters scale</span> with each floor</li>
              <li><span className="text-slate-100 font-bold">Potions are scarce</span> — buy more at the shop</li>
              <li><span className="text-slate-100 font-bold">Death is permanent</span> — your run ends at 0 HP</li>
            </ul>
          </section>
        </div>

        <button
          onClick={onBack}
          className="w-full max-w-xs bg-slate-800/60 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 font-bold uppercase tracking-[0.2em] py-3 px-6 transition-all cursor-pointer"
        >
          ◀ Back to Menu
        </button>
      </div>
    </div>
  );
};
