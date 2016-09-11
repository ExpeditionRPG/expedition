import {ErrorType} from '../error'
// TODO: URL type?

export type DialogIDType = 'USER' | 'ERROR' | 'CONFIRM_NEW_QUEST' | 'CONFIRM_LOAD_QUEST' | 'PUBLISH_QUEST';

export type CodeViewType = 'XML' | 'MARKDOWN';

export interface EditorType {
    xml: string;
    view: CodeViewType;
}

export interface QuestType {
  id?: string;
  url?: string;
  xml?: string;
  last_save?: number;
  short_url?: string;
  meta?: {
    title: string,
    summary: string
  }
};

export type DirtyType = boolean;

export interface DialogsType {
  USER: boolean;
  ERROR: boolean;
  CONFIRM_NEW_QUEST: boolean;
  CONFIRM_LOAD_QUEST: boolean;
  PUBLISH_QUEST: boolean;
  [key: string]: boolean;
}

export interface DrawerType {
  open: boolean;
  quests: QuestType[];
  receivedAt?: number;
};

export interface UserType {
  profile?: {
    id: string,
    displayName: string,
    image: string
  };
  login: string;
  logout: string
};

export type ErrorsType = ErrorType[];

export interface AppState {
  editor: EditorType;
  quest: QuestType;
  dirty: DirtyType;
  drawer: DrawerType;
  user: UserType;
  dialogs: DialogsType;
  errors: ErrorsType;
}