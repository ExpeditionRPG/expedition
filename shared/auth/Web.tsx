
interface LoadGapiResponse {gapi: any; async: boolean; }

export interface AuthResult {
  email: string;
  image: string;
  name: string;
  idToken: string;
}

let gapiLoaded = false;
export function loadGapi(gapi: any, apiKey: string, clientId: string, scopes: string, loaded= gapiLoaded): Promise<LoadGapiResponse> {
  if (!gapi) {
    return Promise.reject(Error('gapi not loaded'));
  }
  if (loaded) {
    return Promise.resolve({gapi, async: false});
  }
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', {
      callback: () => resolve(),
      onerror: () => reject(Error('could not load gapi')),
    });
  })
  .then(() => {
    gapi.client.setApiKey(apiKey);
    return gapi.auth2.init({
      clientId,
      cookie_policy: 'none',
      scope: scopes,
    });
  })
  .then(() => {
    gapiLoaded = true;
    return {gapi, async: true};
  });
}

function googleUserToAuthResult(googleUser: any): AuthResult {
  const idToken: string = googleUser.getAuthResponse().id_token;
  const basicProfile: any = googleUser.getBasicProfile();
  return {
    email: basicProfile.getEmail(),
    image: basicProfile.getImageUrl(),
    name: basicProfile.getName(),
    idToken,
  };
}

export function loginWeb(gapi: any, apiKey: string, clientId: string, scopes: string, load= loadGapi): Promise<AuthResult> {
  return load(gapi, apiKey, clientId, scopes)
  .then((r) => {
    // Since this is a user action, we can't show pop-ups if we get sidetracked loading,
    // so we'll attempt a silent login instead. If that fails, their next attempt should be instant.
    if (r.async) {
      return silentLoginWeb(gapi, apiKey, clientId, scopes, load);
    }
    return r.gapi.auth2.getAuthInstance().signIn({redirect_uri: 'postmessage'}).then(googleUserToAuthResult);
  });
}

export function silentLoginWeb(gapi: any, apiKey: string, clientId: string, scopes: string, load= loadGapi): Promise<AuthResult> {
  return load(gapi, apiKey, clientId, scopes)
  .then((r) => {
    if (!r.gapi.auth2.getAuthInstance().isSignedIn.get()) {
      throw new Error('Failed to silently login');
    }

    return r.gapi.auth2.getAuthInstance().currentUser.get();
  }).then(googleUserToAuthResult);
}
