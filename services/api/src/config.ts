const nconf = require('nconf');
const Path = require('path');

const CONFIG_PATH = Path.join(__dirname, '../config.json');

console.log('Loading config from ' + CONFIG_PATH);

nconf.argv()
.env([
  // Quest storage config settings
  'DATABASE_URL', // URL of postgres database storing quest metadata, user data, feedback, etc.
  'SEQUELIZE_LOGGING', // Enable console logging of sequelize SQL queries
  'SEQUELIZE_SSL',

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
  'QC_ANNOUNCEMENT_MESSAGE',
  'QC_ANNOUNCEMENT_LINK',
])
.file({ file: CONFIG_PATH })
.defaults({
  ENABLE_PAYMENT: false,
  OAUTH2_CALLBACK: 'http://localhost:8080/auth/google/callback',
  OAUTH2_CLIENT_ID: '',
  OAUTH2_CLIENT_SECRET: '',
  PORT: 8081,
  SEQUELIZE_LOGGING: true,
  SUPER_USER_IDS: [],
  SEQUELIZE_SSL: true,
});

export default nconf;
