import Redux from 'redux'
import {toCard} from './Card'
import {openSnackbar} from '../actions/Snackbar'
import {UserState} from '../reducers/StateTypes'
import {authSettings} from '../Constants'

declare var gapi: any;
declare var window: any;

type UserLoginCallback = (user: UserState, err?: string) => any;


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
  .then((response: Response) => {
    return response.text();
  })
  .then((id: string) => {
    callback({
      loggedIn: true,
      id,
      name: user.name,
      image: user.image,
      email: user.email,
    });
  }).catch((error: Error) => {
    console.log('Request failed', error);
    callback(null, 'Error authenticating.');
  });
}

function loginWeb(callback: UserLoginCallback) {
  const that = this;
  gapi.auth2.getAuthInstance().signIn({redirect_uri: 'postmessage'}).then((googleUser: any) => {
    const idToken: string = googleUser.getAuthResponse().id_token;
    const basicProfile: any = googleUser.getBasicProfile();
    registerUserAndIdToken({
      name: basicProfile.getName(),
      image: basicProfile.getImageUrl(),
      email: basicProfile.getEmail(),
    }, idToken, callback);
  });
}

function silentLoginWeb(callback: UserLoginCallback) {
  const that = this;
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
  return callback(null);
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
    callback(null, err);
  });
}

function loginCordova(callback: UserLoginCallback) {
  const that = this;
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
    callback(null, err);
  });
}

export function silentLogin(callback: () => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const loginCallback: UserLoginCallback = (user: UserState, err?: string) => {
      // Since it's silent, do nothing with error
      dispatch({type: 'USER_LOGIN', user});
      callback();
    }

    if (window.plugins && window.plugins.googleplus) {
      silentLoginCordova(loginCallback);
    } else {
      silentLoginWeb(loginCallback);
    }
  }
}

export function login(callback: (user: UserState) => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const loginCallback: UserLoginCallback = (user: UserState, err?: string) => {
      if (err) {
        return dispatch(openSnackbar('Error logging in: ' + err));
      }
      dispatch({type: 'USER_LOGIN', user});
      callback(user);
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

