import * as React from 'react'
import Redux from 'redux'
import {SetProfileMetaAction} from './ActionTypes'
import {setSnackbar} from './Snackbar'
import {UserState} from '../reducers/StateTypes'
import {loggedOutUser} from '../reducers/User'
import {getGA, getGapi} from '../Globals'
import {authSettings} from '../Constants'

declare var gapi: any;
declare var window: any;

type UserLoginCallback = (user: UserState, err?: string) => any;

export function setProfileMeta(user: UserState): SetProfileMetaAction {
  return {type: 'SET_PROFILE_META', user};
}


export function handleFetchErrors(response: any) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

function registerUserAndIdToken(user: {name: string, image: string, email: string}, idToken: string, callback: UserLoginCallback) {
  fetch(authSettings.urlBase + '/auth/google', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      id_token: idToken,
      name: user.name,
      image: user.image,
      email: user.email,
    }),
  })
  .then(handleFetchErrors)
  .then((response: Response) => {
    return response.text();
  })
  .then((userResult: string) => {
    let id = '';
    try {
      id = JSON.parse(userResult).id || userResult;
    } catch(err) {
      id = userResult;
    }
    if (getGA()) {
      getGA().set({ userId: id });
    }
    callback({
      loggedIn: true,
      id,
      displayName: user.name,
      image: user.image,
      email: user.email,
    });
  }).catch((error: Error) => {
    console.log('Request failed', error);
    callback(loggedOutUser, 'Error authenticating.');
  });
}

function loadGapi(callback: (gapi: any, async: boolean) => void) {
  const gapi = getGapi();
  if (!gapi) {
    return;
  }
  if (window.gapiLoaded) {
    return callback(gapi, false);
  }

  gapi.load('client:auth2', () => {
    gapi.client.setApiKey(authSettings.apiKey);
    gapi.auth2.init({
      client_id: authSettings.clientId,
      scope: authSettings.scopes,
      cookie_policy: 'none',
    }).then(() => {
      window.gapiLoaded = true;
      return callback(gapi, true);
    });
  });
}

function loginWeb(callback: UserLoginCallback) {
  loadGapi((gapi, async) => {
    // Since this is a user action, we can't show pop-ups if we get sidetracked loading,
    // so we'll attempt a silent login instead. If that fails, their next attempt should be instant.
    if (async) {
      return silentLoginWeb(callback);
    }
    gapi.auth2.getAuthInstance().signIn({redirect_uri: 'postmessage'}).then((googleUser: any) => {
      const idToken: string = googleUser.getAuthResponse().id_token;
      const basicProfile: any = googleUser.getBasicProfile();
      registerUserAndIdToken({
        name: basicProfile.getName(),
        image: basicProfile.getImageUrl(),
        email: basicProfile.getEmail(),
      }, idToken, callback);
    });
  });
}

function silentLoginWeb(callback: UserLoginCallback) {
  loadGapi((gapi, async) => {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      const googleUser: any = gapi.auth2.getAuthInstance().currentUser.get();
      const idToken: string = googleUser.getAuthResponse().id_token;
      const basicProfile: any = googleUser.getBasicProfile();
      return registerUserAndIdToken({
        name: basicProfile.getName(),
        image: basicProfile.getImageUrl(),
        email: basicProfile.getEmail(),
      }, idToken, callback);
    }
    return callback(loggedOutUser);
  });
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

export function silentLogin(callback: (user: UserState) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    const loginCallback: UserLoginCallback = (user: UserState, err?: string) => {
      // Since it's silent, do nothing with error
      dispatch({type: 'USER_LOGIN', user});
      callback(user);
    };
    silentLoginWeb(loginCallback);
  };
}

export function login(callback: (user: UserState) => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const loginCallback: UserLoginCallback = (user: UserState, err?: string) => {
      if (err) {
        return dispatch(setSnackbar(true, <span>Error logging in: {err}</span>));
      }
      dispatch({type: 'USER_LOGIN', user});
      callback(user);
    }
    loginWeb(loginCallback);
  };
}

export function logout() {
  return (dispatch: Redux.Dispatch<any>): any => {
    console.log('TODO LOGOUT');
    dispatch({type: 'USER_LOGOUT'});
  };
}
