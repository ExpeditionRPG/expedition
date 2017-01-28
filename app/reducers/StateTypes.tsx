import {ErrorType} from '../error'
import {AppStateWithHistory} from 'expedition-app/app/reducers/StateTypes'
import {QDLParser} from '../parsing/QDLParser'
// TODO: URL type?

export type DialogIDType = 'ERROR' | 'PUBLISHED' | 'UNPUBLISHED' | 'INITIAL_STATE';

export type ShareType = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

export interface AnnotationType {
  row: number;
  column: number;
  text: string;
  type: 'warning' | 'error' | 'info' | 'internal';
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

export interface EditorState {
  renderer: QDLParser;
  node: any;
  dirty: boolean;
  line: number;
  opInit: string; // Initial mathjs to run when loading a quest
  playFrom: string;
}

export interface DialogsState {
  USER: boolean;
  ERROR: boolean;
  PUBLISHED: boolean;
  UNPUBLISHED: boolean;
  [key: string]: boolean;
}

export type ErrorsState = ErrorType[];

export interface UserState {
  loggedIn?: boolean;
  id?: string;
  displayName?: string;
  image?: string;
  email?: string;
}

export interface AppState {
  dialogs: DialogsState;
  editor: EditorState;
  errors: ErrorsState;
  annotations: AnnotationType[];
  quest: QuestType;
  user: UserState;
  preview: AppStateWithHistory;
}

export type ValidState = boolean;
