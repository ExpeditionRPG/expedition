import * as Raven from 'raven-js';
import Redux from 'redux';
import {registerUserAndIdToken} from 'shared/auth/API';
import {UserState as UserStateAuth} from 'shared/auth/UserState';
import {loggedOutUser} from 'shared/auth/UserState';
import {loginWeb as loginWebBase, silentLoginWeb as silentLoginWebBase} from 'shared/auth/Web';
import {handleFetchErrors} from 'shared/requests';
import {Badge} from 'shared/schema/Constants';
import {AUTH_SETTINGS} from '../Constants';
import {CordovaLoginPlugin, getGA, getGapi, getWindow} from '../Globals';
import {AppState, IUserFeedback, UserState} from '../reducers/StateTypes';
import {openSnackbar} from './Snackbar';
import {fetchUserQuests} from './Web';

function postRegister(us: UserStateAuth) {
  const ga = getGA();
  if (ga) {
    ga.set({ userId: us.id });
  }
  Raven.setUserContext({id: us.id});
  return us;
}

function loginWeb(): Promise<UserState|null> {
  return loginWebBase(getGapi(), AUTH_SETTINGS.API_KEY, AUTH_SETTINGS.CLIENT_ID, AUTH_SETTINGS.SCOPES)
    .then((r) => {
      return registerUserAndIdToken(AUTH_SETTINGS.URL_BASE, r);
    })
    .then(postRegister);
}

function silentLoginWeb(): Promise<UserState|null> {
  return silentLoginWebBase(getGapi(), AUTH_SETTINGS.API_KEY, AUTH_SETTINGS.CLIENT_ID, AUTH_SETTINGS.SCOPES)
    .then((r) => {
      return registerUserAndIdToken(AUTH_SETTINGS.URL_BASE, r);
    })
    .then(postRegister);
}

function silentLoginCordova(p: CordovaLoginPlugin): Promise<UserState|null> {
  return new Promise((resolve, reject) => {
    p.trySilentLogin({
      scopes: AUTH_SETTINGS.SCOPES,
      webClientId: AUTH_SETTINGS.CLIENT_ID,
    }, (obj: any) => {
      registerUserAndIdToken(AUTH_SETTINGS.URL_BASE, {
        email: obj.email,
        image: obj.imageUrl,
        name: obj.displayName,
        idToken: obj.idToken,
      }).then(resolve);
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
      return registerUserAndIdToken(AUTH_SETTINGS.URL_BASE, {
        email: obj.email,
        image: obj.imageUrl,
        name: obj.displayName,
        idToken: obj.idToken,
      }).then(resolve);
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
  return (user) => {
    dispatch({type: 'USER_LOGIN', user});
    if (user) {
      // TODO: Rate-limit this
      dispatch(fetchUserQuests());
    }
    return Promise.resolve(user);
  };
}

function fetchUserFeedbacks(): Promise<IUserFeedback[]> {
  return fetch(AUTH_SETTINGS.URL_BASE + '/user/feedbacks', {
    credentials: 'include',
    headers: {
      'Content-Type': 'text/plain',
    },
    method: 'GET',
  })
  .then(handleFetchErrors)
  .then((response: Response) => response.json())
  .then((feedbacks: IUserFeedback[]) => feedbacks);
}

function fetchUserBadges(): Promise<Badge[]> {
  return fetch(AUTH_SETTINGS.URL_BASE + '/user/badges', {
    credentials: 'include',
    headers: {
      'Content-Type': 'text/plain',
    },
    method: 'GET',
  })
  .then(handleFetchErrors)
  .then((response: Response) => response.json())
  .then((badges: Badge[]) => badges);
}

type TReduxThunk<ReturnType> = (dispatch: Redux.Dispatch<any>, getState: () => AppState) => ReturnType;

export function logoutUser(): TReduxThunk<Promise<void>> {
  return (dispatch) => {
    const gapi = getGapi();
    const auth2 = gapi.auth2.getAuthInstance();
    return auth2.signOut().then(() => {
      dispatch({type: 'USER_LOGOUT'});
      dispatch(openSnackbar('You are successfully logged out'));
    });
  };
}

// Prompt the user for login if user is not logged in already.
// Throws an error if login fails.
export function ensureLogin(): TReduxThunk<Promise<UserState>> {
  return (dispatch, getState) => {
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
export function silentLogin(): TReduxThunk<Promise<UserState>> {
  return (dispatch, getState) => {
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

export function getUserFeedBacks(): TReduxThunk<Promise<any>> {
  return (dispatch) => {
    return fetchUserFeedbacks()
    .then((feedbacks: IUserFeedback[]) => dispatch({type: 'USER_FEEDBACKS', feedbacks}))
    .catch(() => dispatch({type: 'USER_FEEDBACKS', feedbacks: []}));
  };
}

export function getUserBadges(): TReduxThunk<Promise<any>> {
  return (dispatch) => {
    return fetchUserBadges()
    .then((badges: Badge[]) => {
      console.log(badges);
      return dispatch({type: 'USER_BADGES', badges});
    })
    .catch(() => dispatch({type: 'USER_BADGES', badges: []}));
  };
}
