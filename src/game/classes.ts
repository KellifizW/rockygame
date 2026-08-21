import { CharacterClass, Player } from './types';
import pigWarriorImg from '../assets/images/armored_pig_warrior_icon_1786809729807.jpg';
import warriorImg from '../assets/images/armored_warrior_icon_1786809533999.jpg';
import mageImg from '../assets/images/arcane_mage_icon.png';
import rogueImg from '../assets/images/shadow_rogue_icon.png';

export const CLASSES: CharacterClass[] = [
  {
    id: 'knight',
    name: 'Vanguard Knight',
    title: 'Porcine Vanguard',
    playerName: 'Sir Oinklot',
    description:
      'A walking fortress. The highest health and armor in the realm — slow to fall, impossible to shift.',
    avatarUrl: pigWarriorImg,
    color: 'text-pink-400',
    hp: 28,
    ac: 16,
    attackMod: 4,
    damageDie: 8,
    damageMod: 2,
    potions: 3,
    fleeBonus: 0,
    special: {
      id: 'shield-bash',
      name: 'Shield Bash',
      description: 'Auto-hit for 4 + level damage and daze the enemy, reducing its next attack by 2.',
      usesPerCombat: 2,
    },
    passive: {
      name: 'Ironhide',
      description: 'The sturdiest armor and stamina of any hero. Excellent for holding the line.',
    },
  },
  {
    id: 'berserker',
    name: 'Berserker',
    title: 'Raging Marauder',
    playerName: 'Grimgar the Berserker',
    description:
      'A whirlwind of steel. Deals the heaviest blows of any class, but sacrifices defense for fury.',
    avatarUrl: warriorImg,
    color: 'text-red-400',
    hp: 20,
    ac: 13,
    attackMod: 5,
    damageDie: 10,
    damageMod: 3,
    potions: 2,
    fleeBonus: 0,
    special: {
      id: 'whirlwind',
      name: 'Whirlwind',
      description: 'Swing in a wide arc for +4 damage, but your guard drops (-2 AC) for this fight.',
      usesPerCombat: 1,
    },
    passive: {
      name: 'Battle Frenzy',
      description: 'Wields the heaviest weapons. Hits hardest, but wears lighter armor.',
    },
  },
  {
    id: 'arcanist',
    name: 'Arcanist',
    title: 'Weaver of Flame',
    playerName: 'Elowen the Arcanist',
    description:
      'A glass cannon. Peerless accuracy and devastating spells that ignore armor — but a fragile body.',
    avatarUrl: mageImg,
    color: 'text-blue-400',
    hp: 14,
    ac: 11,
    attackMod: 6,
    damageDie: 6,
    damageMod: 4,
    potions: 3,
    fleeBonus: 0,
    special: {
      id: 'arcane-bolt',
      name: 'Arcane Bolt',
      description: 'A guaranteed strike that ignores AC, dealing 1d12 + level damage.',
      usesPerCombat: 2,
    },
    passive: {
      name: 'Arcane Precision',
      description: 'Rarely misses and burns through armor, but has the least endurance.',
    },
  },
  {
    id: 'shadowblade',
    name: 'Shadowblade',
    title: 'Silent Executioner',
    playerName: 'Nyx the Shadowblade',
    description:
      'Strikes from the dark with lethal criticals and slips away when outmatched. Fast and deadly.',
    avatarUrl: rogueImg,
    color: 'text-emerald-400',
    hp: 16,
    ac: 14,
    attackMod: 6,
    damageDie: 6,
    damageMod: 3,
    potions: 2,
    fleeBonus: 0.3,
    special: {
      id: 'backstab',
      name: 'Backstab',
      description: 'Attack with advantage; on a hit, deal double damage.',
      usesPerCombat: 2,
    },
    passive: {
      name: 'Slippery',
      description: 'Gains a +30% bonus to flee and lands devastating critical hits.',
    },
  },
];

export const getClass = (classId: string): CharacterClass => {
  return CLASSES.find((c) => c.id === classId) ?? CLASSES[0];
};

export const createPlayer = (classId: string): Player => {
  const cls = getClass(classId);
  return {
    id: 'player',
    pos: { x: 0, y: 0 },
    name: cls.playerName,
    characterClass: cls.name,
    classId: cls.id,
    title: cls.title,
    avatarUrl: cls.avatarUrl,
    color: cls.color,
    hp: cls.hp,
    maxHp: cls.hp,
    ac: cls.ac,
    attackMod: cls.attackMod,
    damageDie: cls.damageDie,
    damageMod: cls.damageMod,
    icon: '@',
    level: 1,
    xp: 0,
    xpToNext: 12,
    potions: cls.potions,
    gold: 0,
    kills: 0,
  };
};
