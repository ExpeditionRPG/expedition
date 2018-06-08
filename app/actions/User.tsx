import Redux from 'redux'
import * as Raven from 'raven-js'
import {handleFetchErrors, fetchUserQuests} from './Web'
import {UserState, AppState} from '../reducers/StateTypes'
import {loggedOutUser} from '../reducers/User'
import {AUTH_SETTINGS} from '../Constants'
import {getGA, getGapi, getWindow, CordovaLoginPlugin} from '../Globals'

type LoadGapiResponse = {gapi: any, async: boolean};

let gapiLoaded = false;
function loadGapi(): Promise<LoadGapiResponse> {
  const gapi = getGapi();
  if (!gapi) {
    return Promise.reject(Error('gapi not loaded'));
  }
  if (gapiLoaded) {
    return Promise.resolve({gapi, async: false});
  }
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', {
      callback: () => resolve(),
      onerror: () => reject(Error('could not load gapi')),
    });
  })
  .then(() => {
    gapi.client.setApiKey(AUTH_SETTINGS.API_KEY);
    return gapi.auth2.init({
      client_id: AUTH_SETTINGS.CLIENT_ID,
      scope: AUTH_SETTINGS.SCOPES,
      cookie_policy: 'none',
    })
  })
  .then(() => {
    gapiLoaded = true;
    return {gapi, async: true}
  });
}

function registerUserAndIdToken(user: {name: string, image: string, email: string}, idToken: string): Promise<UserState> {
  return fetch(AUTH_SETTINGS.URL_BASE + '/auth/google', {
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
  .then((response: Response) => response.text())
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
    return {
      loggedIn: true,
      id,
      name: user.name,
      image: user.image,
      email: user.email,
      quests: {}, // Requested separately; cleared for now since it's a new user
    };
  }).catch((error: Error) => {
    console.log('Request failed', error);
    throw new Error('Error authenticating.');
  });
}

function loginWeb(): Promise<void> {
  return loadGapi()
  .then((r) => {
    // Since this is a user action, we can't show pop-ups if we get sidetracked loading,
    // so we'll attempt a silent login instead. If that fails, their next attempt should be instant.
    if (r.async) {
      return silentLoginWeb();
    }

    return r.gapi.auth2.getAuthInstance().signIn({redirect_uri: 'postmessage'})
    .then((googleUser: any) => {
      const idToken: string = googleUser.getAuthResponse().id_token;
      const basicProfile: any = googleUser.getBasicProfile();
      return registerUserAndIdToken({
        name: basicProfile.getName(),
        image: basicProfile.getImageUrl(),
        email: basicProfile.getEmail(),
      }, idToken);
    });
  });
}

function silentLoginWeb(): Promise<UserState|null> {
  return loadGapi()
  .then((r) => {
    if (!r.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      throw new Error('Failed to silently login');
    }

    const googleUser: any = r.gapi.auth2.getAuthInstance().currentUser.get();
    const idToken: string = googleUser.getAuthResponse().id_token;
    const basicProfile: any = googleUser.getBasicProfile();
    return registerUserAndIdToken({
      name: basicProfile.getName(),
      image: basicProfile.getImageUrl(),
      email: basicProfile.getEmail(),
    }, idToken);
  });
}

function silentLoginCordova(p: CordovaLoginPlugin): Promise<UserState|null> {
  return new Promise((resolve, reject) => {
    p.trySilentLogin({
      scopes: AUTH_SETTINGS.SCOPES,
      webClientId: AUTH_SETTINGS.CLIENT_ID,
    }, (obj: any) => {
      registerUserAndIdToken({
        name: obj.displayName,
        image: obj.imageUrl,
        email: obj.email,
      }, obj.idToken).then(resolve);
    }, (err: string) => {
      reject(Error(err));
    });
  });
}

function loginCordova(p: CordovaLoginPlugin): Promise<UserState> {
  return new Promise((resolve, reject) => {
    p.login({
      scopes: AUTH_SETTINGS.SCOPES,
      webClientId: AUTH_SETTINGS.CLIENT_ID,
    }, (obj: any) => {
      return registerUserAndIdToken({
        name: obj.displayName,
        image: obj.imageUrl,
        email: obj.email,
      }, obj.idToken).then(resolve);
    }, (err: string) => {
      reject(Error(err));
    });
  });
}

function getGooglePlusPlugin(): Promise<CordovaLoginPlugin> {
  return new Promise((resolve, reject) => {
    const plugins = getWindow().plugins;
    const googleplus = plugins && plugins.googleplus;
    if (!googleplus) {
      reject(Error('Cordova googleplus plugin not found'));
    }
    resolve(googleplus);
  });
}

// Update the user's logged in state.
// This should be called after every login attempt.
function updateState(dispatch: Redux.Dispatch<any>): ((u: UserState) => Promise<UserState>) {
  return (user: UserState) => {
    dispatch({type: 'USER_LOGIN', user});
    if (user) {
      // TODO: Rate-limit this
      dispatch(fetchUserQuests());
    }
    return Promise.resolve(user);
  };
}

// Prompt the user for login if user is not logged in already.
// Throws an error if login fails.
export function ensureLogin(): (dispatch: Redux.Dispatch<any>, getState: ()=>AppState) => Promise<UserState> {
  return (dispatch: Redux.Dispatch<any>, getState: ()=>AppState) => {
    const currentUser = getState().user;
    if (currentUser !== loggedOutUser) {
      return Promise.resolve(currentUser);
    }
    return getGooglePlusPlugin()
    .then((p) => loginCordova(p))
    .catch(() => loginWeb())
    .then(updateState(dispatch))
    .catch((err) => Promise.reject(err));
  };
}

// Returns user state if successfully logged in silently.
// Thows an error if login fails.
export function silentLogin(): (dispatch: Redux.Dispatch<any>, getState: ()=>AppState) => Promise<UserState> {
  return (dispatch: Redux.Dispatch<any>, getState: ()=>AppState) => {
    const currentUser = getState().user;
    if (currentUser !== loggedOutUser) {
      return Promise.resolve(currentUser);
    }
    return getGooglePlusPlugin()
      .then((p) => silentLoginCordova(p))
      .catch(() => silentLoginWeb())
      .then(updateState(dispatch));
  };
}
