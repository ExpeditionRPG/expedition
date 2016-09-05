export const SET_CODE_VIEW = 'SET_CODE_VIEW';
export const SET_DIRTY = 'SET_DIRTY';
export const TOGGLE_DRAWER = 'TOGGLE_DRAWER';
export const SET_DIALOG = 'SET_DIALOG';
export const NEW_QUEST = 'NEW_QUEST';
export const LOAD_QUEST = 'LOAD_QUEST';
export const DELETE_QUEST = 'DELETE_QUEST';
export const SAVE_QUEST = 'SAVE_QUEST';
export const PUBLISH_QUEST = 'PUBLISH_QUEST';
export const DOWNLOAD_QUEST = 'DOWNLOAD_QUEST';
export const SIGN_IN = 'SIGN_IN';
export const SIGN_OUT = 'SIGN_OUT';

export const DialogIDs = {
  USER: 'USER',
  ERROR: 'ERROR',
  CONFIRM_NEW_QUEST: 'CONFIRM_NEW_QUEST',
  CONFIRM_LOAD_QUEST: 'CONFIRM_LOAD_QUEST',
  PUBLISH_QUEST: 'PUBLISH_QUEST'
};

export const CodeViews = {
  XML: 'XML',
  MARKDOWN: 'MARKDOWN'
};

export const DrawerActions = {
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  TOGGLE: 'TOGGLE'
};

export function setCodeView(currview, currcode, nextview, cb) {
  return {type: SET_CODE_VIEW, currview, currcode, nextview, cb};
}

export function setDirty(is_dirty) {
  return {type: SET_DIRTY, is_dirty};
}

export function toggleDrawer() {
  return {type: TOGGLE_DRAWER};
}

export function setDialog(dialog, shown) {
  return {type: SET_DIALOG, dialog, shown};
}

export function questAction(action, id) {
  return {type: action, id};
}

export function signIn() {
  return {type: SIGN_IN};
}

export function signOut() {
  return {type: SIGN_OUT};
}