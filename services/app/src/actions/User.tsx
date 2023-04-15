import * as Raven from 'raven-js';
import Redux from 'redux';
import {UserState as UserState} from 'shared/auth/UserState';
import {registerUserAndIdToken} from 'shared/auth/Web';
import {handleFetchErrors} from 'shared/requests';
import {Badge} from 'shared/schema/Constants';
import {AUTH_SETTINGS} from '../Constants';
import {getGA} from '../Globals';
import {AppState, IUserFeedback /*, UserState*/} from '../reducers/StateTypes';
import {fetchUserQuests} from './Web';

function postRegister(us: UserState) {
  const ga = getGA();
  if (ga) {
    ga.set({ userId: us.id });
  }
  Raven.setUserContext({id: us.id});
  return us;
}

export function sendAuthTokenToAPIServer(jwt: string): Promise<UserState> {
  return registerUserAndIdToken(AUTH_SETTINGS.URL_BASE, jwt).then(postRegister);
}

// Update the user's logged in state.
// This should be called after every login attempt.
export function updateState(dispatch: Redux.Dispatch<any>): ((u: UserState) => Promise<UserState>) {
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
      return dispatch({type: 'USER_BADGES', badges});
    })
    .catch(() => dispatch({type: 'USER_BADGES', badges: []}));
  };
}
