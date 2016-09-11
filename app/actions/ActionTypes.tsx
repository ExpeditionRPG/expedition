import {UserType, QuestType, CodeViewType, DialogIDType} from '../reducers/StateTypes'

export const NEW_QUEST: string = 'NEW_QUEST';
export const LOAD_QUEST: string = 'LOAD_QUEST';
export const DELETE_QUEST: string = 'DELETE_QUEST';
export const SAVE_QUEST: string = 'SAVE_QUEST';
export const PUBLISH_QUEST: string = 'PUBLISH_QUEST';
export const DOWNLOAD_QUEST: string = 'DOWNLOAD_QUEST';
export type QuestActionType = 'NEW_QUEST' | 'LOAD_QUEST' | 'DELETE_QUEST' | 'SAVE_QUEST' | 'PUBLISH_QUEST' | 'DOWNLOAD_QUEST';

export const SIGN_IN: string = 'SIGN_IN';
export const SIGN_OUT: string = 'SIGN_OUT';

export const DrawerActions = {
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  TOGGLE: 'TOGGLE'
};

export const SET_PROFILE_META: string = 'SET_PROFILE_META';
export interface SetProfileMetaAction {
  type: 'SET_PROFILE_META';
  user: UserType;
}

export const SET_DIALOG: string = 'SET_DIALOG';
export interface SetDialogAction extends Redux.Action {
  type: 'SET_DIALOG';
  dialog: DialogIDType;
  shown: boolean;
}

export const SET_CODE_VIEW: string = 'SET_CODE_VIEW';
export interface SetCodeViewAction extends Redux.Action {
  type: 'SET_CODE_VIEW';
  currview: CodeViewType;
  currcode: string;
  nextview: CodeViewType;
  cb: ()=>any
}

export const SET_DIRTY: string = 'SET_DIRTY';
export interface SetDirtyAction extends Redux.Action {
  type: 'SET_DIRTY';
  is_dirty: boolean;
}

export const SET_DRAWER: string = 'SET_DRAWER';
export interface SetDrawerAction extends Redux.Action {
  type: 'SET_DRAWER'
  is_open: boolean;
}

export const REQUEST_QUEST_LOAD: string = 'REQUEST_QUEST_LOAD';
export interface RequestQuestLoadAction extends Redux.Action {
  type: 'REQUEST_QUEST_LOAD';
  id: string;
}

export const RECEIVE_QUEST_LOAD: string = 'RECEIVE_QUEST_LOAD';
export interface ReceiveQuestLoadAction extends Redux.Action {
  type: 'RECEIVE_QUEST_LOAD';
  quest: QuestType;
}

export const REQUEST_QUEST_SAVE: string = 'REQUEST_QUEST_SAVE';
export interface RequestQuestSaveAction extends Redux.Action {
  type: 'REQUEST_QUEST_SAVE';
  id: string;
}

export const RECEIVE_QUEST_SAVE: string = 'RECEIVE_QUEST_SAVE';
export interface ReceiveQuestSaveAction extends Redux.Action {
  type: 'RECEIVE_QUEST_SAVE';
  id: string;
}

export const REQUEST_QUEST_DELETE: string = 'REQUEST_QUEST_DELETE';
export interface RequestQuestDeleteAction extends Redux.Action {
  type: 'REQUEST_QUEST_DELETE';
  id: string;
}

export const RECEIVE_QUEST_DELETE: string = 'RECEIVE_QUEST_DELETE';
export interface ReceiveQuestDeleteAction extends Redux.Action {
  type: 'RECEIVE_QUEST_DELETE';
  id: string;
}

export const REQUEST_QUEST_PUBLISH: string = 'REQUEST_QUEST_PUBLISH';
export interface RequestQuestPublishAction extends Redux.Action {
  type: 'REQUEST_QUEST_PUBLISH';
  id: string;
}

export const RECEIVE_QUEST_PUBLISH: string = 'RECEIVE_QUEST_PUBLISH';
export interface ReceiveQuestPublishAction extends Redux.Action {
  type: 'RECEIVE_QUEST_PUBLISH';
  id: string;
  short_url: string;
}

export const REQUEST_QUEST_LIST: string = 'REQUEST_QUEST_LIST';
export interface RequestQuestListAction extends Redux.Action {
  type: 'REQUEST_QUEST_LIST';
}

export const RECEIVE_QUEST_LIST: string = 'RECEIVE_QUEST_LIST';
export interface ReceiveQuestListAction extends Redux.Action {
  type: 'RECEIVE_QUEST_LIST';
  quests: QuestType[];
  nextToken: string;
  receivedAt: number;
}