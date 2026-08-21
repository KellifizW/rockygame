import React from 'react';
import { Player } from '../game/types';
import { FINAL_FLOOR } from '../game/engine';

interface ShopItemDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  canBuy: (player: Player) => boolean;
}

const SHOP_ITEMS: ShopItemDef[] = [
  { id: 'potion', name: 'Healing Draught', description: '+1 potion (heals 2d4+2 in combat)', cost: 25, icon: '🧪', canBuy: (p) => p.potions < 9 },
  { id: 'whetstone', name: 'Whetstone', description: '+1 damage on all strikes', cost: 40, icon: '⚔️', canBuy: () => true },
  { id: 'armor', name: 'Armor Plating', description: '+1 armor class', cost: 40, icon: '🛡️', canBuy: () => true },
  { id: 'rest', name: 'Rest & Recover', description: 'Restore full health', cost: 30, icon: '❤️', canBuy: (p) => p.hp < p.maxHp },
];

interface ShopScreenProps {
  player: Player;
  floor: number;
  onBuy: (itemId: string) => void;
  onContinue: () => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ player, floor, onBuy, onContinue }) => {
  const isBossFloorNext = floor === FINAL_FLOOR;

  return (
    <div className="flex-1 flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/10 to-[#020617] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl max-h-full overflow-y-auto scrollbar-hide">
        <div className="text-center">
          <h2 className="font-pixel text-xl sm:text-2xl text-amber-400 tracking-wide drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
            THE WANDERING MERCHANT
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2">
            {isBossFloorNext ? 'the final descent awaits below' : `a brief respite before floor ${floor + 1}`}
          </p>
        </div>

        {/* Gold balance */}
        <div className="bg-black/50 border-2 border-amber-500/40 px-6 py-2 flex items-center gap-2 text-amber-400 font-bold tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <span>🪙</span>
          <span>{player.gold} GOLD</span>
        </div>

        {/* Items */}
        <div className="grid sm:grid-cols-2 gap-3 w-full">
          {SHOP_ITEMS.map((item) => {
            const affordable = player.gold >= item.cost;
            const buyable = item.canBuy(player) && affordable;
            return (
              <div
                key={item.id}
                className={`bg-slate-900/80 border-2 p-4 flex flex-col gap-2 ${
                  buyable ? 'border-slate-700' : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-bold text-slate-100 uppercase tracking-wider">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">🪙 {item.cost}</span>
                </div>
                <p className="text-[11px] text-slate-400">{item.description}</p>
                <button
                  onClick={() => onBuy(item.id)}
                  disabled={!buyable}
                  className="mt-1 bg-amber-500/10 border-2 border-amber-500/60 text-amber-400 hover:bg-amber-500/20 font-bold uppercase tracking-[0.2em] py-2 px-4 text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-amber-500/10"
                >
                  Buy
                </button>
              </div>
            );
          })}
        </div>

        {/* Continue */}
        <button
          onClick={onContinue}
          className="w-full max-w-xs bg-emerald-600/20 border-2 border-emerald-500 text-emerald-300 hover:bg-emerald-600/40 font-bold uppercase tracking-[0.2em] py-3 px-6 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all cursor-pointer"
        >
          {isBossFloorNext ? 'Enter the Lair ▶' : 'Descend Deeper ▶'}
        </button>
      </div>
    </div>
  );
};
