export const SET_CODE_VIEW: string = 'SET_CODE_VIEW';
export const SET_DIRTY: string = 'SET_DIRTY';
export const SET_DRAWER: string = 'SET_DRAWER';
export const SET_DIALOG: string = 'SET_DIALOG';
export const SET_PROFILE_META: string = 'SET_PROFILE_META';
export const NEW_QUEST: string = 'NEW_QUEST';
export const LOAD_QUEST: string = 'LOAD_QUEST';
export const DELETE_QUEST: string = 'DELETE_QUEST';
export const SAVE_QUEST: string = 'SAVE_QUEST';
export const PUBLISH_QUEST: string = 'PUBLISH_QUEST';
export const DOWNLOAD_QUEST: string = 'DOWNLOAD_QUEST';
export const SIGN_IN: string = 'SIGN_IN';
export const SIGN_OUT: string = 'SIGN_OUT';

export type DialogIDType = 'USER' | 'ERROR' | 'CONFIRM_NEW_QUEST' | 'CONFIRM_LOAD_QUEST' | 'PUBLISH_QUEST';

export type CodeViewType = 'XML' | 'MARKDOWN';

export const DrawerActions = {
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  TOGGLE: 'TOGGLE'
};

export const REQUEST_QUEST_LOAD: string = 'REQUEST_QUEST_LOAD';
export const RECEIVE_QUEST_LOAD: string = 'RECEIVE_QUEST_LOAD';

export const REQUEST_QUEST_SAVE: string = 'REQUEST_QUEST_SAVE';
export const RECEIVE_QUEST_SAVE: string = 'RECEIVE_QUEST_SAVE';

export const REQUEST_QUEST_DELETE: string = 'REQUEST_QUEST_DELETE';
export const RECEIVE_QUEST_DELETE: string = 'RECEIVE_QUEST_DELETE';

export const REQUEST_QUEST_PUBLISH: string = 'REQUEST_QUEST_PUBLISH';
export const RECEIVE_QUEST_PUBLISH: string = 'RECEIVE_QUEST_PUBLISH';

export const REQUEST_QUEST_LIST: string = 'REQUEST_QUEST_LIST';
export const RECEIVE_QUEST_LIST: string = 'RECEIVE_QUEST_LIST';