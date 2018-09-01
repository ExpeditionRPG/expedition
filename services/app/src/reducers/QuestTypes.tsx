export interface Choice {
  idx: number;
  jsx: JSX.Element;
}

export interface EventParameters {
  xp?: boolean;
  loot?: boolean;
  heal?: number;
}

export interface RoleplayElement {
  type: 'text' | 'instruction';
  jsx: JSX.Element;
  icon?: string;
}

export interface Enemy {name: string; tier: number; class?: string; }

export interface Loot {tier: number; count: number; }
