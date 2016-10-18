import {UserState, QuestType, DialogIDType, ShareType} from '../reducers/StateTypes'

export const NEW_QUEST: string = 'NEW_QUEST';
export const LOAD_QUEST: string = 'LOAD_QUEST';
export const DELETE_QUEST: string = 'DELETE_QUEST';
export const SAVE_QUEST: string = 'SAVE_QUEST';
export const PUBLISH_QUEST: string = 'PUBLISH_QUEST';
export const SHARE_QUEST: string = 'SHARE_QUEST';
export const DOWNLOAD_QUEST: string = 'DOWNLOAD_QUEST';
export type QuestActionType = 'NEW_QUEST' | 'LOAD_QUEST' | 'DELETE_QUEST' | 'SAVE_QUEST' | 'PUBLISH_QUEST' | 'DOWNLOAD_QUEST';

export const SIGN_IN: string = 'SIGN_IN';
export const SIGN_OUT: string = 'SIGN_OUT';

export const DrawerActions = {
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  TOGGLE: 'TOGGLE'
};

export interface SetProfileMetaAction {
  type: 'SET_PROFILE_META';
  user: UserState;
}

export interface SetDialogAction extends Redux.Action {
  type: 'SET_DIALOG';
  dialog: DialogIDType;
  shown: boolean;
}

export interface SetDirtyAction extends Redux.Action {
  type: 'SET_DIRTY';
  is_dirty: boolean;
}

export interface SetDrawerAction extends Redux.Action {
  type: 'SET_DRAWER'
  is_open: boolean;
}

export interface RequestQuestLoadAction extends Redux.Action {
  type: 'REQUEST_QUEST_LOAD';
  id: string;
}

export interface ReceiveQuestLoadAction extends Redux.Action {
  type: 'RECEIVE_QUEST_LOAD';
  quest: QuestType;
}

export interface RequestQuestSaveAction extends Redux.Action {
  type: 'REQUEST_QUEST_SAVE';
  id: string;
}

export interface ReceiveQuestSaveAction extends Redux.Action {
  type: 'RECEIVE_QUEST_SAVE';
  id: string;
}

export interface RequestQuestPublishAction extends Redux.Action {
  type: 'REQUEST_QUEST_PUBLISH';
  id: string;
}

export interface ReceiveQuestPublishAction extends Redux.Action {
  type: 'RECEIVE_QUEST_PUBLISH';
  id: string;
}

export interface RequestQuestDeleteAction extends Redux.Action {
  type: 'REQUEST_QUEST_DELETE';
  id: string;
}

export interface ReceiveQuestDeleteAction extends Redux.Action {
  type: 'RECEIVE_QUEST_DELETE';
  id: string;
}

export interface RequestQuestShareAction extends Redux.Action {
  type: 'REQUEST_QUEST_SHARE';
  id: string;
  share: ShareType;
}

export interface ReceiveQuestShareAction extends Redux.Action {
  type: 'RECEIVE_QUEST_SHARE';
  id: string;
  share: ShareType;
}

export interface RequestQuestListAction extends Redux.Action {
  type: 'REQUEST_QUEST_LIST';
}

export interface ReceiveQuestListAction extends Redux.Action {
  type: 'RECEIVE_QUEST_LIST';
  quests: QuestType[];
  nextToken: string;
  receivedAt: number;
}