export enum GameState {
  START,
  EXPLORING,
  COMBAT,
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
}

export interface Player extends Entity {
  level: number;
  xp: number;
  xpToNext: number;
  potions: number;
  characterClass: string;
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
}
