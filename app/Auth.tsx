declare var utils: any;
declare var window: any;

export const realtimeUtils = new utils.RealtimeUtils({
  clientId: '545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com',
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
