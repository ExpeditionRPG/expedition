import Redux from 'redux'
import {UserState, DialogIDType, SnackbarState, ViewType} from '../reducers/StateTypes'
import {FeedbackEntry, QuestEntry, UserEntry} from 'expedition-api/app/admin/QueryTypes'

export const SIGN_IN: string = 'SIGN_IN';
export const SIGN_OUT: string = 'SIGN_OUT';

export interface SetProfileMetaAction {
  type: 'SET_PROFILE_META';
  user: UserState;
}

export interface SetDialogAction extends Redux.Action {
  type: 'SET_DIALOG';
  dialog: DialogIDType;

  // For annotation detail dialog only
  annotations?: number[];
}

export interface ToggleDrawerAction extends Redux.Action {
  type: 'TOGGLE_DRAWER';
}

export interface SnackbarSetAction extends SnackbarState {type: 'SNACKBAR_SET'}

export interface SetViewAction extends Redux.Action {
  type: 'SET_VIEW';
  view: ViewType;
}

export interface SetViewFeedbackAction extends Redux.Action {
  type: 'SET_VIEW_FEEDBACK';
  entries: FeedbackEntry[];
}

export interface SetViewQuestsAction extends Redux.Action {
  type: 'SET_VIEW_QUESTS';
  entries: QuestEntry[];
}

export interface SetViewUsersAction extends Redux.Action {
  type: 'SET_VIEW_USERS';
  entries: UserEntry[];
}

export interface SelectRowAction extends Redux.Action {
  type: 'SELECT_ROW';
  table: 'feedback'|'users'|'quests';
  row: number|null;
}