import {handleFetchErrors} from 'shared/requests';
import {UserState} from './UserState';

export function checkForLogin(urlBase: string): Promise<UserState|null> {
  return fetch(urlBase + '/auth/session', {credentials: 'include'}).then((response: any) => {
    if (response.status !== 200) {
      // Catch 401/500 errors, treat as not logged in and ignore
      return null;
    }
    return response.json();
  }).then((data: any) => {
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
    return null;
  });
}

// This is used for user authentication (NOT authorization). Required both by
// the quests and app, driven by the Login With Google button
export function registerUserAndIdToken(urlBase: string, idToken: string): Promise<UserState> {
  return fetch(urlBase + '/auth/google', {
    body: JSON.stringify({id_token: idToken}),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  .then(handleFetchErrors)
  .then((response: any) => response.json())
  .then((data: any) => {
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
    throw new Error('Error authenticating.');
  });
}

export function getAuthorizationToken(google: any, urlBase: string, clientId: string, scopes: string): Promise<any> {
  if (!google) {
    throw Error('google GIS not loaded');
  }
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: scopes,
      // Callback is invoked with a CredentialsResponse object
      // see https://developers.google.com/identity/gsi/web/reference/js-reference#CredentialResponse
      callback: (response: any) => {
        resolve(response);
      },
      error_callback: reject,
    });

    // Redirects user to authorization page, then to redirect URI with URL parameters set as
    // per https://developers.google.com/identity/oauth2/web/reference/js-reference#CodeResponse
    client.requestAccessToken();
  });
}

let gapiLoaded = false;
export function loadGapi(gapi: any, apiKey: string, loaded= gapiLoaded): Promise<any> {
  if (!gapi) {
    return Promise.reject(Error('gapi not loaded'));
  }
  if (loaded) {
    return Promise.resolve(gapi);
  }

  return new Promise((resolve, reject) => {
    gapi.load('client,drive-share', () => {
      resolve();
    });
  }).then(gapi.client.init({
    // NOTE: OAuth2 'scope' and 'client_id' parameters have moved to initTokenClient().
  })).then(() => {
    gapi.client.setApiKey(apiKey);
    gapiLoaded = true;
    return gapi;
  });
}
