import Redux from 'redux';

import {UserState} from 'shared/auth/UserState';
import {codeClientAuth} from 'shared/auth/Web';
import {AUTH_SETTINGS} from 'shared/schema/Constants';
import {SetProfileMetaAction} from './ActionTypes';
import {loadQuestFromURL} from './Quest';
import {setSnackbar} from './Snackbar';

declare var window: any;
declare var google: any;

export function setProfileMeta(user: UserState): SetProfileMetaAction {
  return {type: 'SET_PROFILE_META', user};
}

export function postLoginUser(jwt: string, quest?: boolean | string): ((dispatch: Redux.Dispatch<any>) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    console.log(AUTH_SETTINGS);
    console.log(loadQuestFromURL);
    console.log(setSnackbar);
    codeClientAuth(window.google, jwt, AUTH_SETTINGS.URL_BASE, AUTH_SETTINGS.CLIENT_ID, AUTH_SETTINGS.SCOPES + ' https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install');

    /*
      .then((r: UserState) => {
        dispatch(setProfileMeta(r));
        if (r.email === null) {
            alert('Issue logging in! Please contact support about user ID ' + r.id);
          }
        if (quest) {
          if (quest === true) { // create a new quest
            dispatch(loadQuestFromURL(r, undefined));
          } else if (typeof quest === 'string') {
            dispatch(loadQuestFromURL(r, quest));
          }
        }
      })
      .catch((e) => {
        dispatch(setSnackbar(true, 'Login error - please report via Contact Us button!'));
        throw e;
      });
    */
  };
}

export function logoutUser(): ((dispatch: Redux.Dispatch<any>) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    // https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out#sign-out
    google.accounts.id.disableAutoSelect();

    // TODO send request to /auth/logout ??

    // window.gapi.auth.setToken(null);
    // window.gapi.auth.signOut();

    // Remove document ID, so we get kicked back to home page.
    window.location.hash = '';

    window.location.reload();
  };
}
