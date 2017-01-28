declare var utils: any;
declare var window: any;

export var realtimeUtils = new utils.RealtimeUtils({
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

// streamline the auth refresh code, using an interval so that it's immune to errors in .authorize
// TODO once main lib adds this, remove here
realtimeUtils.authorizer.refreshAuth = function() {
  var that = realtimeUtils.authorizer;
  that.authTimer = setInterval(function() {
    that.authorize(function() {
      console.log('Refreshed Auth Token');
    }, false);
  }, that.util.refreshInterval);
};

// temporary fix until main lib is fixed
// TODO once main lib adds this, remove here
realtimeUtils.onError = function(error: any) {
  var that = realtimeUtils.authorizer;
  if (error.type == window.gapi.drive.realtime.ErrorType
      .TOKEN_REFRESH_REQUIRED) {
    that.authorize(function() { // the line that fixes it
      console.log('Error, auth refreshed');
    }, false);
  } else if (error.type == window.gapi.drive.realtime.ErrorType
      .CLIENT_ERROR) {
    alert('An Error happened: ' + error.message);
    window.location.href = '/';
  } else if (error.type == window.gapi.drive.realtime.ErrorType.NOT_FOUND) {
    alert('The file was not found. It does not exist or you do not have ' +
      'read access to the file.');
    window.location.href = '/';
  } else if (error.type == window.gapi.drive.realtime.ErrorType.FORBIDDEN) {
    alert('You do not have access to this file. Try having the owner share' +
      'it with you from Google Drive.');
    window.location.href = '/';
  }
};
