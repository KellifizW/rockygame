import React, { useState, useEffect, useCallback } from 'react';
import {
  GameState,
  MapData,
  Position,
  Player,
  Entity,
  TileType,
  CombatState,
  SaveData,
} from './game/types';
import { generateMap, updateFOV, generateEnemies, rollDice, FINAL_FLOOR, goldFor } from './game/engine';
import { getClass, createPlayer } from './game/classes';
import { MapRenderer } from './components/MapRenderer';
import { CombatScreen } from './components/CombatScreen';
import { MainMenu } from './components/MainMenu';
import { CharacterSelect } from './components/CharacterSelect';
import { HelpScreen } from './components/HelpScreen';
import { ShopScreen } from './components/ShopScreen';
import { VictoryScreen } from './components/VictoryScreen';
import { GameOverScreen } from './components/GameOverScreen';

const FOV_RADIUS = 5;
const SAVE_KEY = 'pixel-dungeon-crawler-save-v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [floor, setFloor] = useState(1);
  const [map, setMap] = useState<MapData | null>(null);
  const [player, setPlayer] = useState<Player>(() => createPlayer('knight'));
  const [enemies, setEnemies] = useState<Entity[]>([]);
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [hasSave, setHasSave] = useState(false);

  const playerClass = getClass(player.classId);

  // Check for an existing save on mount
  useEffect(() => {
    try {
      setHasSave(!!localStorage.getItem(SAVE_KEY));
    } catch {
      setHasSave(false);
    }
  }, []);

  // Auto-scroll the combat log
  useEffect(() => {
    if (combatState && document.getElementById('combat-log')) {
      const logEl = document.getElementById('combat-log');
      if (logEl) {
        logEl.scrollTop = logEl.scrollHeight;
      }
    }
  }, [combatState?.log]);

  // Autosave whenever the run is in a stable state
  useEffect(() => {
    if ((gameState === GameState.EXPLORING || gameState === GameState.SHOP) && map) {
      const data: SaveData = { version: 1, floor, player, map, enemies };
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        setHasSave(true);
      } catch {
        // ignore storage errors
      }
    }
  }, [floor, player, map, enemies, gameState]);

  const clearSave = useCallback(() => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // ignore
    }
    setHasSave(false);
  }, []);

  const initFloor = (level: number, currentPlayer: Player) => {
    const isBossFloor = level >= FINAL_FLOOR;
    const { map: newMap, startPos, stairsPos } = generateMap(30, 20, !isBossFloor);
    const newEnemies = generateEnemies(newMap, level, isBossFloor ? stairsPos : undefined);
    updateFOV(newMap, startPos, FOV_RADIUS);

    setMap(newMap);
    setPlayer((prev) => ({ ...prev, pos: startPos }));
    setEnemies(newEnemies);
  };

  const startNewGame = (classId: string) => {
    const newPlayer = createPlayer(classId);
    setPlayer(newPlayer);
    setFloor(1);
    initFloor(1, newPlayer);
    setCombatState(null);
    setGameState(GameState.EXPLORING);
  };

  const continueGame = () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const data: SaveData = JSON.parse(raw);
      if (data.version !== 1) return;
      setFloor(data.floor);
      setPlayer(data.player);
      setMap(data.map);
      setEnemies(data.enemies);
      setCombatState(null);
      setGameState(GameState.EXPLORING);
    } catch {
      // corrupted save — ignore
    }
  };

  const quitToMenu = () => {
    setCombatState(null);
    setGameState(GameState.MENU);
  };

  const nextFloor = () => {
    const nextLevel = floor + 1;
    setFloor(nextLevel);
    initFloor(nextLevel, player);

    // Heal slightly on floor clear
    setPlayer((prev) => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + 5),
    }));

    setGameState(GameState.SHOP);
  };

  const leaveShop = () => {
    setGameState(GameState.EXPLORING);
  };

  const buyShopItem = (itemId: string) => {
    setPlayer((prev) => {
      const p = { ...prev };
      switch (itemId) {
        case 'potion':
          if (p.potions >= 9 || p.gold < 25) return p;
          p.potions += 1;
          p.gold -= 25;
          break;
        case 'whetstone':
          if (p.gold < 40) return p;
          p.damageMod += 1;
          p.gold -= 40;
          break;
        case 'armor':
          if (p.gold < 40) return p;
          p.ac += 1;
          p.gold -= 40;
          break;
        case 'rest':
          if (p.hp >= p.maxHp || p.gold < 30) return p;
          p.hp = p.maxHp;
          p.gold -= 30;
          break;
      }
      return p;
    });
  };

  const startCombat = (enemy: Entity) => {
    setGameState(GameState.COMBAT);
    setCombatState({
      enemy,
      log: [
        enemy.isBoss
          ? `The ${enemy.name} rises! The final battle begins!`
          : `You encounter a ${enemy.name}!`,
      ],
      playerTurn: true,
      playerSpecialUsesLeft: playerClass.special.usesPerCombat,
      enemyDazed: false,
      playerGuardDown: false,
    });
  };

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (gameState !== GameState.EXPLORING || !map) return;

      const newX = player.pos.x + dx;
      const newY = player.pos.y + dy;

      if (newX < 0 || newX >= map.width || newY < 0 || newY >= map.height) return;

      const tile = map.tiles[newY][newX];
      if (tile === TileType.WALL) return;

      const enemy = enemies.find((e) => e.pos.x === newX && e.pos.y === newY);
      if (enemy) {
        startCombat(enemy);
        return;
      }

      if (tile === TileType.STAIRS_DOWN) {
        nextFloor();
        return;
      }

      setPlayer((prev) => {
        const nextPos = { x: newX, y: newY };
        const newMap = { ...map };
        updateFOV(newMap, nextPos, FOV_RADIUS);
        setMap(newMap);
        return { ...prev, pos: nextPos };
      });
    },
    [gameState, map, player, enemies, floor]
  );

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

  // ---- COMBAT LOGIC ----

  const handleEnemyDefeat = (enemy: Entity, log: string[], cs: CombatState) => {
    const gold = goldFor(enemy, floor);
    const xpGained = Math.floor(enemy.maxHp * 1.5);
    log.push(`You defeated the ${enemy.name}!`);
    log.push(`Gained ${xpGained} XP and ${gold} gold.`);

    let newPlayer = { ...player };
    newPlayer.xp += xpGained;
    newPlayer.gold += gold;
    newPlayer.kills += 1;

    if (newPlayer.xp >= newPlayer.xpToNext) {
      newPlayer.level += 1;
      newPlayer.maxHp += rollDice(10) + 2;
      newPlayer.hp = newPlayer.maxHp;
      newPlayer.attackMod += 1;
      newPlayer.xpToNext = Math.floor(newPlayer.xpToNext * 1.5);
      log.push(`LEVEL UP! You are now level ${newPlayer.level}.`);
    }

    const isBoss = !!enemy.isBoss;
    setCombatState({ ...cs, enemy, log, playerTurn: false });

    setTimeout(() => {
      setEnemies((prev) => prev.filter((e) => e.id !== enemy.id));
      setPlayer(newPlayer);
      setCombatState(null);
      if (isBoss) {
        clearSave();
        setGameState(GameState.VICTORY);
      } else {
        setGameState(GameState.EXPLORING);
      }
    }, 2000);
  };

  const enemyTurn = (
    enemyData: Entity,
    currentLog: string[],
    opts: { enemyDazed: boolean; playerGuardDown: boolean }
  ) => {
    setPlayer((prevPlayer) => {
      const effAc = opts.playerGuardDown ? prevPlayer.ac - 2 : prevPlayer.ac;
      const attackRoll = rollDice(20) + enemyData.attackMod;
      const isHit = attackRoll >= effAc;
      let newLog = [...currentLog, `${enemyData.name} rolls ${attackRoll} to hit AC ${effAc}.`];

      let newHp = prevPlayer.hp;

      if (isHit) {
        const dmgMod = opts.enemyDazed ? enemyData.damageMod - 2 : enemyData.damageMod;
        const damage = Math.max(0, rollDice(enemyData.damageDie) + dmgMod);
        newLog.push(`${enemyData.name} hits you for ${damage} damage!`);
        newHp = Math.max(0, prevPlayer.hp - damage);
      } else {
        newLog.push(`${enemyData.name} misses!`);
      }

      if (newHp <= 0) {
        setCombatState((prev) =>
          prev ? { ...prev, enemy: enemyData, log: newLog, playerTurn: false, enemyDazed: false } : null
        );
        setTimeout(() => {
          clearSave();
          setGameState(GameState.GAME_OVER);
        }, 2000);
        return { ...prevPlayer, hp: 0 };
      } else {
        setCombatState((prev) =>
          prev ? { ...prev, enemy: enemyData, log: newLog, playerTurn: true, enemyDazed: false } : null
        );
        return { ...prevPlayer, hp: newHp };
      }
    });
  };

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
      if (newEnemyHp <= 0) enemyDied = true;
    } else {
      newLog.push(`Miss!`);
    }

    const updatedEnemy: Entity = { ...currentEnemy, hp: newEnemyHp };
    setEnemies((prev) => prev.map((e) => (e.id === updatedEnemy.id ? updatedEnemy : e)));

    if (enemyDied) {
      handleEnemyDefeat(updatedEnemy, newLog, combatState);
    } else {
      setCombatState({ ...combatState, enemy: updatedEnemy, log: newLog, playerTurn: false });
      setTimeout(
        () => enemyTurn(updatedEnemy, newLog, { enemyDazed: combatState.enemyDazed, playerGuardDown: combatState.playerGuardDown }),
        1000
      );
    }
  };

  const useSpecial = () => {
    if (!combatState || !combatState.playerTurn) return;
    if (combatState.playerSpecialUsesLeft <= 0) return;

    const spec = playerClass.special;
    const enemy = combatState.enemy;
    let newLog = [...combatState.log];
    let newEnemyHp = enemy.hp;
    let enemyDazed = combatState.enemyDazed;
    let playerGuardDown = combatState.playerGuardDown;

    switch (spec.id) {
      case 'shield-bash': {
        const dmg = 4 + player.level;
        newLog.push(`${spec.name}! ${dmg} damage — ${enemy.name} is dazed.`);
        newEnemyHp = Math.max(0, enemy.hp - dmg);
        enemyDazed = true;
        break;
      }
      case 'arcane-bolt': {
        const dmg = rollDice(12) + player.level;
        newLog.push(`${spec.name}! ${dmg} damage, ignoring armor!`);
        newEnemyHp = Math.max(0, enemy.hp - dmg);
        break;
      }
      case 'whirlwind': {
        const roll = rollDice(20) + player.attackMod;
        newLog.push(`${spec.name}... you roll ${roll} to hit AC ${enemy.ac}.`);
        if (roll >= enemy.ac) {
          const dmg = rollDice(player.damageDie) + player.damageMod + 4;
          newLog.push(`A massive blow for ${dmg} damage! Your guard drops.`);
          newEnemyHp = Math.max(0, enemy.hp - dmg);
          playerGuardDown = true;
        } else {
          newLog.push(`${spec.name} misses!`);
        }
        break;
      }
      case 'backstab': {
        const r1 = rollDice(20);
        const r2 = rollDice(20);
        const roll = Math.max(r1, r2) + player.attackMod;
        newLog.push(`${spec.name}... you roll ${roll} to hit AC ${enemy.ac} (advantage).`);
        if (roll >= enemy.ac) {
          const dmg = (rollDice(player.damageDie) + player.damageMod) * 2;
          newLog.push(`Critical strike for ${dmg} damage!`);
          newEnemyHp = Math.max(0, enemy.hp - dmg);
        } else {
          newLog.push(`${spec.name} misses!`);
        }
        break;
      }
    }

    const enemyDied = newEnemyHp <= 0;
    const updatedEnemy: Entity = { ...enemy, hp: newEnemyHp };
    const nextUses = combatState.playerSpecialUsesLeft - 1;

    setEnemies((prev) => prev.map((e) => (e.id === updatedEnemy.id ? updatedEnemy : e)));

    const nextCs: CombatState = {
      ...combatState,
      enemy: updatedEnemy,
      log: newLog,
      playerTurn: false,
      playerSpecialUsesLeft: nextUses,
      enemyDazed,
      playerGuardDown,
    };

    if (enemyDied) {
      handleEnemyDefeat(updatedEnemy, newLog, nextCs);
    } else {
      setCombatState(nextCs);
      setTimeout(() => enemyTurn(updatedEnemy, newLog, { enemyDazed, playerGuardDown }), 1000);
    }
  };

  const healPlayer = () => {
    if (!combatState || !combatState.playerTurn || player.potions <= 0) return;

    const healAmount = rollDice(4, 2) + 2; // 2d4+2
    const currentEnemy = combatState.enemy;
    const newHp = Math.min(player.maxHp, player.hp + healAmount);
    const newLog = [...combatState.log, `You drink a potion and heal for ${healAmount} HP.`];

    setPlayer({ ...player, hp: newHp, potions: player.potions - 1 });
    setCombatState({ ...combatState, log: newLog, playerTurn: false });

    setTimeout(
      () => enemyTurn(currentEnemy, newLog, { enemyDazed: combatState.enemyDazed, playerGuardDown: combatState.playerGuardDown }),
      1000
    );
  };

  const fleeCombat = () => {
    if (!combatState || !combatState.playerTurn) return;
    const currentEnemy = combatState.enemy;
    const fleeChance = Math.random();
    const threshold = 0.5 - playerClass.fleeBonus;
    let newLog = [...combatState.log, `You attempt to flee...`];

    if (fleeChance > threshold) {
      newLog.push(`Success! You got away.`);
      setCombatState({ ...combatState, log: newLog, playerTurn: false });
      setTimeout(() => {
        setGameState(GameState.EXPLORING);
        setCombatState(null);
      }, 1500);
    } else {
      newLog.push(`Failed! The ${currentEnemy.name} blocks your path.`);
      setCombatState({ ...combatState, log: newLog, playerTurn: false });
      setTimeout(
        () => enemyTurn(currentEnemy, newLog, { enemyDazed: combatState.enemyDazed, playerGuardDown: combatState.playerGuardDown }),
        1000
      );
    }
  };

  const inRun = gameState === GameState.EXPLORING || gameState === GameState.COMBAT;

  return (
    <div className="h-full w-full flex flex-col bg-[#050507] text-[#e2e8f0] font-mono overflow-hidden relative select-none">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      ></div>

      <header className="h-14 border-b-4 border-[#1e293b] bg-[#0f172a] flex shrink-0 items-center justify-between px-4 sm:px-6 z-10">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 border-2 border-white shadow-[0_0_10px_rgba(245,158,11,0.5)] hidden sm:block"></div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tighter text-amber-500">PIXEL DUNGEON CRAWLER // v1.1.0</h1>
        </div>
        <div className="flex gap-4 sm:gap-8 text-sm items-center">
          {(inRun || gameState === GameState.SHOP) && (
            <>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Depth</span>
                <span className="text-slate-200 uppercase font-bold text-xs">
                  Floor {floor}/{FINAL_FLOOR}
                </span>
              </div>
              {inRun && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Status</span>
                  <span className="text-amber-400 font-bold text-xs">{player.hp > 0 ? 'ACTIVE' : 'CRITICAL'}</span>
                </div>
              )}
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Gold</span>
                <span className="text-amber-400 font-bold text-xs">🪙 {player.gold}</span>
              </div>
            </>
          )}
          {(gameState === GameState.EXPLORING || gameState === GameState.SHOP) && (
            <button
              onClick={quitToMenu}
              className="bg-slate-800/60 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 transition-all cursor-pointer"
            >
              Save &amp; Exit
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden z-10">
        {gameState === GameState.MENU && (
          <MainMenu
            hasSave={hasSave}
            onNewGame={() => setGameState(GameState.CHARACTER_SELECT)}
            onContinue={continueGame}
            onHelp={() => setGameState(GameState.HELP)}
          />
        )}

        {gameState === GameState.CHARACTER_SELECT && (
          <CharacterSelect onSelect={startNewGame} onBack={() => setGameState(GameState.MENU)} />
        )}

        {gameState === GameState.HELP && <HelpScreen onBack={() => setGameState(GameState.MENU)} />}

        {gameState === GameState.SHOP && (
          <ShopScreen player={player} floor={floor} onBuy={buyShopItem} onContinue={leaveShop} />
        )}

        {gameState === GameState.VICTORY && (
          <VictoryScreen
            player={player}
            floor={floor}
            onRestart={() => setGameState(GameState.CHARACTER_SELECT)}
            onMenu={quitToMenu}
          />
        )}

        {gameState === GameState.GAME_OVER && (
          <GameOverScreen
            player={player}
            floor={floor}
            onRestart={() => setGameState(GameState.CHARACTER_SELECT)}
            onMenu={quitToMenu}
          />
        )}

        {inRun && map && (
          <div className="flex-1 flex flex-col lg:flex-row w-full h-full overflow-hidden">
            <section className="flex-1 relative bg-[#020617] border-b lg:border-b-0 lg:border-r-4 border-[#1e293b] flex flex-col items-center justify-center p-4 overflow-hidden">
              {gameState === GameState.COMBAT && (
                <div className="absolute top-4 left-4 bg-red-950/40 border border-red-500/50 px-3 py-1 text-xs text-red-400 uppercase tracking-widest z-20 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  Combat Mode: Active
                </div>
              )}

              {floor >= FINAL_FLOOR && (
                <div className="absolute top-4 right-4 bg-red-950/40 border border-red-500/70 px-3 py-1 text-xs text-red-400 uppercase tracking-widest z-20 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse">
                  ☠ Boss Lair
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
                    specialName={playerClass.special.name}
                    specialUsesLeft={combatState.playerSpecialUsesLeft}
                    onAttack={attackEnemy}
                    onSpecial={useSpecial}
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
                        src={player.avatarUrl}
                        alt={player.name}
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
                      <span className="text-green-400 font-bold">
                        {player.hp}/{player.maxHp}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 border border-slate-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-green-400 transition-all duration-300"
                        style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 uppercase tracking-widest">
                      <span>Experience (XP)</span>
                      <span className="text-blue-400 font-bold">
                        {player.xp}/{player.xpToNext}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 border border-slate-700/50">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                        style={{ width: `${Math.max(0, (player.xp / player.xpToNext) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-xs pt-3 border-t border-slate-800 mt-2 bg-slate-950/30 p-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Armor Class</span>
                      <span className="text-slate-200 font-bold flex items-center gap-1">
                        <span className="text-blue-400">🛡️</span> {player.ac} AC
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Base Strike</span>
                      <span className="text-slate-200 font-bold flex items-center gap-1">
                        <span className="text-amber-400">⚔️</span> 1d{player.damageDie}+{player.damageMod}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Attack Roll</span>
                      <span className="text-slate-200 font-bold">+{player.attackMod} d20</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Elixirs</span>
                      <span className="text-purple-400 font-bold flex items-center gap-1">
                        <span>🧪</span> {player.potions} Left
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Gold</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <span>🪙</span> {player.gold}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Slain</span>
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <span>☠</span> {player.kills}
                      </span>
                    </div>
                    <div className="flex flex-col col-span-2">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Special</span>
                      <span className="text-purple-300 font-bold flex items-center gap-1">
                        <span>✦</span> {playerClass.special.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 flex-1">
                <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Tactical Legend</h3>
                <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 border-2 border-slate-800 p-3 shadow-inner">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-600 border border-blue-400 flex items-center justify-center text-[10px] shadow-[0_0_8px_rgba(37,99,235,0.6)] text-white">@</div>
                    <span className="text-slate-300">You</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-yellow-900/50 border border-yellow-500 text-yellow-500 flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(234,179,8,0.3)]">&gt;</div>
                    <span className="text-slate-300">Stairs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-900/80 border border-red-500 text-red-400 flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(239,68,68,0.4)]">g</div>
                    <span className="text-slate-300">Goblin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-slate-700 border border-slate-400 text-slate-200 flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(148,163,184,0.4)]">s</div>
                    <span className="text-slate-300">Skeleton</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-900 border border-green-500 text-green-400 flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(34,197,94,0.4)]">O</div>
                    <span className="text-slate-300">Orc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-950 border border-red-600 text-red-500 flex items-center justify-center text-[10px] font-bold shadow-[0_0_8px_rgba(239,68,68,0.6)]">D</div>
                    <span className="text-slate-300">Dragon</span>
                  </div>
                </div>

                <div className="mt-4 bg-black/40 border-2 border-amber-500/30 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold mb-1">Objective</div>
                  <p className="text-[11px] text-slate-400">
                    Descend to <span className="text-amber-400 font-bold">Floor {FINAL_FLOOR}</span> and slay the Emberwyrm.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
