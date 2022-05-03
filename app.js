const { AppBase } = require("./appbase");

/**
 * This is main application class called from the index.js
 * See example.js for reference examples.
 */
class App extends AppBase {
  constructor(url, apitoken) {
    super(url, apitoken);
  }
  /**
   * Called when connection to coreserver is established
   */
  async onReady() {}
  /**
   * Called when a mirror is created. Can be used to setup callbacks on the mirror
   * to get change events.
   * @param {Mirror} mirror
   */
  async onMirrorCreated(mirror) {}
}

module.exports = { App };
