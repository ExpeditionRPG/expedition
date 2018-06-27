interface QueryBase {
  order?: {column: string, ascending: boolean};
}

export interface FeedbackQuery extends QueryBase {
  questid?: string;
  rating?: {condition: '>'|'<'|'=', value: number};
  substring?: string;
  userid?: string;
}

export interface QuestQuery extends QueryBase {
  questid?: string;
  substring?: string; // Matches title or description
  userid?: string;
}

export interface UserQuery extends QueryBase {
  substring?: string; // Matches email or name
  userid?: string;
}

export interface FeedbackEntry {
  partition: string;
  quest: {id: string, title: string};
  rating: number;
  suppressed: boolean;
  text: string;
  user: {id: string, email: string};
}

export interface UserEntry {
  email: string;
  id: string;
  last_login: Date;
  loot_points: number;
  name: string;
}

export interface QuestEntry {
  id: string;
  partition: string;
  published: boolean;
  ratingavg: number;
  ratingcount: number;
  title: string;
  user: {id: string, email: string};
}

export interface FeedbackMutation {
  partition: string;
  questid: string;
  suppress?: boolean;
  userid: string;
}

export interface QuestMutation {
  partition: string;
  published?: boolean;
  questid: string;
}

export interface UserMutation {
  loot_points?: number;
  userid: string;
}

export interface Response {
  error?: string;
  status: 'OK'|'ERROR';
}
