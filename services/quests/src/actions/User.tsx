import Redux from 'redux';

import {realtimeUtils} from '../Auth';
import {API_HOST} from '../Constants';
import {UserState} from '../reducers/StateTypes';
import {loggedOutUser} from '../reducers/User';
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
        dispatch(setProfileMeta(loggedOutUser));
      } else {
        window.gapi.client.load('plus', 'v1', () => {
          const request = window.gapi.client.plus.people.get({
            userId: 'me',
          });
          request.execute((res: any) => {
            const googleUser = {
              email: ((res.emails || [])[0] || {}).value,
              id_token: response.id_token,
              image: res.image.url,
              name: res.displayName,
            };
            $.post(API_HOST + '/auth/google', JSON.stringify(googleUser))
              .done((data: any) => {
                const user = {
                  displayName: googleUser.name,
                  email: googleUser.email,
                  id: '',
                  image: googleUser.image,
                  loggedIn: true,
                  lootPoints: 0,
                };
                try {
                  data = JSON.parse(data);
                  user.id = data.id;
                  user.lootPoints = data.lootPoints;
                } catch (err) {
                  user.id = data;
                }

                dispatch(setProfileMeta(user));
                if (user.email === null) {
                  alert('Issue logging in! Please contact support about user ID ' + user.id);
                }
                if (quest) {
                  if (quest === true) { // create a new quest
                    dispatch(loadQuestFromURL(user, undefined));
                  } else if (typeof quest === 'string') {
                    dispatch(loadQuestFromURL(user, quest));
                  }
                }
              })
              .fail((xhr: any, status: string) => {
                dispatch(setSnackbar(true, 'Login error ' + status + ' - please report via Contact Us button!'));
              });
          });
        });
      }
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
