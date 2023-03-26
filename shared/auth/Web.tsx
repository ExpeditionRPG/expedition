import {handleFetchErrors} from 'shared/requests';
import {UserState} from './UserState';

let GSILoaded: UserState|undefined;
export function codeClientAuth(google: any, urlBase: string, clientId: string, scopes: string, loaded= GSILoaded): Promise<UserState> {
  if (!google) {
    return Promise.reject(Error('google GIS not loaded'));
  }
  if (loaded !== undefined) {
    return Promise.resolve(loaded);
  }

  google.accounts.oauth2.initCodeClient({
    client_id: clientId,
    scope: scopes,
    ux_mode: 'redirect',
    // Callback is invoked with a CredentialsResponse object
    // see https://developers.google.com/identity/gsi/web/reference/js-reference#CredentialResponse
    redirect_uri: urlBase + '/auth/google',
  });
}
