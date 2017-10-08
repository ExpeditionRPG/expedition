import Redux from 'redux'
import {UserState, QuestType, DialogIDType, ShareType, PanelType, SnackbarState} from '../reducers/StateTypes'
import {LogMessageMap} from 'expedition-qdl/lib/render/Logger'
import {QDLParser} from 'expedition-qdl/lib/render/QDLParser'

export const NEW_QUEST: string = 'NEW_QUEST';
export const LOAD_QUEST: string = 'LOAD_QUEST';
export const SAVE_QUEST: string = 'SAVE_QUEST';
export const PUBLISH_QUEST: string = 'PUBLISH_QUEST';
export const UNPUBLISH_QUEST: string = 'UNPUBLISH_QUEST';
export type QuestActionType = 'NEW_QUEST' | 'LOAD_QUEST' | 'SAVE_QUEST' | 'PUBLISH_QUEST' | 'UNPUBLISH_QUEST' | 'DRIVE_VIEW' | 'FEEDBACK' | 'HELP';

export const SIGN_IN: string = 'SIGN_IN';
export const SIGN_OUT: string = 'SIGN_OUT';

export interface SetProfileMetaAction {
  type: 'SET_PROFILE_META';
  user: UserState;
}

export interface SetDialogAction extends Redux.Action {
  type: 'SET_DIALOG';
  dialog: DialogIDType;
  shown: boolean;

  // For annotation detail dialog only
  annotations?: number[];
}

export interface SetDirtyAction extends Redux.Action {
  type: 'SET_DIRTY';
  is_dirty: boolean;
}

export interface SetDirtyTimeoutAction extends Redux.Action {
  type: 'SET_DIRTY_TIMEOUT';
  timer: any;
}

export interface SetLineAction extends Redux.Action {
  type: 'SET_LINE';
  line: number;
}

export interface ReceiveQuestLoadAction extends Redux.Action {
  type: 'RECEIVE_QUEST_LOAD';
  quest: QuestType;
}

export interface RequestQuestSaveAction extends Redux.Action {
  type: 'REQUEST_QUEST_SAVE';
  quest: QuestType;
}

export interface ReceiveQuestSaveAction extends Redux.Action {
  type: 'RECEIVE_QUEST_SAVE';
  meta: QuestType;
}

export interface ReceiveQuestSaveErrAction extends Redux.Action {
  type: 'RECEIVE_QUEST_SAVE_ERR';
  err: string;
}

export interface QuestRenderAction extends Redux.Action {
  type: 'QUEST_RENDER';
  qdl: QDLParser;
  msgs: LogMessageMap;
}

export interface QuestPlaytestAction extends Redux.Action {
  type: 'PLAYTEST_MESSAGE';
  msgs: LogMessageMap;
}

export interface QuestMetadataChangeAction extends Redux.Action {
  type: 'QUEST_METADATA_CHANGE';
  key: string;
  value: any;
}

export interface RequestQuestPublishAction extends Redux.Action {
  type: 'REQUEST_QUEST_PUBLISH';
  quest: QuestType;
}

export interface ReceiveQuestPublishAction extends Redux.Action {
  type: 'RECEIVE_QUEST_PUBLISH';
  quest: QuestType;
}

export interface RequestQuestUnpublishAction extends Redux.Action {
  type: 'REQUEST_QUEST_UNPUBLISH';
  quest: QuestType;
}

export interface ReceiveQuestUnpublishAction extends Redux.Action {
  type: 'RECEIVE_QUEST_UNPUBLISH';
  quest: QuestType;
}

export interface SetOpInitAction extends Redux.Action {
  type: 'SET_OP_INIT';
  mathjs: string;
}

export interface PanelDragAction extends Redux.Action {
  type: 'PANEL_DRAG';
}

export interface PanelToggleAction extends Redux.Action {
  type: 'PANEL_TOGGLE';
  panel: PanelType;
}

export interface SnackbarSetAction extends SnackbarState {type: 'SNACKBAR_SET'}

export interface QuestPublishingSetupAction extends Redux.Action {
  type: 'QUEST_PUBLISHING_SETUP';
}

export interface PushErrorAction extends Redux.Action {
  type: 'PUSH_ERROR';
  error: Error;
}

export interface PlaytestInitAction extends Redux.Action {
  type: 'PLAYTEST_INIT';
  worker: Worker;
}
