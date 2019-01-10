import Redux from 'redux';

import {registerUserAndIdToken} from 'shared/auth/API';
import {loggedOutUser, UserState} from 'shared/auth/UserState';
import {loginWeb as loginWebBase} from 'shared/auth/Web';
import {AUTH_SETTINGS} from 'shared/schema/Constants';
import {realtimeUtils} from '../Auth';
import {SetProfileMetaAction} from './ActionTypes';
import {loadQuestFromURL} from './Quest';
import {setSnackbar} from './Snackbar';

declare var window: any;

export function setProfileMeta(user: UserState): SetProfileMetaAction {
  return {type: 'SET_PROFILE_META', user};
}

export function loginUser(showPrompt: boolean, quest?: boolean | string): ((dispatch: Redux.Dispatch<any>) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    realtimeUtils.authorize((response: any) => {
      if (response.error) {
        return dispatch(setProfileMeta(loggedOutUser));
      }
      return loginWebBase(window.gapi, AUTH_SETTINGS.API_KEY, AUTH_SETTINGS.CLIENT_ID, AUTH_SETTINGS.SCOPES)
        .then((r) => {
          return registerUserAndIdToken(AUTH_SETTINGS.URL_BASE, r);
        })
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
    }, showPrompt);
  };
}

export function logoutUser(): ((dispatch: Redux.Dispatch<any>) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    window.gapi.auth.setToken(null);
    window.gapi.auth.signOut();

    // Remove document ID, so we get kicked back to home page.
    window.location.hash = '';

    window.location.reload();
  };
}
