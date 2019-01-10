import {handleFetchErrors} from 'shared/requests';
import {UserState} from './UserState';
import {AuthResult} from './Web';

export function registerUserAndIdToken(urlBase: string, user: AuthResult): Promise<UserState> {
  return fetch(urlBase + '/auth/google', {
    body: JSON.stringify({
      email: user.email,
      id_token: user.idToken,
      image: user.image,
      name: user.name,
    }),
    credentials: 'include',
    headers: {
      'Content-Type': 'text/plain',
    },
    method: 'POST',
  })
  .then(handleFetchErrors)
  .then((response: Response) => response.text())
  .then((response: string) => {
    let userResult = {} as any;
    try {
      userResult = {
        id: response,
        ...JSON.parse(response),
      };
    } catch (err) {
      userResult.id = response;
    }

    return {
      email: user.email,
      id: userResult.id,
      image: user.image,
      loggedIn: true,
      name: user.name,
      lastLogin: new Date(userResult.lastLogin),
      loginCount: userResult.loginCount,
      lootPoints: userResult.lootPoints,
    };
  }).catch((error: Error) => {
    console.log('Request failed', error);
    throw new Error('Error authenticating.');
  });
}
