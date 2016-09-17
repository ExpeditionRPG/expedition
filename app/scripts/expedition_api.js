var ExpeditionAPI = {
  URL_BASE: "http://localhost:8080", //"http://expedition-quest-ide.appspot.com",
  API_KEY: "AIzaSyCgvf8qiaVoPE-F6ZGqX6LzukBftZ6fJr8",
  SCOPES: "profile",
  CLIENT_ID: "545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com",
  user: null,
  init: function() {
    gapi.client.setApiKey(this.API_KEY);
    gapi.auth2.init({
        client_id: this.CLIENT_ID,
        scope: this.SCOPES
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
      that.id_token = googleUser.getAuthResponse().id_token;
      var basic_profile = googleUser.getBasicProfile();
      var xhr = new XMLHttpRequest();
      xhr.open('POST', that.URL_BASE + "/auth/google", true);
      xhr.setRequestHeader('Content-Type', 'text/plain');
      xhr.onload = function() {
        that.user = {
          id: xhr.responseText,
          name: basic_profile.getName(),
          image: basic_profile.getImageUrl()
        }
        cb(that.user);
      };
      xhr.withCredentials = true;
      xhr.send(JSON.stringify({id_token: that.id_token, name: basic_profile.getName(), image: basic_profile.getImageUrl()}));
    });
  },
  logout: function(cb) {
    gapi.auth2.getAuthInstance().signOut().then(cb);
  },
  logout: function(cb) {
    if (!this.isLoggedIn()) {
      return cb();
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', URL_BASE + "/auth/logout");
    xhr.onload = function() {
      that.user = null;
      that.id_token = null;
      cb();
    };
    xhr.withCredentials = true;
    xhr.send();
  },
  getOwnedQuests: function(cb) {
    if (!this.isLoggedIn()) {
      throw new Error("Not logged in!");
    }
    var xhr = new XMLHttpRequest();
    // TODO: Pagination
    xhr.open('GET', this.URL_BASE + "/quests/0", true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onload = function() {
      cb(JSON.parse(xhr.responseText));
    };
    xhr.withCredentials = true;
    xhr.send();
  },
  searchPublishedQuests: function(search) {
    console.log("TODO");
  }
}


gapi.load('client:auth2', ExpeditionAPI.init.bind(ExpeditionAPI));