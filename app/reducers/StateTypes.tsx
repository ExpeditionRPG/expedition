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

export interface ViewState {
  view: ViewType;
}

export interface AppState {
  dialogs: DialogsState;
  user: UserState;
  snackbar: SnackbarState;
  view: ViewState;
}
