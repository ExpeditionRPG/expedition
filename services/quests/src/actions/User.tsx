import Redux from 'redux';

import {UserState} from 'shared/auth/UserState';
import {getAuthorizationToken, loadGapi} from 'shared/auth/Web';
import {AUTH_SETTINGS} from 'shared/schema/Constants';
import {SetProfileMetaAction} from './ActionTypes';
import {loadQuestFromURL} from './Quest';

declare var window: any;
declare var google: any;

export function setProfileMeta(user: UserState): SetProfileMetaAction {
  return {type: 'SET_PROFILE_META', user};
}

export function ensureToken(): Promise<string> {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    return Promise.resolve(token);
  } else {
    return loadGapi(window.gapi, AUTH_SETTINGS.API_KEY)
      .then((gapi: any) => getAuthorizationToken(window.google, AUTH_SETTINGS.URL_BASE, AUTH_SETTINGS.CLIENT_ID, AUTH_SETTINGS.SCOPES + ' https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.install'))
      .then((token: any) => {
        window.gapi.auth.setToken(token);
        return token;
      });
  }
}

export function postLoginUser(r: UserState, quest?: boolean | string): ((dispatch: Redux.Dispatch<any>) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
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
  };
}

export function logoutUser(): ((dispatch: Redux.Dispatch<any>) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    // https://developers.google.com/identity/gsi/web/guides/automatic-sign-in-sign-out#sign-out
    google.accounts.id.disableAutoSelect();

    // GAPI still used in quest creator
    if (window.gapi) {
      window.gapi.auth.setToken(null);
      window.gapi.auth.signOut();
    }

    // Remove document ID, so we get kicked back to home page.
    window.location.hash = '';

    window.location.reload();
  };
}
