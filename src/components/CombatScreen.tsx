import React from 'react';
import { Player, CombatState } from '../game/types';
import pigWarriorImg from '../assets/images/armored_pig_warrior_icon_1786809729807.jpg';

interface CombatScreenProps {
  player: Player;
  combatState: CombatState;
  specialName: string;
  specialUsesLeft: number;
  onAttack: () => void;
  onSpecial: () => void;
  onHeal: () => void;
  onFlee: () => void;
}

export const CombatScreen: React.FC<CombatScreenProps> = ({ 
  player, 
  combatState, 
  specialName,
  specialUsesLeft,
  onAttack, 
  onSpecial, 
  onHeal, 
  onFlee 
}) => {
  const { enemy, log, playerTurn } = combatState;

  const playerHpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  const enemyHpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

  return (
    <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md flex flex-col z-50 overflow-hidden font-mono">
      
      {/* Combat Arena View */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto">
         <div className="bg-slate-900/90 border-2 border-slate-700/80 p-4 sm:p-6 max-w-3xl w-full flex flex-col gap-4 sm:gap-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
           
           {/* Encounter Status Banner */}
           <div className="flex items-center justify-between border-b border-slate-800 pb-3">
             <div className="flex items-center gap-2">
               <span className="w-3 h-3 bg-red-500 rounded-none animate-ping"></span>
               <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-red-400 uppercase">
                 Engaging Target // {enemy.name}
               </span>
             </div>
             <div className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-950 px-2 py-1 border border-slate-800">
               {playerTurn ? <span className="text-pink-400 font-bold animate-pulse">Your Turn (Select Action)</span> : <span className="text-red-400 font-bold">Enemy Response...</span>}
             </div>
           </div>

           {/* Combatant Cards: Protagonist Armored Warrior Pig VS Enemy */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
             
             {/* Player: Armored Pig Warrior */}
             <div className={`flex flex-col bg-slate-950/80 border-2 ${playerTurn ? 'border-pink-500 shadow-[0_0_20px_rgba(244,114,182,0.3)]' : 'border-slate-800'} p-3 sm:p-4 transition-all duration-300 relative`}>
               
               <div className="flex items-center gap-3 mb-3">
                 {/* Armored Pig Warrior Icon/Portrait */}
                 <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-slate-900 border-2 border-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.4)] overflow-hidden">
                   <img 
                     src={player.avatarUrl || pigWarriorImg} 
                     alt="Armored Pig Warrior" 
                     className="w-full h-full object-cover pixelated"
                     referrerPolicy="no-referrer"
                   />
                   <div className="absolute top-0 right-0 bg-pink-600/90 text-[9px] font-bold px-1.5 py-0.5 text-white">
                     LVL {player.level}
                   </div>
                 </div>

                 <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between">
                     <span className="text-pink-400 font-bold uppercase tracking-wider text-sm truncate">{player.name}</span>
                   </div>
                   <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{player.characterClass || 'Armored Pig Warrior'}</div>
                   <div className="text-[9px] text-slate-400 truncate">{player.title || 'Porcine Vanguard Knight'}</div>
                   
                   <div className="mt-2 flex items-center gap-2 text-[10px]">
                     <span className="bg-slate-800 px-1.5 py-0.5 border border-slate-700 text-slate-200">🛡️ {player.ac} AC</span>
                     <span className="bg-slate-800 px-1.5 py-0.5 border border-slate-700 text-slate-200">⚔️ +{player.attackMod}</span>
                     <span className="bg-slate-800 px-1.5 py-0.5 border border-slate-700 text-purple-300">🧪 {player.potions}</span>
                   </div>
                 </div>
               </div>

               {/* Integrity Bar */}
               <div className="mt-auto">
                 <div className="flex justify-between text-[10px] text-slate-400 mb-1 uppercase tracking-widest">
                   <span>Warrior HP</span>
                   <span className="text-green-400 font-bold">{player.hp} / {player.maxHp}</span>
                 </div>
                 <div className="w-full h-3 bg-slate-900 border border-slate-800 overflow-hidden">
                   <div 
                     className="h-full bg-gradient-to-r from-emerald-600 to-green-400 transition-all duration-300"
                     style={{ width: `${playerHpPct}%` }}
                   ></div>
                 </div>
               </div>
             </div>

             {/* Enemy Card */}
             <div className={`flex flex-col bg-slate-950/80 border-2 ${!playerTurn ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-slate-800'} p-3 sm:p-4 transition-all duration-300 relative`}>
               
               <div className="flex items-center gap-3 mb-3">
                 {/* Enemy Portrait */}
                 <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-slate-900 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] overflow-hidden">
                   {enemy.avatarUrl ? (
                     <img 
                       src={enemy.avatarUrl} 
                       alt={enemy.name} 
                       className="w-full h-full object-cover pixelated"
                       referrerPolicy="no-referrer"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-slate-900 text-red-400">
                       {enemy.icon}
                     </div>
                   )}
                   <div className="absolute top-0 right-0 bg-red-700 text-[9px] font-bold px-1.5 py-0.5 text-white">
                     FOE
                   </div>
                 </div>

                 <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between">
                     <span className="text-red-400 font-bold uppercase tracking-wider text-sm truncate">{enemy.name}</span>
                   </div>
                   <div className="text-[10px] text-red-300 font-bold uppercase tracking-wider">{enemy.title || 'Dungeon Threat'}</div>
                   <div className="text-[9px] text-slate-400">Hostile Monster</div>
                   
                   <div className="mt-2 flex items-center gap-2 text-[10px]">
                     <span className="bg-slate-800 px-1.5 py-0.5 border border-slate-700 text-slate-200">🛡️ {enemy.ac} AC</span>
                     <span className="bg-slate-800 px-1.5 py-0.5 border border-slate-700 text-slate-200">⚔️ 1d{enemy.damageDie}+{enemy.damageMod}</span>
                   </div>
                 </div>
               </div>

               {/* Enemy Integrity Bar */}
               <div className="mt-auto">
                 <div className="flex justify-between text-[10px] text-slate-400 mb-1 uppercase tracking-widest">
                   <span>Enemy HP</span>
                   <span className="text-red-400 font-bold">{enemy.hp} / {enemy.maxHp}</span>
                 </div>
                 <div className="w-full h-3 bg-slate-900 border border-slate-800 overflow-hidden">
                   <div 
                     className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
                     style={{ width: `${enemyHpPct}%` }}
                   ></div>
                 </div>
               </div>
             </div>

           </div>
         </div>
      </div>

      {/* Combat Footer Area (Log + Action Buttons) */}
      <footer className="h-44 sm:h-48 shrink-0 bg-[#020617] border-t-4 border-[#1e293b] flex z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex-1 p-3 sm:p-4 border-r-2 border-[#1e293b] bg-black/40 overflow-hidden flex flex-col">
          <div className="text-[10px] uppercase text-slate-500 mb-2 tracking-widest shrink-0">Battle Transmission Log</div>
          <div className="overflow-y-auto space-y-1 text-xs font-mono scrollbar-hide flex-1" id="combat-log">
            {log.map((entry, idx) => {
              let colorClass = 'text-slate-300';
              if (entry.includes('hit AC')) colorClass = 'text-slate-400';
              if (entry.includes('damage') || entry.includes('hits you')) colorClass = 'text-red-400 font-bold';
              if (entry.includes('defeated') || entry.includes('XP') || entry.includes('LEVEL UP')) colorClass = 'text-amber-400 font-bold';
              if (entry.includes('potion') || entry.includes('heal')) colorClass = 'text-green-400';
              if (entry.includes('flee')) colorClass = 'text-yellow-400';
              
              return (
                <p key={idx} className={colorClass}>
                  <span className="text-slate-600 mr-2 opacity-50">[{idx.toString().padStart(2, '0')}]</span>
                  {entry}
                </p>
              );
            })}
          </div>
        </div>
        
        <div className="w-56 sm:w-80 p-3 sm:p-4 grid grid-cols-2 gap-2 bg-[#0f172a] shrink-0">
          <button 
            onClick={onAttack} 
            disabled={!playerTurn}
            className="bg-blue-900/50 border-2 border-blue-500/50 text-blue-200 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-blue-800 hover:border-blue-400 disabled:opacity-30 disabled:hover:bg-blue-900/50 disabled:hover:border-blue-500/50 flex flex-col items-center justify-center p-2 shadow-[0_0_10px_rgba(37,99,235,0.1)] hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Strike</span>
            <span className="text-[8px] opacity-50 mt-0.5">[1d{player.damageDie}+{player.damageMod}]</span>
          </button>
          
          <button 
            onClick={onSpecial} 
            disabled={!playerTurn || specialUsesLeft <= 0}
            className="bg-purple-900/50 border-2 border-purple-500/50 text-purple-200 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-purple-800 hover:border-purple-400 disabled:opacity-30 disabled:hover:bg-purple-900/50 disabled:hover:border-purple-500/50 flex flex-col items-center justify-center p-2 shadow-[0_0_10px_rgba(147,51,234,0.1)] hover:shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <span>{specialName}</span>
            <span className="text-[8px] opacity-50 mt-0.5">[{specialUsesLeft} Left]</span>
          </button>
          
          <button 
            onClick={onHeal} 
            disabled={!playerTurn || player.potions <= 0}
            className="bg-green-900/50 border-2 border-green-500/50 text-green-200 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-green-800 hover:border-green-400 disabled:opacity-30 disabled:hover:bg-green-900/50 disabled:hover:border-green-500/50 flex flex-col items-center justify-center p-2 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Heal</span>
            <span className="text-[8px] opacity-50 mt-0.5">[{player.potions} Left]</span>
          </button>
          
          <button 
            onClick={onFlee} 
            disabled={!playerTurn}
            className="bg-slate-800 border-2 border-slate-600 text-slate-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 disabled:hover:border-slate-600 flex flex-col items-center justify-center p-2 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Retreat</span>
            <span className="text-[8px] opacity-50 mt-0.5">[Evasion Check]</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
