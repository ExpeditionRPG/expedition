declare var utils: any;
declare var window: any;

export var realtimeUtils = new utils.RealtimeUtils({
  clientId: "545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com",
  scopes: [
    'https://www.googleapis.com/auth/drive.install',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/plus.login'
  ],
});

// Specifically request id_token response
realtimeUtils.authorizer.authorize = function(onAuthComplete: any, usePopup: any) {
  this.onAuthComplete = onAuthComplete;
  // Try with no popups first.
  window.gapi.auth.authorize({
    client_id: this.util.clientId,
    scope: this.util.scopes,
    response_type: 'token id_token',
    immediate: !usePopup
  }, this.handleAuthResult);
};