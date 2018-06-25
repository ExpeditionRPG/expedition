import {FeedbackEntry, QuestEntry, UserEntry} from 'api/admin/QueryTypes';

// TODO: Change dialogs. Add single-quest and single-user dialogs.
export type ViewType = 'USERS' | 'QUESTS' | 'FEEDBACK';
export type DialogIDType = 'FEEDBACK_DETAILS' | 'QUEST_DETAILS' | 'USER_DETAILS' | 'NONE';

export interface DialogsState {
  open: DialogIDType;
}

export interface SnackbarState {
  open: boolean;
  message?: JSX.Element;
  actions?: JSX.Element[];
  persist?: boolean;
}

export interface UserState {
  loggedIn: boolean;
  id: string;
  displayName: string;
  image: string;
  email: string;
}

export interface ViewState {
  view: ViewType;
  filter: string;
  feedback: FeedbackEntry[];
  users: UserEntry[];
  quests: QuestEntry[];
  selected: {feedback: number|null, user: number|null, quest: number|null};
  lastQueryError: {view: ViewType, error: Error}|null;
}

export interface AppState {
  dialogs: DialogsState;
  user: UserState;
  snackbar: SnackbarState;
  view: ViewState;
}
