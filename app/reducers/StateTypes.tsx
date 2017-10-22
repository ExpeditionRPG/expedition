import {AppStateWithHistory} from 'expedition-app/app/reducers/StateTypes'
import {QDLParser} from 'expedition-qdl/lib/render/QDLParser'
import {ErrorType} from '../../errors/types'
// TODO: URL type?

export type DialogIDType = 'ERROR' | 'ANNOTATION_DETAIL' | 'PUBLISHING' | 'UNPUBLISHED';

export type ShareType = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

export type PanelType = 'CONTEXT' | 'NOTES';

export interface AnnotationType {
  row: number;
  column: number;
  text: string;
  type: 'warning' | 'error' | 'info' | 'internal';
}

export interface AnnotationsState {
  spellcheck: AnnotationType[];
  playtest: AnnotationType[];
}

export interface XMLElement {
  remove(): void;
  children: XMLElement[];
  getAttribute(attrib: string): string;
  hasAttribute(attrib: string): boolean;
  appendChild(child: XMLElement): void;
  cloneNode(deep: boolean): XMLElement;
  localName: string;
  tagName: string;
  parentNode: XMLElement;
  textContent: string;
  attributes: {name: string}[];
  innerHTML: string;
  setAttribute(attrib: string, value: any): void;
  nextElementSibling?: XMLElement;
  querySelector(query: string): XMLElement;
}

export interface QuestType {
  id?: string;
  engineversion?: string;
  majorrelease?: boolean;
  xml?: string;
  md?: string;
  mdRealtime?: any; // Realtime API text node
  notesRealtime?: any;
  metadataRealtime?: any;
  realtimeModel?: any;
  draftUrl?: string;
  publishedurl?: string;
  created?: string;
  modified?: string;
  published?: string;
  title?: string;
  summary?: string;
  minplayers?: number;
  maxplayers?: number;
  email?: string;
  url?: string;
  mintimeminutes?: number;
  maxtimeminutes?: number;
  author?: string;
  genre?: string;
  contentrating?: string;
  valid?: boolean;
  saveError?: string;
  expansionhorror?: boolean;
};

export interface EditorState {
  renderer: QDLParser;
  node: any;
  dirty: boolean;
  dirtyTimeout: any;
  line: {
    number: number;
    ts: number;
  }
  opInit: string; // Initial mathjs to run when loading a quest
  lastSplitPaneDragMillis: number; // Informs re-rendering of text editor
  bottomPanel: PanelType;
  loadingQuest: boolean;
  wordCount: number;
  worker: Worker;
}

export interface DialogsState {
  open: {
    USER: boolean;
    ERROR: boolean;
    PUBLISHED: boolean;
    UNPUBLISHED: boolean;
    [key: string]: boolean;
  }
  errors: Error[];
  annotations: (ErrorType|number)[];
}

export interface SnackbarState {
  open: boolean;
  message?: string;
  action?: () => any;
  actionLabel?: string;
  persist?: boolean;
}

export interface UserState {
  loggedIn?: boolean;
  id?: string;
  displayName?: string;
  image?: string;
  email?: string;
}

export interface AppState {
  annotations: AnnotationsState;
  dialogs: DialogsState;
  editor: EditorState;
  quest: QuestType;
  user: UserState;
  preview: AppStateWithHistory;
  snackbar: SnackbarState;
}

export type ValidState = boolean;
