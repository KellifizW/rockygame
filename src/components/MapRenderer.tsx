import React from 'react';
import { MapData, TileType, Entity, Player } from '../game/types';
import pigWarriorImg from '../assets/images/armored_pig_warrior_icon_1786809729807.jpg';

interface MapRendererProps {
  map: MapData;
  player: Player;
  enemies: Entity[];
}

export const MapRenderer: React.FC<MapRendererProps> = ({ map, player, enemies }) => {
  return (
    <div className="flex flex-col items-center justify-center p-2 max-w-full overflow-auto">
      <div 
        className="grid bg-[#020617] border-4 border-[#1e293b] shadow-[0_0_30px_rgba(0,0,0,0.8)] p-1 rounded-sm select-none" 
        style={{ 
          gridTemplateColumns: `repeat(${map.width}, minmax(0, 1fr))`,
          width: 'max-content'
        }}
      >
        {map.tiles.map((row, y) => (
          row.map((tile, x) => {
            const isVisible = map.visible[y][x];
            const isDiscovered = map.discovered[y][x];
            
            // Undiscovered fog of war
            if (!isDiscovered) {
              return (
                <div key={`${x}-${y}`} className="w-6 h-6 sm:w-8 sm:h-8 bg-[#020617] border border-black/40"></div>
              );
            }

            const isPlayerHere = player.pos.x === x && player.pos.y === y;
            const enemyHere = enemies.find(e => e.pos.x === x && e.pos.y === y);

            // Base tile rendering
            let tileBg = 'bg-[#090d16] border border-slate-900/60';
            if (tile === TileType.WALL) {
              tileBg = isVisible 
                ? 'bg-slate-800 border border-slate-700/60 shadow-inner' 
                : 'bg-slate-900/80 border border-slate-800/40 opacity-40';
            } else if (tile === TileType.FLOOR) {
              tileBg = isVisible 
                ? 'bg-[#0b1220] border border-slate-800/40' 
                : 'bg-[#070b14] border border-slate-900/30 opacity-40';
            } else if (tile === TileType.STAIRS_DOWN) {
              tileBg = isVisible 
                ? 'bg-amber-950/60 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]' 
                : 'bg-amber-950/30 border border-amber-900/30 opacity-40';
            }

            return (
              <div 
                key={`${x}-${y}`} 
                className={`w-6 h-6 sm:w-8 sm:h-8 relative flex items-center justify-center transition-all ${tileBg}`}
              >
                {/* Stairs down visual */}
                {tile === TileType.STAIRS_DOWN && !isPlayerHere && (!enemyHere || !isVisible) && (
                  <div className="flex flex-col items-center justify-center text-amber-400 font-mono animate-pulse">
                    <span className="text-[10px] sm:text-xs font-bold leading-none">▼</span>
                    <span className="text-[6px] sm:text-[7px] uppercase font-bold tracking-tighter opacity-80">EXIT</span>
                  </div>
                )}

                {/* Floor subtle center dot */}
                {tile === TileType.FLOOR && isVisible && !isPlayerHere && !enemyHere && (
                  <div className="w-1 h-1 rounded-full bg-slate-700/40"></div>
                )}

                {/* Enemy Pixel Character Sprite */}
                {enemyHere && isVisible && !isPlayerHere && (
                  <div className="relative w-full h-full p-0.5 z-20 flex items-center justify-center">
                    <div className="w-full h-full relative rounded-sm overflow-hidden border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)] bg-slate-950">
                      {enemyHere.avatarUrl ? (
                        <img 
                          src={enemyHere.avatarUrl} 
                          alt={enemyHere.name} 
                          className="w-full h-full object-cover pixelated"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-red-400 text-xs">
                          {enemyHere.icon}
                        </div>
                      )}
                    </div>
                    {/* Small HP bar if damaged */}
                    {enemyHere.hp < enemyHere.maxHp && (
                      <div className="absolute -bottom-0.5 left-0.5 right-0.5 h-1 bg-slate-900 border border-slate-800 overflow-hidden z-30">
                        <div 
                          className="h-full bg-red-500 transition-all" 
                          style={{ width: `${Math.max(0, (enemyHere.hp / enemyHere.maxHp) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Protagonist Armored Pig Warrior Sprite */}
                {isPlayerHere && (
                  <div className="relative w-full h-full p-0.5 z-30 flex items-center justify-center">
                    <div className="w-full h-full relative rounded-sm overflow-hidden border-2 border-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.9)] bg-slate-950 ring-1 ring-pink-300">
                      <img 
                        src={player.avatarUrl || pigWarriorImg} 
                        alt="Armored Pig Warrior" 
                        className="w-full h-full object-cover pixelated scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Mini pulse aura */}
                    <div className="absolute inset-0 rounded-sm bg-pink-500/20 animate-ping pointer-events-none"></div>
                  </div>
                )}
              </div>
            );
          })
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.8)]"></span>
          <span>Protagonist (Armored Pig)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          <span>Hostile Monsters</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
          <span>Dungeon Stairs (▼)</span>
        </div>
      </div>
    </div>
  );
};
