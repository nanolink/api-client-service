const { Connection } = require("@nanolink/nanolink-tools/lib");
const { StateSubscriptions } = require("../definitions/stateSubscriptions");

/**
 * Class to handle GPS updates.
 */
class GPSReceiver {
  connection;
  /**
   *
   * @param {Connection} connection - The connection handler
   */
  constructor(connection) {
    this.connection = connection;
  }
  /**
   *
   * @param {boolean} unwind - If true only single updates are sent to onDateReceived, otherwise it's an array
   */
  async run(unwind) {
    let iter = await this.connection.subscribe(StateSubscriptions.gps, unwind);
    for await (let r of iter) {
      if (r.data) {
        this.onDataReceived(r.data);
      }
    }
  }
  /**
   *
   * @param {object | [object]} data - Set this callback to receive data.
   */
  onDataReceived(data) {}
}
module.exports = { GPSReceiver };
