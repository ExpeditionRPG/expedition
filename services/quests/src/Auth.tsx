declare var utils: any;
declare var window: any;

let instance: any;
// In testing environment, utils may not be loaded.
// We wrap this in a try{} statement so it is allowed to fail silently.
try {
  instance = utils && new utils.RealtimeUtils({
    clientId: (process && process.env && process.env.OAUTH2_CLIENT_ID) || '',
    scopes: [ // https://developers.google.com/identity/protocols/googlescopes
      'https://www.googleapis.com/auth/drive.install', // ?
      'https://www.googleapis.com/auth/drive.file', // view and manage drive files opened / created in app
      'https://www.googleapis.com/auth/userinfo.email', // profile email
    ],
  });

  // Specifically request id_token response
  instance.authorizer.authorize = function(onAuthComplete: any, usePopup: any) {
    this.onAuthComplete = onAuthComplete;
    // Try with no popups first.
    window.gapi.auth.authorize({
      client_id: this.util.clientId,
      immediate: !usePopup,
      response_type: 'token id_token',
      scope: this.util.scopes,
    }, this.handleAuthResult);
  };
} catch (e) {
  console.warn('RealtimeUtils error on load:', e);
}

export const realtimeUtils = instance;
