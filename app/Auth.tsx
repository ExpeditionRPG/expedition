declare var utils: any;
declare var window: any;

const Config = require('../config.json');

export const realtimeUtils = new utils.RealtimeUtils({
  clientId: process.env.OAUTH2_CLIENT_ID || Config.OAUTH2_CLIENT_ID,
  scopes: [ // https://developers.google.com/identity/protocols/googlescopes
    'https://www.googleapis.com/auth/drive.install', // ?
    'https://www.googleapis.com/auth/drive.file', // view and manage drive files opened / created in app
    'https://www.googleapis.com/auth/plus.login', // basic demographics
    'https://www.googleapis.com/auth/userinfo.email', // profile email
  ],
});

// Specifically request id_token response
realtimeUtils.authorizer.authorize = function(onAuthComplete: any, usePopup: any) {
  var that = realtimeUtils.authorizer;
  that.onAuthComplete = onAuthComplete;
  // Try with no popups first.
  window.gapi.auth.authorize({
    client_id: that.util.clientId,
    scope: that.util.scopes,
    response_type: 'token id_token',
    immediate: !usePopup,
  }, that.handleAuthResult);
};
