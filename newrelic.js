const config = require('./config');

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
//console.log("LICENSE KEY IS: " + config.get('NEW_RELIC_LICENSE_KEY'));
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['Expedition Quest Creator'],
  /**
   * Your New Relic license key.
   */
  license_key: config.get('NEW_RELIC_LICENSE_KEY') || '0',
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info'
  }
}
