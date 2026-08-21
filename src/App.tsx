import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, MapData, Position, Player, Entity, TileType, CombatState } from './game/types';
import { generateMap, updateFOV, generateEnemies, rollDice } from './game/engine';
import { MapRenderer } from './components/MapRenderer';
import { CombatScreen } from './components/CombatScreen';
import pigWarriorImg from './assets/images/armored_pig_warrior_icon_1786809729807.jpg';

const FOV_RADIUS = 5;

const initialPlayer: Player = {
  id: 'player',
  pos: { x: 0, y: 0 },
  name: 'Sir Oinklot',
  characterClass: 'Armored Pig Warrior',
  title: 'Porcine Vanguard Knight',
  avatarUrl: pigWarriorImg,
  hp: 24,
  maxHp: 24,
  ac: 15,
  attackMod: 5,
  damageDie: 8,
  damageMod: 3,
  icon: '@',
  color: 'text-pink-400',
  level: 1,
  xp: 0,
  xpToNext: 12,
  potions: 3,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [floor, setFloor] = useState(1);
  const [map, setMap] = useState<MapData | null>(null);
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [enemies, setEnemies] = useState<Entity[]>([]);
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  
  // Ref for auto-scrolling log
  const combatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (combatState && document.getElementById('combat-log')) {
      const logEl = document.getElementById('combat-log');
      if (logEl) {
        logEl.scrollTop = logEl.scrollHeight;
      }
    }
  }, [combatState?.log]);

  const startNewGame = () => {
    setFloor(1);
    const newPlayer = { ...initialPlayer };
    setPlayer(newPlayer);
    initFloor(1, newPlayer);
    setGameState(GameState.EXPLORING);
  };

  const initFloor = (level: number, currentPlayer: Player) => {
    const { map: newMap, startPos } = generateMap(30, 20);
    const newEnemies = generateEnemies(newMap, level);
    updateFOV(newMap, startPos, FOV_RADIUS);
    
    setMap(newMap);
    setPlayer(prev => ({ ...prev, pos: startPos }));
    setEnemies(newEnemies);
  };

  const nextFloor = () => {
    const nextLevel = floor + 1;
    setFloor(nextLevel);
    initFloor(nextLevel, player);
    
    // Heal slightly on floor clear
    setPlayer(prev => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + 5),
    }));
  };

  const startCombat = (enemy: Entity) => {
    setGameState(GameState.COMBAT);
    setCombatState({
      enemy,
      log: [`You encounter a ${enemy.name}!`],
      playerTurn: true,
    });
  };

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== GameState.EXPLORING || !map) return;

    const newX = player.pos.x + dx;
    const newY = player.pos.y + dy;

    if (newX < 0 || newX >= map.width || newY < 0 || newY >= map.height) return;

    const tile = map.tiles[newY][newX];
    if (tile === TileType.WALL) return;

    const enemy = enemies.find(e => e.pos.x === newX && e.pos.y === newY);
    if (enemy) {
      startCombat(enemy);
      return;
    }

    if (tile === TileType.STAIRS_DOWN) {
      nextFloor();
      return;
    }

    setPlayer(prev => {
      const nextPos = { x: newX, y: newY };
      const newMap = { ...map };
      updateFOV(newMap, nextPos, FOV_RADIUS);
      setMap(newMap);
      return { ...prev, pos: nextPos };
    });
  }, [gameState, map, player, enemies, floor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== GameState.EXPLORING) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, gameState]);

  // COMBAT LOGIC
  const attackEnemy = () => {
    if (!combatState || !combatState.playerTurn) return;

    const currentEnemy = combatState.enemy;
    const attackRoll = rollDice(20) + player.attackMod;
    const isHit = attackRoll >= currentEnemy.ac;
    let newLog = [...combatState.log, `You roll ${attackRoll} to hit AC ${currentEnemy.ac}.`];
    
    let enemyDied = false;
    let newEnemyHp = currentEnemy.hp;

    if (isHit) {
      const damage = rollDice(player.damageDie) + player.damageMod;
      newLog.push(`Hit! You deal ${damage} damage to ${currentEnemy.name}.`);
      newEnemyHp = Math.max(0, currentEnemy.hp - damage);
      if (newEnemyHp <= 0) {
        enemyDied = true;
      }
    } else {
      newLog.push(`Miss!`);
    }

    const updatedEnemy: Entity = { ...currentEnemy, hp: newEnemyHp };

    // Update the enemy in the map entities list as well
    setEnemies(prev => prev.map(e => e.id === updatedEnemy.id ? updatedEnemy : e));

    if (enemyDied) {
      newLog.push(`You defeated the ${currentEnemy.name}!`);
      // Gain XP
      const xpGained = Math.floor(currentEnemy.maxHp * 1.5);
      newLog.push(`Gained ${xpGained} XP.`);
      
      let newPlayer = { ...player };
      newPlayer.xp += xpGained;
      if (newPlayer.xp >= newPlayer.xpToNext) {
        newPlayer.level += 1;
        newPlayer.maxHp += rollDice(10) + 2;
        newPlayer.hp = newPlayer.maxHp;
        newPlayer.attackMod += 1;
        newPlayer.xpToNext = Math.floor(newPlayer.xpToNext * 1.5);
        newLog.push(`LEVEL UP! You are now level ${newPlayer.level}.`);
      }

      setCombatState({ ...combatState, enemy: updatedEnemy, log: newLog, playerTurn: false });
      
      setTimeout(() => {
        setEnemies(prev => prev.filter(e => e.id !== updatedEnemy.id));
        setPlayer(newPlayer);
        setGameState(GameState.EXPLORING);
        setCombatState(null);
      }, 2000);

    } else {
      setCombatState({ ...combatState, enemy: updatedEnemy, log: newLog, playerTurn: false });
      
      // Enemy Turn
      setTimeout(() => {
        enemyTurn(updatedEnemy, newLog);
      }, 1000);
    }
  };

  const enemyTurn = (enemyData: Entity, currentLog: string[]) => {
    setPlayer(prevPlayer => {
      const attackRoll = rollDice(20) + enemyData.attackMod;
      const isHit = attackRoll >= prevPlayer.ac;
      let newLog = [...currentLog, `${enemyData.name} rolls ${attackRoll} to hit AC ${prevPlayer.ac}.`];
      
      let newHp = prevPlayer.hp;

      if (isHit) {
        const damage = rollDice(enemyData.damageDie) + enemyData.damageMod;
        newLog.push(`${enemyData.name} hits you for ${damage} damage!`);
        newHp = Math.max(0, prevPlayer.hp - damage);
      } else {
        newLog.push(`${enemyData.name} misses!`);
      }

      if (newHp <= 0) {
        setCombatState(prev => prev ? { ...prev, enemy: enemyData, log: newLog, playerTurn: false } : null);
        setTimeout(() => {
          setGameState(GameState.GAME_OVER);
        }, 2000);
        return { ...prevPlayer, hp: 0 };
      } else {
        setCombatState(prev => prev ? { ...prev, enemy: enemyData, log: newLog, playerTurn: true } : null);
        return { ...prevPlayer, hp: newHp };
      }
    });
  };

  const healPlayer = () => {
    if (!combatState || !combatState.playerTurn || player.potions <= 0) return;
    
    const healAmount = rollDice(4, 2) + 2; // 2d4+2
    const currentEnemy = combatState.enemy;
    const newHp = Math.min(player.maxHp, player.hp + healAmount);
    const newLog = [...combatState.log, `You drink a potion and heal for ${healAmount} HP.`];
    
    setPlayer({ ...player, hp: newHp, potions: player.potions - 1 });
    setCombatState({ ...combatState, log: newLog, playerTurn: false });

    setTimeout(() => {
      enemyTurn(currentEnemy, newLog);
    }, 1000);
  };

  const fleeCombat = () => {
    if (!combatState || !combatState.playerTurn) return;
    const currentEnemy = combatState.enemy;
    const fleeChance = Math.random();
    let newLog = [...combatState.log, `You attempt to flee...`];
    
    if (fleeChance > 0.5) {
      newLog.push(`Success! You got away.`);
      setCombatState({ ...combatState, log: newLog, playerTurn: false });
      setTimeout(() => {
        setGameState(GameState.EXPLORING);
        setCombatState(null);
      }, 1500);
    } else {
      newLog.push(`Failed! The ${currentEnemy.name} blocks your path.`);
      setCombatState({ ...combatState, log: newLog, playerTurn: false });
      setTimeout(() => {
        enemyTurn(currentEnemy, newLog);
      }, 1000);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#050507] text-[#e2e8f0] font-mono overflow-hidden relative select-none">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <header className="h-14 border-b-4 border-[#1e293b] bg-[#0f172a] flex shrink-0 items-center justify-between px-4 sm:px-6 z-10">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 border-2 border-white shadow-[0_0_10px_rgba(245,158,11,0.5)] hidden sm:block"></div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tighter text-amber-500">PIXEL CRAWLER // v1.0.0</h1>
        </div>
        <div className="flex gap-4 sm:gap-8 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Location</span>
            <span className="text-slate-200 uppercase font-bold text-xs">Floor {floor}</span>
          </div>
          {(gameState === GameState.EXPLORING || gameState === GameState.COMBAT) && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Status</span>
              <span className="text-amber-400 font-bold text-xs">{player.hp > 0 ? 'ACTIVE' : 'CRITICAL'}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden z-10">
        {gameState === GameState.START && (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] p-6 relative">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-[#020617] pointer-events-none"></div>
             
             {/* Character Dossier Card */}
             <div className="bg-slate-900/90 border-2 border-pink-500/50 p-6 max-w-md w-full flex flex-col items-center gap-5 shadow-[0_0_30px_rgba(244,114,182,0.2)] z-10 relative">
               <div className="text-center">
                 <span className="text-[10px] text-pink-400 font-bold uppercase tracking-[0.25em]">Operative Dossier</span>
                 <h2 className="text-xl font-bold uppercase tracking-wider text-slate-100 mt-1">{initialPlayer.name}</h2>
                 <p className="text-xs text-amber-400 font-bold tracking-widest">{initialPlayer.characterClass} // {initialPlayer.title}</p>
               </div>

               <div className="relative w-28 h-28 bg-slate-950 border-2 border-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.4)] overflow-hidden">
                 <img 
                   src={pigWarriorImg} 
                   alt="Armored Pig Warrior Protagonist" 
                   className="w-full h-full object-cover pixelated"
                   referrerPolicy="no-referrer"
                 />
                 <div className="absolute bottom-0 right-0 bg-pink-600 text-[9px] font-bold px-1.5 py-0.5 text-white">
                   LVL 1
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-2 w-full text-[11px] bg-black/50 p-3 border border-slate-800">
                 <div className="flex justify-between text-slate-400"><span>Integrity:</span><span className="text-green-400 font-bold">24 HP</span></div>
                 <div className="flex justify-between text-slate-400"><span>Armor Class:</span><span className="text-blue-400 font-bold">15 AC</span></div>
                 <div className="flex justify-between text-slate-400"><span>Main Weapon:</span><span className="text-amber-400 font-bold">Pig Iron Blade (1d8+3)</span></div>
                 <div className="flex justify-between text-slate-400"><span>Elixirs:</span><span className="text-purple-400 font-bold">3 Potions</span></div>
               </div>

               <button 
                 onClick={startNewGame}
                 className="w-full bg-amber-500/10 border-2 border-amber-500 text-amber-500 hover:bg-amber-500/20 font-bold uppercase tracking-widest py-3 px-6 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all relative overflow-hidden group cursor-pointer"
               >
                 <span className="relative z-10">Initialize Dungeon Run</span>
                 <div className="absolute inset-0 bg-amber-500/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
               </button>
             </div>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#020617] gap-6 relative">
             <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none"></div>
             <div className="text-4xl sm:text-6xl text-red-600 font-bold tracking-tighter drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] z-10">CRITICAL FAILURE</div>
             <div className="text-lg text-slate-400 tracking-widest uppercase z-10">Depth Reached: {floor}</div>
             <button 
               onClick={startNewGame}
               className="bg-red-900/20 border-2 border-red-500 text-red-400 hover:bg-red-900/40 font-bold uppercase tracking-widest py-3 px-8 shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all mt-4 z-10"
             >
               Restart Sequence
             </button>
          </div>
        )}

        {(gameState === GameState.EXPLORING || gameState === GameState.COMBAT) && map && (
          <div className="flex-1 flex flex-col lg:flex-row w-full h-full overflow-hidden">
            
            <section className="flex-1 relative bg-[#020617] border-b lg:border-b-0 lg:border-r-4 border-[#1e293b] flex flex-col items-center justify-center p-4 overflow-hidden">
               {gameState === GameState.COMBAT && (
                 <div className="absolute top-4 left-4 bg-red-950/40 border border-red-500/50 px-3 py-1 text-xs text-red-400 uppercase tracking-widest z-20 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                   Combat Mode: Active
                 </div>
               )}
               
               <div className="relative w-full max-w-2xl h-full flex items-center justify-center min-h-[300px]">
                 <div className="bg-slate-900/20 p-2 border-2 border-slate-800 shadow-inner max-w-full max-h-full overflow-auto scrollbar-hide flex items-center justify-center">
                    <MapRenderer map={map} player={player} enemies={enemies} />
                 </div>
                 {gameState === GameState.COMBAT && combatState && (
                    <CombatScreen 
                      player={player} 
                      combatState={combatState} 
                      onAttack={attackEnemy}
                      onHeal={healPlayer}
                      onFlee={fleeCombat}
                    />
                 )}
               </div>
            </section>

            <aside className="w-full lg:w-80 flex flex-col bg-[#0f172a] shrink-0 overflow-y-auto">
               <div className="p-4 border-b-2 border-[#1e293b]">
                 <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Entity Status</h3>
                 <div className="bg-slate-900 p-3 border-l-4 border-pink-500 space-y-3 shadow-lg">
                   
                   {/* Protagonist Portrait & Header */}
                   <div className="flex items-center gap-3 bg-black/40 p-2 border border-slate-800">
                     <div className="relative w-14 h-14 shrink-0 bg-slate-950 border-2 border-pink-500 shadow-[0_0_12px_rgba(244,114,182,0.5)] overflow-hidden">
                       <img 
                         src={player.avatarUrl || pigWarriorImg} 
                         alt="Armored Pig Warrior Protagonist" 
                         className="w-full h-full object-cover pixelated"
                         referrerPolicy="no-referrer"
                       />
                       <div className="absolute bottom-0 right-0 bg-pink-600 text-[8px] font-bold px-1 text-white leading-tight">
                         LV.{player.level}
                       </div>
                     </div>
                     
                     <div className="flex flex-col min-w-0 flex-1">
                       <div className="flex justify-between items-center">
                         <span className="font-bold uppercase tracking-wide text-slate-100 text-xs truncate">{player.name}</span>
                       </div>
                       <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{player.characterClass}</span>
                       <span className="text-[9px] text-slate-400 truncate">{player.title}</span>
                     </div>
                   </div>
                   
                   <div>
                     <div className="flex justify-between text-[10px] text-slate-400 mb-1 uppercase tracking-widest">
                       <span>Integrity (HP)</span>
                       <span className="text-green-400 font-bold">{player.hp}/{player.maxHp}</span>
                     </div>
                     <div className="w-full h-2 bg-slate-800 border border-slate-700/50">
                       <div className="h-full bg-gradient-to-r from-emerald-600 to-green-400 transition-all duration-300" style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}></div>
                     </div>
                   </div>

                   <div>
                     <div className="flex justify-between text-[10px] text-slate-400 mb-1 uppercase tracking-widest">
                       <span>Experience (XP)</span>
                       <span className="text-blue-400 font-bold">{player.xp}/{player.xpToNext}</span>
                     </div>
                     <div className="w-full h-1.5 bg-slate-800 border border-slate-700/50">
                       <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300" style={{ width: `${Math.max(0, (player.xp / player.xpToNext) * 100)}%` }}></div>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs pt-3 border-t border-slate-800 mt-2 bg-slate-950/30 p-2">
                      <div className="flex flex-col"><span className="text-[9px] text-slate-500 uppercase tracking-widest">Armor Class</span><span className="text-slate-200 font-bold flex items-center gap-1"><span className="text-blue-400">🛡️</span> {player.ac} AC</span></div>
                      <div className="flex flex-col"><span className="text-[9px] text-slate-500 uppercase tracking-widest">Base Strike</span><span className="text-slate-200 font-bold flex items-center gap-1"><span className="text-amber-400">⚔️</span> 1d{player.damageDie}+{player.damageMod}</span></div>
                      <div className="flex flex-col"><span className="text-[9px] text-slate-500 uppercase tracking-widest">Attack Roll</span><span className="text-slate-200 font-bold">+{player.attackMod} d20</span></div>
                      <div className="flex flex-col"><span className="text-[9px] text-slate-500 uppercase tracking-widest">Elixirs</span><span className="text-purple-400 font-bold flex items-center gap-1"><span>🧪</span> {player.potions} Left</span></div>
                   </div>
                 </div>
               </div>

               <div className="p-4 flex-1">
                 <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Tactical Legend</h3>
                 <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 border-2 border-slate-800 p-3 shadow-inner">
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-blue-600 border border-blue-400 flex items-center justify-center text-[10px] shadow-[0_0_8px_rgba(37,99,235,0.6)] text-white">@</div><span className="text-slate-300">You</span></div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-yellow-900/50 border border-yellow-500 text-yellow-500 flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(234,179,8,0.3)]">&gt;</div><span className="text-slate-300">Stairs</span></div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-red-900/80 border border-red-500 text-red-400 flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(239,68,68,0.4)]">g</div><span className="text-slate-300">Goblin</span></div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-slate-700 border border-slate-400 text-slate-200 flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(148,163,184,0.4)]">s</div><span className="text-slate-300">Skeleton</span></div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-green-900 border border-green-500 text-green-400 flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(34,197,94,0.4)]">O</div><span className="text-slate-300">Orc</span></div>
                 </div>
               </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
