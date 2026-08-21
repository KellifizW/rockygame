import { TileType, MapData, Position, Entity } from './types';

import goblinImg from '../assets/images/goblin_pixel_icon_1786809549470.jpg';
import skeletonImg from '../assets/images/skeleton_pixel_icon_1786809561146.jpg';
import orcImg from '../assets/images/orc_pixel_icon_1786809573065.jpg';

export const rollDice = (sides: number, count: number = 1): number => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
};

// Generate a simple room-based map using random placement
export const generateMap = (width: number, height: number): { map: MapData; startPos: Position } => {
  const tiles: TileType[][] = Array.from({ length: height }, () => Array(width).fill(TileType.WALL));
  const discovered: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));
  const visible: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));

  const mapData: MapData = { width, height, tiles, discovered, visible };
  
  const rooms: { x: number, y: number, w: number, h: number }[] = [];
  const maxRooms = 10;
  const minRoomSize = 3;
  const maxRoomSize = 7;

  for (let i = 0; i < maxRooms; i++) {
    const w = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
    const h = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
    const x = Math.floor(Math.random() * (width - w - 1)) + 1;
    const y = Math.floor(Math.random() * (height - h - 1)) + 1;

    const newRoom = { x, y, w, h };
    let failed = false;
    for (const otherRoom of rooms) {
      if (
        newRoom.x <= otherRoom.x + otherRoom.w &&
        newRoom.x + newRoom.w >= otherRoom.x &&
        newRoom.y <= otherRoom.y + otherRoom.h &&
        newRoom.y + newRoom.h >= otherRoom.y
      ) {
        failed = true;
        break;
      }
    }

    if (!failed) {
      // carve room
      for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
          mapData.tiles[ry][rx] = TileType.FLOOR;
        }
      }

      // connect to previous room
      if (rooms.length > 0) {
        const prev = rooms[rooms.length - 1];
        const prevCenter = { x: Math.floor(prev.x + prev.w / 2), y: Math.floor(prev.y + prev.h / 2) };
        const newCenter = { x: Math.floor(newRoom.x + newRoom.w / 2), y: Math.floor(newRoom.y + newRoom.h / 2) };

        // carve horizontal then vertical
        if (Math.random() > 0.5) {
          carveH(mapData, prevCenter.x, newCenter.x, prevCenter.y);
          carveV(mapData, prevCenter.y, newCenter.y, newCenter.x);
        } else {
          carveV(mapData, prevCenter.y, newCenter.y, prevCenter.x);
          carveH(mapData, prevCenter.x, newCenter.x, newCenter.y);
        }
      }

      rooms.push(newRoom);
    }
  }

  // Place stairs in the last room
  if (rooms.length > 0) {
    const lastRoom = rooms[rooms.length - 1];
    mapData.tiles[Math.floor(lastRoom.y + lastRoom.h / 2)][Math.floor(lastRoom.x + lastRoom.w / 2)] = TileType.STAIRS_DOWN;
  }

  const startRoom = rooms[0];
  const startPos = { x: Math.floor(startRoom.x + startRoom.w / 2), y: Math.floor(startRoom.y + startRoom.h / 2) };

  return { map: mapData, startPos };
};

const carveH = (map: MapData, x1: number, x2: number, y: number) => {
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  for (let x = start; x <= end; x++) {
    map.tiles[y][x] = TileType.FLOOR;
  }
};

const carveV = (map: MapData, y1: number, y2: number, x: number) => {
  const start = Math.min(y1, y2);
  const end = Math.max(y1, y2);
  for (let y = start; y <= end; y++) {
    map.tiles[y][x] = TileType.FLOOR;
  }
};

export const updateFOV = (map: MapData, pos: Position, radius: number) => {
  // Reset visible
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      map.visible[y][x] = false;
    }
  }

  // Simple raycasting or just a square radius for simplicity
  for (let y = pos.y - radius; y <= pos.y + radius; y++) {
    for (let x = pos.x - radius; x <= pos.x + radius; x++) {
      if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
        // Very basic line of sight (just distance)
        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist <= radius) {
           map.visible[y][x] = true;
           map.discovered[y][x] = true;
        }
      }
    }
  }
};

export const generateEnemies = (map: MapData, floorLevel: number): Entity[] => {
  const enemies: Entity[] = [];
  const enemyTypes = [
    { name: 'Goblin Scout', hp: 5, ac: 10, attackMod: 2, damageDie: 4, icon: 'g', color: 'text-green-500', avatarUrl: goblinImg, title: 'Sneaky Raider' },
    { name: 'Skeleton Knight', hp: 8, ac: 12, attackMod: 3, damageDie: 6, icon: 's', color: 'text-slate-300', avatarUrl: skeletonImg, title: 'Undead Sentry' },
    { name: 'Orc Berserker', hp: 12, ac: 11, attackMod: 4, damageDie: 8, icon: 'O', color: 'text-emerald-500', avatarUrl: orcImg, title: 'Brutal Marauder' },
  ];

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.tiles[y][x] === TileType.FLOOR && Math.random() < 0.05) {
        // scale somewhat with floor level
        const template = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        enemies.push({
          id: Math.random().toString(36).substring(7),
          pos: { x, y },
          name: template.name,
          hp: template.hp + Math.floor(floorLevel * 1.5),
          maxHp: template.hp + Math.floor(floorLevel * 1.5),
          ac: template.ac + Math.floor(floorLevel / 2),
          attackMod: template.attackMod + Math.floor(floorLevel / 2),
          damageDie: template.damageDie,
          damageMod: Math.floor(floorLevel / 2),
          icon: template.icon,
          color: template.color,
          avatarUrl: template.avatarUrl,
          title: template.title,
        });
      }
    }
  }
  return enemies;
};
