/*global gapi */
var ExpeditionAPI = {
  URL_BASE: "http://semartin.local:8080", //"http://expedition-quest-ide.appspot.com",
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
    var that = this;
    gapi.auth2.getAuthInstance().signIn().then(function(googleUser) {
      /* jshint ignore:start */
      that.idToken = googleUser.getAuthResponse().id_token;
      /* jshint ignore:end */
      var basicProfile = googleUser.getBasicProfile();
      var xhr = new XMLHttpRequest();
      xhr.open('POST', that.URL_BASE + "/auth/google", true);
      xhr.setRequestHeader('Content-Type', 'text/plain');
      xhr.onload = function() {
        that.user = {
          id: xhr.responseText,
          name: basicProfile.getName(),
          image: basicProfile.getImageUrl()
        };
        cb(that.user);
      };
      xhr.withCredentials = true;
      /* jshint ignore:start */
      xhr.send(JSON.stringify({id_token: that.idToken, name: basicProfile.getName(), image: basicProfile.getImageUrl()}));
      /* jshint ignore:end */
    });
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
      throw new Error("Not logged in!");
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