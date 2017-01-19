declare var window:any;

export const authSettings = {
  urlBase: "http://quests.expeditiongame.com",
  // urlBase: "http://devquests.expeditiongame.com",
  // urlBase: "http://localhost:8080",
  apiKey: "AIzaSyCgvf8qiaVoPE-F6ZGqX6LzukBftZ6fJr8",
  scopes: "profile",
  // web:
  clientId: "545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com",
  // iOS: (REVERSE_CLIENT_ID)
  // clientId: "545484140970-lgcbm3df469kscbngg2iof57muj3p588.apps.googleusercontent.com",
  // Android:
  // 545484140970-qrhcn069bbvae1mub2237h5k32mnp04k.apps.googleusercontent.com
};

export const URLS = {
  android: 'https://play.google.com/store/apps/details?id=io.fabricate.expedition',
  feedback: 'http://www.expeditiongame.com/contact/?utm_source=app&utm_medium=' + window.platform,
  ios: 'https://itunes.apple.com/us/app/expedition-roleplaying-card/id1085063478?ls=1&mt=8',
};
