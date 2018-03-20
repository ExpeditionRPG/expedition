// TODO: Change dialogs. Add single-quest and single-user dialogs.
export type ViewType = 'USERS' | 'QUESTS' | 'FEEDBACK';
export type DialogIDType = 'ANNOTATION_DETAIL' | 'PUBLISHING' | 'UNPUBLISHED';

export interface DialogsState {
  open: {
    USER: boolean;
    ERROR: boolean;
    PUBLISHED: boolean;
    UNPUBLISHED: boolean;
    [key: string]: boolean;
  }
  drawer: boolean;
}

export interface SnackbarState {
  open: boolean;
  message?: string;
  action?: () => any;
  actionLabel?: string;
  persist?: boolean;
}

export interface UserState {
  loggedIn: boolean;
  id: string;
  displayName: string;
  image: string;
  email: string;
}

export interface FeedbackEntry {
  partition: string;
  quest: {id: string, title: string};
  user: {id: string, email: string};
  rating: number;
  text: string;
}

export interface UserEntry {
  id: string;
  email: string;
  name: string;
  loot_points: number;
  last_login: Date;
}

export interface QuestEntry {
  id: string;
  title: string;
  partition: string;
  ratingavg: number;
  ratingcount: number;
  user: {id: string, email: string};
  published: 'PUBLIC'|'PRIVATE'|'NOT PUBLISHED';
}

export interface ViewState {
  view: ViewType;
  feedback: FeedbackEntry[];
  users: UserEntry[];
  quests: QuestEntry[];
}



export interface AppState {
  dialogs: DialogsState;
  user: UserState;
  snackbar: SnackbarState;
  view: ViewState;
}
