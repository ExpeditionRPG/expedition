const nconf = require('nconf');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../config.json');

console.log('Loading config from ' + CONFIG_PATH);

nconf.argv()
.env([
  // Quest storage config settings
  'DATABASE_URL', // URL of postgres database storing quest metadata, user data, feedback, etc.
  'SEQUELIZE_LOGGING', // Enable console logging of sequelize SQL queries

  // Feedback email sender config settings
  'MAIL_EMAIL',
  'MAIL_PASSWORD',

  // Authentication config settings
  'OAUTH2_CLIENT_ID',
  'OAUTH2_CLIENT_SECRET',

  // Web server config settings
  'PORT',
  'SESSION_SECRET',

  // Monitoring config settings
  'NEW_RELIC_LICENSE_KEY',

  // Stripe API key
  'STRIPE_PRIVATE_KEY',

  // (Optional) Pay-what-you-want config settings
  'ENABLE_PAYMENT',

  // (Optional) mailing list config settings
  'MAILCHIMP_KEY',
  'MAILCHIMP_CREATORS_LIST_ID',
  'MAILCHIMP_PLAYERS_LIST_ID',

  // Specify prod or dev environment.
  'NODE_ENV',

  // If we are to induce chaos and random drops into multiplayer (for testing only)
  'MULTIPLAYER_CHAOS',

  // The URL that points to this server.
  'API_URL_BASE',

  // Users allowed to access the admin pages
  'SUPER_USER_IDS',

  // Announcements
  'ANNOUNCEMENT_MESSAGE',
  'ANNOUNCEMENT_LINK',
])
.file({ file: CONFIG_PATH })
.defaults({
  DATABASE_URL: 'postgres://aaa:test.com:111/aaa',
  ENABLE_PAYMENT: false,
  OAUTH2_CALLBACK: 'http://localhost:8080/auth/google/callback',
  OAUTH2_CLIENT_ID: '',
  OAUTH2_CLIENT_SECRET: '',
  PORT: 8081,
  SESSION_SECRET: '',
  SEQUELIZE_LOGGING: true,
  SUPER_USER_IDS: [],
});

// Check for required settings
const REQUIRED_SETTINGS = [
  'DATABASE_URL',
  'OAUTH2_CLIENT_ID',
  'OAUTH2_CLIENT_SECRET',
  'SESSION_SECRET',
];

const missing = [];
for (const setting of REQUIRED_SETTINGS) {
  if (!nconf.get(setting) || nconf.get(setting) === '') {
    missing.push(setting);
  }
}
if (missing.length > 0) {
  console.warn('Cannot find the following config settings:\n\t' + missing.join('\n\t') +
    '\nSet them via environment variable or add them to a config.json file in the repository root.' +
    '\nSee "config-example.json" for an example config with all required fields.\n');
}

export default nconf;
