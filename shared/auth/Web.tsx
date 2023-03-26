import {handleFetchErrors} from 'shared/requests';
import {UserState} from './UserState';

// This is used for user authentication (NOT authorization). Required both by
// the quests and app, driven by the Login With Google button
export function registerUserAndIdToken(urlBase: string, id_token: string): Promise<UserState> {
  return fetch(urlBase + '/auth/google', {
    body: JSON.stringify({id_token}),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  .then(handleFetchErrors)
  .then((response: any) => response.json())
  .then((data: any) => {
    // {"setDefaults":["lootPoints","created","loginCount","lastLogin"],
    // "email":"smartin015@gmail.com",
    // "id":"106667818352266772866",
    // "name":"Scott Martin",
    // "lootPoints":0,
    // "created":"2023-03-26T19:19:07.950Z",
    // "loginCount":0,
    // "lastLogin":"1970-01-01T00:00:00.000Z"
    // }
    return {
      email: data.email,
      id: data.id,
      image: data.image,
      loggedIn: true,
      name: data.name,
      lastLogin: new Date(data.lastLogin),
      loginCount: data.loginCount,
      lootPoints: data.lootPoints,
    } as UserState;
  }).catch((error: Error) => {
    console.log('Request failed', error);
    throw new Error('Error authenticating.');
  });
}

export function codeClientAuth(google: any, jwt: string, urlBase: string, clientId: string, scopes: string) {
  if (!google) {
    throw Error('google GIS not loaded');
  }

  // const redirect_uri = urlBase + '/auth/google/callback';
  // console.log("Redirecting to", redirect_uri);

  // https://developers.google.com/identity/oauth2/web/reference/js-reference#CodeClient
  const client = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scopes,
    // ux_mode: 'popup',
    // Callback is invoked with a CredentialsResponse object
    // see https://developers.google.com/identity/gsi/web/reference/js-reference#CredentialResponse
    // redirect_uri,
    callback: (rep: any) => {
      // TODO google.accounts.oauth2.hasGrantedAllScopes
      // TODO send request to server
      const data = {id_token: jwt, access_token: rep.access_token};
      console.log('sending to /auth/google with', data);
      fetch(urlBase + '/auth/google', {
        body: JSON.stringify(data),
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      .then(handleFetchErrors)
      .then((rep: any) => {
        console.log('From API server:', rep);
      });
    },
    error_callback: (rep: any) => console.log(rep),
  });

  // Redirects user to authorization page, then to redirect URI with URL parameters set as
  // per https://developers.google.com/identity/oauth2/web/reference/js-reference#CodeResponse
  client.requestAccessToken();
}
