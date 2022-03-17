const { StateSubscriptions } = require("../definitions/stateSubscriptions");

/**
 * Class for handling transmitterlinks
 */
class TransmitterLinksReceiver {
  handler;
  receiverTypes;
  onlyWhenNearestChange;
  /**
   *
   * @param {SubscriptionHandler} handler - The main subscription handler
   * @param {string} receiverTypes - Array of tracker types. Valid values: BLE_TRACKER, GPS_TRACKER, GPS_GATE_TRACKER, LAN_GATE_TRACKER, MOBILE_TRACKER, MESH_GATE_TRACKER, CROWD_TRACKER
   * @param {boolean} onlyWhenNearestChange Tells the subscription to only sent updates if the nearest link changes.
   */
  constructor(handler, receiverTypes, onlyWhenNearestChange) {
    this.handler = handler;
    this.receiverTypes = receiverTypes;
    this.onlyWhenNearestChange = onlyWhenNearestChange;
  }
  /**
   *
   * @param {boolean} unwind - If true only single updates are sent to onDateReceived, otherwise it's an array
   * @param {boolean} includeLinks - If true the specific links are resolved
   * @param {boolean} includeNewest - If true the newest link is resolved
   * @param {boolean} includeNearest - if true the nearest link is resolved according to RSSI
   */
  async run(unwind, includeLinks, includeNewest, includeNearest) {
    if (unwind) {
      let sub = this.handler.wrapBulk(
        await this.handler.subscribe(
          StateSubscriptions.transmitterLinks(
            includeLinks,
            includeNewest,
            includeNearest
          ),
          {
            subscribe: true,
            receiverTypes: this.receiverTypes,
            onlyWhenNearestChange: this.onlyWhenNearestChange,
          }
        ),
        (n) => n.otrackers_transmitterlinksbulk
      );
      for await (let r of sub) {
        if (r.data) {
          this.onDataReceived(r.data);
        }
      }
    } else {
      let sub = await this.handler.subscribe(
        StateSubscriptions.transmitterLinks(
          includeLinks,
          includeNewest,
          includeNearest
        ),
        {
          subscribe: true,
          receiverTypes: this.receiverTypes,
          onlyWhenNearestChange: this.onlyWhenNearestChange,
        }
      );
      for await (let r of sub) {
        if (r.otrackers_transmitterlinksbulk.data) {
          this.onDataReceived(r.otrackers_transmitterlinksbulk.data);
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
module.exports = { TransmitterLinksReceiver };
