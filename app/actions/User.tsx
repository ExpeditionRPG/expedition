import Redux from 'redux'
import {toCard} from './Card'
import {UserState} from '../reducers/StateTypes'
import {authSettings} from '../Constants'

declare var gapi: any;
declare var window: any;


function registerUserAndIdToken(user: {name: string, image: string, email: string}, idToken: string, cb: (user:UserState) => any) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', authSettings.urlBase + '/auth/google', true);
  xhr.setRequestHeader('Content-Type', 'text/plain');
  xhr.onload = function() {
    cb({
      loggedIn: true,
      id: xhr.responseText,
      name: user.name,
      image: user.image,
      email: user.email,
    });
  };
  xhr.withCredentials = true;
  xhr.send(JSON.stringify({id_token: idToken, name: user.name, image: user.image, email: user.email}));
}

function loginWeb(cb: (user:UserState) => any) {
  const that = this;
  gapi.auth2.getAuthInstance().signIn({redirect_uri: 'postmessage'}).then(function(googleUser: any) {
    const idToken: string = googleUser.getAuthResponse().id_token;
    const basicProfile: any = googleUser.getBasicProfile();
    registerUserAndIdToken({
      name: basicProfile.getName(), image: basicProfile.getImageUrl(), email: basicProfile.getEmail(),
    }, idToken, cb);
  });
}

function silentLoginWeb(cb: (user:UserState) => any) {
  const that = this;
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    const googleUser: any = gapi.auth2.getAuthInstance().currentUser.get();
    const idToken: string = googleUser.getAuthResponse().id_token;
    const basicProfile: any = googleUser.getBasicProfile();
    return registerUserAndIdToken({
      name: basicProfile.getName(), image: basicProfile.getImageUrl(), email: basicProfile.getEmail(),
    }, idToken, cb);
  }
  return cb(null);
}

function silentLoginCordova(cb: (user:UserState) => any) {
  if (!window.plugins || !window.plugins.googleplus) {
    return;
  }
  window.plugins.googleplus.trySilentLogin({
    scopes: authSettings.scopes,
    webClientId: authSettings.clientId,
  }, function(obj: any) {
    registerUserAndIdToken({
      name: obj.displayName,
      image: obj.imageUrl,
      email: obj.email,
    }, obj.idToken, cb);
  }, function(msg: string) {
    //TODO: Better error handling
    throw new Error(msg);
  });
}

function loginCordova(cb: (user:UserState) => any) {
  const that = this;
  window.plugins.googleplus.login({
    scopes: authSettings.scopes,
    webClientId: authSettings.clientId,
  }, function(obj: any) {
    registerUserAndIdToken({
      name: obj.displayName,
      image: obj.imageUrl,
      email: obj.email,
    }, obj.idToken, cb);
  }, function(msg: string) {
    //TODO: Better error handling
    throw new Error(msg);
  });
}

export function silentLogin(cb: () => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    let loginCallback = (user:UserState) => {
      dispatch({type: 'USER_LOGIN', user});
      cb();
    }

    if (window.plugins && window.plugins.googleplus) {
      silentLoginCordova(loginCallback);
    } else {
      silentLoginWeb(loginCallback);
    }
  }
}

export function login(cb: (user: UserState) => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    let loginCallback = (user: UserState) => {
      dispatch({type: 'USER_LOGIN', user});
      cb(user);
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
  logout: function(cb) {
    if (!this.isLoggedIn()) {
      return cb();
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.URL_BASE + "/auth/logout");
    var that = this;
    xhr.onload = function() {
      that.user = null;
      that.idToken = null;
      gapi.auth2.getAuthInstance().signOut().then(cb);
    };
    xhr.withCredentials = true;
    xhr.send();
  },
*/

