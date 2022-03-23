const { Connection } = require("@nanolink/nanolink-tools/lib");
const { StateSubscriptions } = require("../definitions/stateSubscriptions");

/**
 * Class for handling transmitterlinks
 */
class TransmitterLinksReceiver {
  connection;
  receiverTypes;
  onlyWhenNearestChange;
  /**
   *
   * @param {Connection} connection - The connection handler
   * @param {string} receiverTypes - Array of tracker types. Valid values: BLE_TRACKER, GPS_TRACKER, GPS_GATE_TRACKER, LAN_GATE_TRACKER, MOBILE_TRACKER, MESH_GATE_TRACKER, CROWD_TRACKER
   * @param {boolean} onlyWhenNearestChange Tells the subscription to only sent updates if the nearest link changes.
   */
  constructor(connection, receiverTypes, onlyWhenNearestChange) {
    this.connection = connection;
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
    let iter = await this.connection.subscribe(
      StateSubscriptions.transmitterLinks(
        includeLinks,
        includeNewest,
        includeNearest
      ),
      {
        subscribe: true,
        receiverTypes: this.receiverTypes,
        onlyWhenNearestChange: this.onlyWhenNearestChange,
      },
      unwind
    );
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
module.exports = { TransmitterLinksReceiver };
