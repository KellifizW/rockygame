import React, { useState } from 'react';
import { CharacterClass } from '../game/types';
import { CLASSES } from '../game/classes';

interface CharacterSelectProps {
  onSelect: (classId: string) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, onBack }) => {
  const [selectedId, setSelectedId] = useState<string>(CLASSES[0].id);
  const selected = CLASSES.find((c) => c.id === selectedId) ?? CLASSES[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-[#020617] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-5xl">
        <div className="text-center">
          <h2 className="font-pixel text-lg sm:text-2xl text-amber-400 tracking-wide drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            CHOOSE YOUR HERO
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2">four distinct classes · four ways to survive the depths</p>
        </div>

        {/* Class cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          {CLASSES.map((cls: CharacterClass) => {
            const isSelected = cls.id === selectedId;
            return (
              <button
                key={cls.id}
                onClick={() => setSelectedId(cls.id)}
                className={`flex flex-col items-center gap-2 p-3 border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-slate-900/90 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
                }`}
              >
                <div className="relative w-full aspect-square bg-slate-950 border border-slate-800 overflow-hidden">
                  <img src={cls.avatarUrl} alt={cls.name} className="w-full h-full object-cover pixelated" referrerPolicy="no-referrer" />
                  <div className={`absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold uppercase tracking-widest bg-black/80 py-0.5 ${cls.color}`}>
                    {cls.name}
                  </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-1 text-[9px] text-slate-400 uppercase tracking-wider">
                  <span>❤️ {cls.hp} HP</span>
                  <span>🛡️ {cls.ac} AC</span>
                  <span>⚔️ 1d{cls.damageDie}+{cls.damageMod}</span>
                  <span>🎯 +{cls.attackMod}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected class detail */}
        <div className="w-full bg-slate-900/90 border-2 border-slate-700 p-5 flex flex-col sm:flex-row gap-5">
          <div className="shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:w-48">
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-slate-950 border-2 border-amber-500 overflow-hidden">
              <img src={selected.avatarUrl} alt={selected.name} className="w-full h-full object-cover pixelated" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className={`font-bold uppercase tracking-wide text-sm ${selected.color}`}>{selected.name}</div>
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{selected.title}</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3 text-xs text-slate-300">
            <p className="text-slate-400 italic">“{selected.description}”</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-black/40 border border-slate-800 p-3">
                <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-1">
                  ✦ {selected.special.name} <span className="text-slate-500">({selected.special.usesPerCombat}×)</span>
                </div>
                <p className="text-[11px] text-slate-400">{selected.special.description}</p>
              </div>
              <div className="bg-black/40 border border-slate-800 p-3">
                <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold mb-1">◆ {selected.passive.name}</div>
                <p className="text-[11px] text-slate-400">{selected.passive.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full max-w-md">
          <button
            onClick={onBack}
            className="flex-1 bg-slate-800/60 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 font-bold uppercase tracking-[0.2em] py-3 px-6 transition-all cursor-pointer"
          >
            ◀ Back
          </button>
          <button
            onClick={() => onSelect(selected.id)}
            className="flex-1 bg-amber-500/10 border-2 border-amber-500 text-amber-500 hover:bg-amber-500/20 font-bold uppercase tracking-[0.2em] py-3 px-6 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all cursor-pointer"
          >
            Begin Run ▶
          </button>
        </div>
      </div>
    </div>
  );
};
