import {ErrorType} from '../error'
// TODO: URL type?

export type DialogIDType = 'USER' | 'ERROR' | 'CONFIRM_NEW_QUEST' | 'CONFIRM_LOAD_QUEST' | 'SHARE_SETTINGS' | 'PUBLISHED';

export type ShareType = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

export interface EditorState {
    xml: string;
}

export interface QuestType {
  id?: string;
  xml?: string;
  md?: string;
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

export type DirtyState = boolean;

export interface DialogsState {
  USER: boolean;
  ERROR: boolean;
  CONFIRM_NEW_QUEST: boolean;
  CONFIRM_LOAD_QUEST: boolean;
  SHARE_SETTINGS: boolean;
  PUBLISHED: boolean;
  [key: string]: boolean;
}

export interface DrawerState {
  open: boolean;
  quests: QuestType[];
  receivedAt?: number;
};

export interface UserState {
  id?: string,
  displayName?: string,
  image?: string
};

export type ErrorsState = ErrorType[];

export interface AppState {
  editor: EditorState;
  quest: QuestType;
  dirty: DirtyState;
  drawer: DrawerState;
  user: UserState;
  dialogs: DialogsState;
  errors: ErrorsState;
}