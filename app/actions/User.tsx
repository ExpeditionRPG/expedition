import Redux from 'redux'

import {API_HOST} from '../Constants'
import {SetProfileMetaAction} from './ActionTypes'
import {setSnackbar} from './Snackbar'
import {UserState} from '../reducers/StateTypes'
import {loadQuestFromURL} from './Quest'
import {realtimeUtils} from '../Auth'

declare var window: any;


export function setProfileMeta(user: UserState): SetProfileMetaAction {
  return {type: 'SET_PROFILE_META', user};
}

export function loginUser(showPrompt: boolean, quest?: boolean | string): ((dispatch: Redux.Dispatch<any>)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
    realtimeUtils.authorize((response:any) => {
      if (response.error){
        dispatch(setProfileMeta({loggedIn: false}));
      } else {
        window.gapi.client.load('plus','v1', () => {
          const request = window.gapi.client.plus.people.get({
            'userId': 'me',
          });
          request.execute((res: any) => {
            const googleUser = {
              id_token: response.id_token,
              name: res.displayName,
              image: res.image.url,
              email: ((res.emails || [])[0] || {}).value,
            };
            $.post(API_HOST + '/auth/google', JSON.stringify(googleUser))
                .done((data: any) => {
                  const user = {
                    loggedIn: true,
                    id: data,
                    displayName: googleUser.name,
                    image: googleUser.image,
                    email: googleUser.email,
                  };
                  dispatch(setProfileMeta(user));
                  if (user.email === null) {
                    alert('Issue logging in! Please contact support about user ID ' + user.id);
                  }
                  if (quest) {
                    if (quest === true) { // create a new quest
                      dispatch(loadQuestFromURL(user, null));
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
  }
}

export function logoutUser(): ((dispatch: Redux.Dispatch<any>)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
    window.gapi.auth.setToken(null);
    window.gapi.auth.signOut();

    // Remove document ID, so we get kicked back to home page.
    window.location.hash = '';

    window.location.reload();
  }
}
