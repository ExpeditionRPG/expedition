/*global gapi */
var ExpeditionAPI = {
  URL_BASE: "http://semartin.local:8080", //"http://expedition-quest-ide.appspot.com", //
  API_KEY: "AIzaSyCgvf8qiaVoPE-F6ZGqX6LzukBftZ6fJr8",
  SCOPES: "profile",
  CLIENT_ID: "545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com",
  user: null,
  init: function() {
    gapi.client.setApiKey(this.API_KEY);
    gapi.auth2.init({
        /* jshint ignore:start */
        client_id: this.CLIENT_ID,
        /* jshint ignore:end */
        scope: this.SCOPES
    }).then(function() {
      console.log(gapi.auth2.getAuthInstance().isSignedIn);
    });
  },
  isLoggedIn: function() {
    return (this.user !== null);
  },
  getLoggedInUser: function() {
    return this.user || null;
  },
  login: function(cb) {
    if (this.isLoggedIn()) {
      return cb(this.user);
    }
    if (window.plugins && window.plugins.googleplus) {
      this._loginCordova(cb);
    } else {
      this._loginWeb(cb);
    }
  },
  /* jshint ignore:start */
  _loginWeb: function(cb) {
    var that = this;
    gapi.auth2.getAuthInstance().signIn().then(function(googleUser) {
      var idToken = googleUser.getAuthResponse().id_token;
      var basicProfile = googleUser.getBasicProfile();
      that._registerUserAndIdToken({
        name: basicProfile.getName(), image: basicProfile.getImageUrl()
      }, idToken, cb);
    });
  },
  _silentLoginCordova: function(cb) {
    if (!window.plugins || !window.plugins.googleplus) {
      return;
    }
    window.plugins.googleplus.trySilentlogin({
      'scopes': this.SCOPES,
      'webClientId': this.CLIENT_ID
    }, function(obj) {
      // {"email","idToken","userId","displayName","familyName","givenName","imageUrl"}
      that._registerUserAndIdToken({
        name: obj.displayName, image: obj.imageUrl
      }, obj.idToken, function() {console.log("Silent sign in");});
    }, function(msg) {
      //TODO: Better error handling
      cb(new Error(msg));
    });
  },
  /* jshint ignore:end */
  _loginCordova: function(cb) {
    var that = this;
    window.plugins.googleplus.login({
      'scopes': this.SCOPES,
      'webClientId': this.CLIENT_ID
    }, function(obj) {
      // {"email","idToken","userId","displayName","familyName","givenName","imageUrl"}
      that._registerUserAndIdToken({
        name: obj.displayName, image: obj.imageUrl
      }, obj.idToken, cb);
    }, function(msg) {
      //TODO: Better error handling
      cb(new Error(msg));
    });
  },
  _registerUserAndIdToken: function(user, idToken, cb) {
    var that = this;
    that.idToken = idToken;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', that.URL_BASE + "/auth/google", true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onload = function() {
      that.user = {
        id: xhr.responseText,
        name: user.name,
        image: user.image
      };
      cb(that.user);
    };
    xhr.withCredentials = true;
    /* jshint ignore:start */
    xhr.send(JSON.stringify({id_token: that.idToken, name: user.name, image: user.image}));
    /* jshint ignore:end */
  },
  logout: function(cb) {
    if (!this.isLoggedIn()) {
      return cb();
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.URL_BASE + "/auth/logout");
    var that = this;
    xhr.onload = function() {
      that.user = null;
      that.idToken = null;
      gapi.auth2.getAuthInstance().signOut().then(cb);
    };
    xhr.withCredentials = true;
    xhr.send();
  },
  searchQuests: function(params, cb) {
    if (!this.isLoggedIn()) {
      return cb(new Error("Not logged in!"));
    }

    var xhr = new XMLHttpRequest();
    // TODO: Pagination
    xhr.open('POST', this.URL_BASE + "/quests", true);

    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onload = function() {
      cb(JSON.parse(xhr.responseText));
    };
    xhr.withCredentials = true;
    xhr.send(JSON.stringify(params));
  }
};


gapi.load('client:auth2', ExpeditionAPI.init.bind(ExpeditionAPI));