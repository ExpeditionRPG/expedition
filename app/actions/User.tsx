import Redux from 'redux'
import * as Raven from 'raven-js'
import {remoteify} from './ActionTypes'
import {toCard} from './Card'
import {handleFetchErrors} from './Web'
import {openSnackbar} from './Snackbar'
import {UserState} from '../reducers/StateTypes'
import {loggedOutUser} from '../reducers/User'
import {authSettings} from '../Constants'
import {getGA, getGapi} from '../Globals'

declare var gapi: any;
declare var window: any;

type UserLoginCallback = (user: UserState, err?: string) => any;

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
    Raven.setUserContext({id});
    callback({
      loggedIn: true,
      id,
      name: user.name,
      image: user.image,
      email: user.email,
    });
  }).catch((error: Error) => {
    console.log('Request failed', error);
    callback(loggedOutUser, 'Error authenticating.');
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

function silentLoginCordova(callback: UserLoginCallback) {
  if (!window.plugins || !window.plugins.googleplus) {
    return;
  }
  window.plugins.googleplus.trySilentLogin({
    scopes: authSettings.scopes,
    webClientId: authSettings.clientId,
  }, (obj: any) => {
    registerUserAndIdToken({
      name: obj.displayName,
      image: obj.imageUrl,
      email: obj.email,
    }, obj.idToken, callback);
  }, (err: string) => {
    callback(loggedOutUser, err);
  });
}

function loginCordova(callback: UserLoginCallback) {
  window.plugins.googleplus.login({
    scopes: authSettings.scopes,
    webClientId: authSettings.clientId,
  }, (obj: any) => {
    registerUserAndIdToken({
      name: obj.displayName,
      image: obj.imageUrl,
      email: obj.email,
    }, obj.idToken, callback);
  }, (err: string) => {
    callback(loggedOutUser, err);
  });
}

export function silentLogin(a: {callback?: (user: UserState) => void}) {
  return (dispatch: Redux.Dispatch<any>) => {
    const loginCallback: UserLoginCallback = (user: UserState, err?: string) => {
      // Since it's silent, do nothing with error
      dispatch({type: 'USER_LOGIN', user});
      a.callback && a.callback(user);
    };

    if (window.plugins && window.plugins.googleplus) {
      silentLoginCordova(loginCallback);
    } else {
      silentLoginWeb(loginCallback);
    }
  };
}

export function login(a: {callback: (user: UserState) => any}) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const loginCallback: UserLoginCallback = (user: UserState, err?: string) => {
      if (err) {
        return dispatch(openSnackbar('Error logging in: ' + err));
      }
      dispatch({type: 'USER_LOGIN', user});
      a.callback(user);
    }

    if (window.plugins && window.plugins.googleplus) {
      loginCordova(loginCallback);
    } else {
      loginWeb(loginCallback);
    }
  };
}

export function logout() {
  return (dispatch: Redux.Dispatch<any>): any => {
    console.log('TODO LOGOUT');
    dispatch({type: 'USER_LOGOUT'});
  };
}

/*
  logout: function(callback) {
    if (!this.isLoggedIn()) {
      return callback();
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.URL_BASE + "/auth/logout");
    var that = this;
    xhr.onload = function() {
      that.user = null;
      that.idToken = null;
      gapi.auth2.getAuthInstance().signOut().then(callback);
    };
    xhr.withCredentials = true;
    xhr.send();
  },
*/

