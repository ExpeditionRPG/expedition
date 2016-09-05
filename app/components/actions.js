export const SET_CODE_VIEW = 'SET_CODE_VIEW';
export const SET_DIRTY = 'SET_DIRTY';
export const TOGGLE_DRAWER = 'TOGGLE_DRAWER';
export const SET_DIALOG = 'SET_DIALOG';
export const QUEST_ACTION = 'QUEST_ACTION';

export const DialogIDs = {
  USER: 'USER',
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

export const QuestActions = {
  NEW: 'NEW',
  LOAD: 'LOAD',
  DELETE: 'DELETE',
  SAVE: 'SAVE',
  PUBLISH: 'PUBLISH',
  DOWNLOAD: 'DOWNLOAD'
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
  return {type: QUEST_ACTION, action, id};
}