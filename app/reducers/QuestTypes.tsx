export interface QuestDetails {
  id?: string;
  xml?: string;
  draftUrl?: string;
  publishedUrl?: string;
  created?: string;
  modified?: string;
  published?: string;
  shared?: string;
  shortUrl?: string;
  metaTitle?: string,
  metaSummary?: string,
  metaMinPlayers?: number,
  metaMaxPlayers?: number,
  metaEmail?: string,
  metaUrl?: string,
  metaMinTimeMinutes?: number,
  metaMaxTimeMinutes?: number,
  metaAuthor?: string
};

export type QuestCardName = 'COMBAT' | 'ROLEPLAY';

export type DifficultyType = 'EASY' | 'NORMAL' | 'HARD' | 'IMPOSSIBLE';
export interface CombatDifficultySettings {
  roundTimeMillis: number,
  surgePeriod: number,
  damageMultiplier: number,
}

export type Enemy = {name: string, tier: number};
export type Loot = {tier: number, count: number};


export interface Choice {
  text: string;
  idx: number;
  isCombat: boolean;
}

export interface CombatAttack {
  surge: boolean;
  damage: number;
}

export type MidCombatPhaseNameType = 'DRAW_ENEMIES' | 'PREPARE' | 'TIMER' | 'SURGE' | 'RESOLVE_ABILITIES' | 'ENEMY_TIER' | 'PLAYER_TIER'
export type EndCombatPhaseNameType = 'VICTORY' | 'DEFEAT';
export function isCombatPhase(phase: string) : boolean {
  return ['DRAW_ENEMIES', 'PREPARE', 'TIMER', 'SURGE', 'RESOLVE_ABILITIES', 'ENEMY_TIER', 'PLAYER_TIER', 'VICTORY', 'DEFEAT'].indexOf(phase) !== -1;
}
export interface MidCombatPhase {
  enemies: Enemy[];
  mostRecentAttack?: CombatAttack;
  roundCount: number;
  numAliveAdventurers: number;
  tier: number;
}
export interface EndCombatPhase {
  loot?: Loot[];
  levelUp?: boolean;
}

export type CombatPhaseNameType = MidCombatPhaseNameType | EndCombatPhaseNameType;

export interface CombatState extends CombatDifficultySettings, MidCombatPhase, EndCombatPhase {}