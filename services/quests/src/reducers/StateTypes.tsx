import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {UserState} from 'shared/auth/UserState';
import {QDLParser} from 'shared/render/QDLParser';
import {ContentRating, Language, Theme} from 'shared/schema/Constants';
import {ErrorType} from '../../errors/types';
// TODO: URL type?

export interface AnnouncementState {
  open: boolean;
  message: string;
  link: string;
}

export type DialogIDType = 'ERROR' | 'ANNOTATION_DETAIL' | 'PUBLISHING' | 'UNPUBLISHED';

export type ShareType = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

export type PanelType = 'CONTEXT' | 'NOTES' | null;

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
  attributes: Array<{name: string}>;
  innerHTML: string;
  setAttribute(attrib: string, value: any): void;
  nextElementSibling?: XMLElement;
  querySelector(query: string): XMLElement;
}

export interface QuestType {
  [index: string]: any;
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
  contentrating?: ContentRating;
  valid?: boolean;
  saveError?: string;
  expansionhorror?: boolean;
  expansionfuture?: boolean;
  expansionwyrmsgiants?: boolean;
  expansionscarredlands?: boolean;
  language?: Language;
  theme?: Theme;
  requirespenpaper?: boolean;
  edittime?: Date;
}

export interface EditorState {
  renderer: QDLParser|null;
  node: any;
  dirty: boolean;
  dirtyTimeout: any;
  line: {
    number: number;
    ts: number;
  };
  opInit: string; // Initial mathjs to run when loading a quest
  lastSplitPaneDragMillis: number; // Informs re-rendering of text editor
  bottomPanel: PanelType;
  loadingQuest: boolean;
  showLineNumbers: boolean;
  wordCount: number;
  worker: Worker|null;
  fatalError: string|null;
}

export interface DialogsState {
  open: {
    USER: boolean;
    ERROR: boolean;
    PUBLISHED: boolean;
    UNPUBLISHED: boolean;
    [key: string]: boolean;
  };
  errors: Error[];
  annotations: Array<ErrorType|number>;
}

export interface SnackbarState {
  open: boolean;
  message?: string;
  action?: () => any;
  actionLabel?: string;
  persist?: boolean;
}

export interface TutorialState {
  playFromCursor: boolean;
}

export interface AppState {
  annotations: AnnotationsState;
  announcement: AnnouncementState;
  dialogs: DialogsState;
  editor: EditorState;
  quest: QuestType;
  user: UserState;
  preview: AppStateWithHistory;
  snackbar: SnackbarState;
  tutorial: TutorialState;
}

export interface PlaytestSettings {
  [key: string]: any;
  expansionhorror: boolean;
  expansionfuture: boolean;
  expansionwyrmsgiants: boolean;
  expansionscarredlands: boolean;
}

export type ValidState = boolean;
