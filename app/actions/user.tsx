import {hashHistory} from 'react-router';

import {SetProfileMetaAction} from './ActionTypes';
import {UserState} from '../reducers/StateTypes';
import {loadQuestFromURL} from './quest';
import {realtimeUtils} from '../auth';

declare var window: any;

function setProfileMeta(user: UserState): SetProfileMetaAction {
  return {type: 'SET_PROFILE_META', user};
}

export function loginUser(showPrompt: boolean): ((dispatch: Redux.Dispatch<any>)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
    realtimeUtils.authorize(function(response:any){
      if(response.error){
        dispatch(setProfileMeta({loggedIn: false}));
      } else {
        $.post('/auth/google', JSON.stringify({id_token: response.id_token, name: "Test", image: ""}), function(data) {
          dispatch(setProfileMeta({
            loggedIn: true,
            id: data,
            displayName: "Test",
            image: ""
          }));

          loadQuestFromURL(dispatch);
        });
      }
    }, showPrompt);
  }
}

export function logoutUser(): ((dispatch: Redux.Dispatch<any>)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
    window.gapi.auth.signOut();
    window.gapi.auth.setToken(null);
    window.gapi.auth2.getAuthInstance().signOut().then(function() {
      window.location.reload();
    });
  }
}