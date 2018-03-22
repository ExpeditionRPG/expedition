export type VisibilityType = 'PUBLIC'|'PRIVATE'|'NOT PUBLISHED';

interface QueryBase {
  order?: {column: string, ascending: boolean};
}

export interface FeedbackQuery extends QueryBase {
  questid?: string;
  userid?: string;
  rating?: {condition: '>'|'<'|'=', value: number};
  substring?: string;
}

export interface QuestQuery extends QueryBase {
  userid?: string;
  questid?: string
  substring?: string; // Matches title or description
}

export interface UserQuery extends QueryBase {
  userid?: string;
  substring?: string; // Matches email or name
}

export interface FeedbackEntry {
  partition: string;
  quest: {id: string, title: string};
  user: {id: string, email: string};
  rating: number;
  text: string;
}

export interface UserEntry {
  id: string;
  email: string;
  name: string;
  loot_points: number;
  last_login: Date;
}

export interface QuestEntry {
  id: string;
  title: string;
  partition: string;
  ratingavg: number;
  ratingcount: number;
  user: {id: string, email: string};
  visibility: VisibilityType;
}

export interface FeedbackMutation {
  questid?: string;
  userid?: string;
  suppress?: boolean;
}

export interface QuestMutation {
  questid?: string;
  visibility: VisibilityType;
}

export interface UserMutation {
  userid?: string;
  loot?: number;
}