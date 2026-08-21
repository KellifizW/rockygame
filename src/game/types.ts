export enum GameState {
  MENU,
  CHARACTER_SELECT,
  HELP,
  EXPLORING,
  COMBAT,
  SHOP,
  GAME_OVER,
  VICTORY,
}

export enum TileType {
  WALL,
  FLOOR,
  DOOR,
  STAIRS_DOWN,
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  pos: Position;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  attackMod: number;
  damageDie: number; // e.g., 6 for 1d6
  damageMod: number;
  icon: string;
  color: string;
  avatarUrl?: string;
  title?: string;
  isBoss?: boolean;
}

export type SpecialId = 'shield-bash' | 'whirlwind' | 'arcane-bolt' | 'backstab';

export interface ClassSpecial {
  id: SpecialId;
  name: string;
  description: string;
  usesPerCombat: number;
}

export interface ClassPassive {
  name: string;
  description: string;
}

export interface CharacterClass {
  id: string;
  name: string;
  title: string;
  playerName: string;
  description: string;
  avatarUrl: string;
  color: string;
  hp: number;
  ac: number;
  attackMod: number;
  damageDie: number;
  damageMod: number;
  potions: number;
  fleeBonus: number; // additive bonus to flee chance (0..1)
  special: ClassSpecial;
  passive: ClassPassive;
}

export interface Player extends Entity {
  level: number;
  xp: number;
  xpToNext: number;
  potions: number;
  characterClass: string;
  classId: string;
  gold: number;
  kills: number;
}

export interface MapData {
  width: number;
  height: number;
  tiles: TileType[][];
  discovered: boolean[][];
  visible: boolean[][];
}

export interface CombatState {
  enemy: Entity;
  log: string[];
  playerTurn: boolean;
  playerSpecialUsesLeft: number;
  enemyDazed: boolean;
  playerGuardDown: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  available: (player: Player) => boolean;
}

export interface SaveData {
  version: number;
  floor: number;
  player: Player;
  map: MapData;
  enemies: Entity[];
}
