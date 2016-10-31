import {ErrorType} from '../error'
// TODO: URL type?

export type DialogIDType = 'ERROR' | 'PUBLISHED' | 'UNPUBLISHED';

export type ShareType = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

export interface QuestType {
  id?: string;
  xml?: string;
  md?: string;
  mdRealtime?: any;
  draftUrl?: string;
  publishedurl?: string;
  created?: string;
  modified?: string;
  published?: string;
  title?: string,
  summary?: string,
  minplayers?: number,
  maxplayers?: number,
  email?: string,
  url?: string,
  mintimeminutes?: number,
  maxtimeminutes?: number,
  author?: string,
  valid?: boolean,
};

export type DirtyState = boolean;

export interface DialogsState {
  USER: boolean;
  ERROR: boolean;
  PUBLISHED: boolean;
  UNPUBLISHED: boolean;
  [key: string]: boolean;
}

export type ErrorsState = ErrorType[];

export interface UserState {
  loggedIn?: boolean,
  id?: string,
  displayName?: string,
  image?: string
}

export interface AppState {
  dialogs: DialogsState;
  dirty: DirtyState;
  errors: ErrorsState;
  quest: QuestType;
  user: UserState;
}

export type ValidState = boolean;