// TODO: Change dialogs
export type DialogIDType = 'ANNOTATION_DETAIL' | 'PUBLISHING' | 'UNPUBLISHED';

export interface DialogsState {
  open: {
    USER: boolean;
    ERROR: boolean;
    PUBLISHED: boolean;
    UNPUBLISHED: boolean;
    [key: string]: boolean;
  }
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

export interface AppState {
  dialogs: DialogsState;
  user: UserState;
  snackbar: SnackbarState;
}
