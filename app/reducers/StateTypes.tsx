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
  author?: string
};

export type DirtyState = boolean;

export interface DialogsState {
  USER: boolean;
  ERROR: boolean;
  PUBLISHED: boolean;
  UNPUBLISHED: boolean;
  [key: string]: boolean;
}

export interface DrawerState {
  open: boolean;
};

export interface UserState {
  loggedIn?: boolean,
  id?: string,
  displayName?: string,
  image?: string
};

export type ErrorsState = ErrorType[];

export interface AppState {
  quest: QuestType;
  dirty: DirtyState;
  drawer: DrawerState;
  user: UserState;
  dialogs: DialogsState;
  errors: ErrorsState;
}