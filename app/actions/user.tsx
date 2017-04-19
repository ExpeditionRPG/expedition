import Redux from 'redux'
import {hashHistory} from 'react-router'

import {SetProfileMetaAction} from './ActionTypes'
import {UserState} from '../reducers/StateTypes'
import {loadQuestFromURL} from './quest'
import {realtimeUtils} from '../auth'

declare var window: any;


export function setProfileMeta(user: UserState): SetProfileMetaAction {
  return {type: 'SET_PROFILE_META', user};
}

export function loginUser(showPrompt: boolean): ((dispatch: Redux.Dispatch<any>)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
    realtimeUtils.authorize(function(response:any){
      if (response.error){
        dispatch(setProfileMeta({loggedIn: false}));
      } else {
        window.gapi.client.load('plus','v1', function(){
          var request = window.gapi.client.plus.people.get({
            'userId': 'me',
          });
          request.execute(function(res: any) {
            const user = {
              id_token: response.id_token,
              name: res.displayName,
              image: res.image.url,
              email: ((res.emails || [])[0] || {}).value,
            };
            $.post('/auth/google', JSON.stringify(user), (data) => {
              dispatch(setProfileMeta({
                loggedIn: true,
                id: data,
                displayName: user.name,
                image: user.image,
                email: user.email,
              }));

              loadQuestFromURL(res.id, dispatch);
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
    window.location.reload();
  }
}
