const { AppBase } = require("./appbase");

/**
 * This is main application class called from the index.js
 * See example.js for reference examples.
 * @date 6/2/2023 - 1:45:48 PM
 *
 * @class App
 * @param {*} url - Url to core server
 * @param {*} apitoken - API token
 * @extends {AppBase}
 */
class App extends AppBase {
  /**
   * Creates an instance of App.
   * @date 6/2/2023 - 1:45:33 PM
   *
   * @constructor
   * @param {*} url
   * @param {*} apitoken
   */
  constructor(url, apitoken) {
    super(url, apitoken);
  }
  /**
   * Called when connection to coreserver is established
   * @date 6/2/2023 - 1:46:56 PM
   *
   * @async
   * @returns {*}
   */
  async onReady(customer) {}
  /**
   * Called when a mirror is created. Can be used to setup callbacks on the mirror
   * to get change events.
   * @param {Mirror} mirror
   * @async
   * @returns {*}
   */
  async onMirrorCreated(mirror) {}
}

module.exports = { App };
