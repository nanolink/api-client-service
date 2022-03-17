const { StateSubscriptions } = require("../definitions/stateSubscriptions");

/**
 * Class to handle GPS updates.
 */
class GPSReceiver {
  handler;
  /**
   *
   * @param {SubscriptionHandler} handler - The main subscription handler
   */
  constructor(handler) {
    this.handler = handler;
  }
  /**
   *
   * @param {boolean} unwind - If true only single updates are sent to onDateReceived, otherwise it's an array
   */
  async run(unwind) {
    if (unwind) {
      let sub = this.handler.wrapBulk(
        await this.handler.subscribe(StateSubscriptions.gps),
        (n) => n.otrackers_getpositionsbulk
      );
      for await (let r of sub) {
        if (r.data) {
          this.onDataReceived(r.data);
        }
      }
    } else {
      let sub = await this.handler.subscribe(StateSubscriptions.gps);
      for await (let r of sub) {
        if (r.otrackers_getpositionsbulk.data) {
          this.onDataReceived(r.otrackers_getpositionsbulk.data);
        }
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
