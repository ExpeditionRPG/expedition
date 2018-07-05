import {FeedbackEntry, QuestEntry, UserEntry} from 'api/admin/QueryTypes';

// TODO: Change dialogs. Add single-quest and single-user dialogs.
export type ViewType = 'USERS' | 'QUESTS' | 'FEEDBACK';
export type DialogIDType = 'FEEDBACK_DETAILS' | 'QUEST_DETAILS' | 'USER_DETAILS' | 'NONE';

export interface DialogsState {
  open: DialogIDType;
}

export interface SnackbarState {
  actions?: JSX.Element[];
  message?: JSX.Element;
  open: boolean;
  persist?: boolean;
}

export interface UserState {
  displayName: string;
  email: string;
  id: string;
  image: string;
  loggedIn: boolean;
}

export interface ViewState {
  feedback: FeedbackEntry[];
  filter: string;
  lastQueryError: {view: ViewType, error: Error}|null;
  quests: QuestEntry[];
  selected: {feedback: number|null, user: number|null, quest: number|null};
  users: UserEntry[];
  view: ViewType;
}

export interface AppState {
  dialogs: DialogsState;
  snackbar: SnackbarState;
  user: UserState;
  view: ViewState;
}
