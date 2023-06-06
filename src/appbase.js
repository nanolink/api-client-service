const { Connection } = require("@nanolink/nanolink-tools/lib");

/**
 * Base application class
 * @date 6/2/2023 - 1:47:25 PM
 *
 * @class AppBase
 * @param {*} url - Url to nanolink core server
 * @param {*} apitoken - API security token
 * @typedef {AppBase}
 */
class AppBase {
  /**
   * Url to core server given by nanolink
   * @date 6/2/2023 - 1:47:25 PM
   *
   * @type {*}
   */
  url;
  /**
   * API token given by nanolink
   * @date 6/2/2023 - 1:47:25 PM
   *
   * @type {*}
   */
  apitoken;
  /**
   * Connection handler
   * @date 6/2/2023 - 1:47:25 PM
   *
   * @type {*}
   */
  connection;
  /**
   * Level db object
   * @date 6/2/2023 - 1:47:25 PM
   *
   * @type {*}
   */
  db;

  /**
   * Creates an instance of AppBase.
   * @date 6/2/2023 - 1:47:25 PM
   *
   * @constructor
   * @param {*} url
   * @param {*} apitoken
   */
  constructor(url, apitoken) {
    this.url = url;
    this.apitoken = apitoken;
  }

  /**
   * Description placeholder
   * @date 6/2/2023 - 1:47:25 PM
   *
   * @async
   * @returns {*}
   */
  async run() {
    this.connection = new Connection(this.url, this.apitoken);
    this.connection.onReady = this.callbackTo(this.onReady);
    this.connection.onMirrorCreated = this.callbackTo(this.onMirrorCreated);
    this.connection.onLogReady = this.callbackTo(this.onLogReady);
    await this.connection.connect(true);
  }
  /**
   * Call in an object making sure that this is correct
   * @date 6/2/2023 - 1:47:25 PM
   *
   * @param {*} f
   * @returns {(...p: {}) => any}
   */
  callbackTo(f) {
    return (...p) => f.apply(this, p);
  }
  /**
   * Called when connetion for core server is ready
   * @date 6/2/2023 - 1:53:59 PM
   *
   * @async
   * @param {*} customer - Customer info object containing customerId and companyName
   * @returns {*}
   */
  async onReady(customer) {}
  /**
   * Called when connection for 
   * @date 6/2/2023 - 1:47:25 PM
   *
   * @async
   * @returns {*}
   */
  async onLogReady() {}
  /**
   * Called when a mirror is ready and loaded
   * @date 6/2/2023 - 1:47:25 PM
   *
   * @async
   * @param {Mirror} mirror - Mirror object 
   * @returns {*}
   */
  async onMirrorCreated(mirror) {}
}

module.exports = { AppBase };
