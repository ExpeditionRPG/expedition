declare var utils: any;
declare var window: any;

export const realtimeUtils = new utils.RealtimeUtils({
  clientId: (process && process.env && process.env.OAUTH2_CLIENT_ID) || '',
  scopes: [ // https://developers.google.com/identity/protocols/googlescopes
    'https://www.googleapis.com/auth/drive.install', // ?
    'https://www.googleapis.com/auth/drive.file', // view and manage drive files opened / created in app
    'https://www.googleapis.com/auth/plus.login', // basic demographics
    'https://www.googleapis.com/auth/userinfo.email', // profile email
  ],
});

// Specifically request id_token response
realtimeUtils.authorizer.authorize = function(onAuthComplete: any, usePopup: any) {
  this.onAuthComplete = onAuthComplete;
  // Try with no popups first.
  window.gapi.auth.authorize({
    client_id: this.util.clientId,
    immediate: !usePopup,
    response_type: 'token id_token',
    scope: this.util.scopes,
  }, this.handleAuthResult);
};
