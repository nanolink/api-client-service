const level = require("level");
const { Connection } = require("@nanolink/nanolink-tools/lib");
const { Subscriptions } = require("./definitions/mirrors");
const { GPSReceiver } = require("./receivers/gpsReceivers");
const {
  TransmitterLinksReceiver,
} = require("./receivers/transmitterLinksReceiver");
const {
  StatesReceiverDouble,
  DoubleFields,
} = require("./receivers/statesReceiver");

const VolageRanges = [
  { Low: 0.0, High: 13.0 },
  { Low: 16.0, High: 25.0 },
];

function Ignition(voltage) {
  let retVal = true;
  for (let n of VolageRanges) {
    if (voltage >= n.Low && voltage < n.High) {
      retVal = false;
      break;
    }
  }
  return retVal;
}

/**
 *  The main application class.
 */
class App {
  url;
  apitoken;
  connect;
  db;
  references;
  trackers;

  constructor(url, apitoken) {
    console.log(url);
    this.url = url;
    this.apitoken = apitoken;
    this.db = level("./data");
  }
  /**
   * Starts the application
   */
  async run() {
    this.connect = new Connection(this.url, this.apitoken);
    this.connect.onReady = this.callbackTo(this.onReady);
    this.connect.onMirrorCreated = this.callbackTo(this.onMirrorCreated);
    await this.connect.connect();
  }

  /**
   * Make sure that a callback has the correct this
   * @param {function} f
   * @returns A function that is applied to "this"
   */
  callbackTo(f) {
    return (...p) => f.apply(this, p);
  }

  async onMirrorCreated(mirror) {
    /**
     *  Setup callbacks to keep track of changes. Version is persisted to allow for restarts
     */
    if (mirror.name == "references") {
      this.referenceVersion = await this.getCommittedVersion("references");
      mirror.onInserted = this.callbackTo(this.onReferenceAdded);
      mirror.onUpdated = this.callbackTo(this.onReferenceUpdated);
      mirror.onDeleted = this.callbackTo(this.onReferenceDeleted);
    } else if (mirror.name == "trackers") {
      this.trackerVersion = await this.getCommittedVersion("trackers");
      mirror.onInserted = this.callbackTo(this.onTrackerAdded);
      mirror.onUpdated = this.callbackTo(this.onTrackerUpdated);
      mirror.onDeleted = this.callbackTo(this.onTrackerDeleted);
    }
  }

  /**
   * Main application code. Change this function to your needs
   */
  async onReady() {
    console.log("Ready");
    /**
     * getMirror returns a Map with id as key and the document as value
     *
     * Note: the map is keep up-to date with changes from the server
     *
     * So if you i.e want the information for an asset just use:
     * \code
     *  let theReference = reference.get(referenceId)
     *  let name
     *  if (theReference.__typename == "QAsset") {
     *     name = theReference.brand + ' ' + theReference.model
     *  } else if (theReference == "QSite") {
     *     name = theReference.name
     *  } else if (theReference == "QUser") {
     *     name = theReference.fullName
     *  }
     * \endcode
     */
    this.references = await this.connect.getMirror("references");
    this.trackers = await this.connect.getMirror("trackers");
    /**
     * This piece of code listens for GPS changes on trackers
     */
    let gpsReceivers = new GPSReceiver(this.connect);
    gpsReceivers.onDataReceived = this.callbackTo(this.onGPSDataUpdate);
    gpsReceivers.run();

    /**
     *  This piece of code listens for tracker link changes
     */

    let tlinkReceivers = new TransmitterLinksReceiver(
      this.connect,
      ["LAN_GATE_TRACKER"],
      true
    );
    tlinkReceivers.onDataReceived = this.callbackTo(
      this.onTransmitterLinkUpdate
    );
    /**
     * The are a couple of arguments to the run function
     * @see {TransmitterLinksReceiver.run}
     */
    tlinkReceivers.run(true, false, false, true);
    /**
     *  This piece of code listens for external voltage changes
     */
    let voltReceiver = new StatesReceiverDouble(
      this.connect,
      DoubleFields.EXTERNAL_VOLTAGE
    );
    voltReceiver.onDataReceived = this.callbackTo(this.onVoltageChanged);
    voltReceiver.run();
  }

  async getCommittedVersion(mirror) {
    let retVal;
    try {
      retVal = await this.db.get(mirror);
    } catch {}
    return retVal ? parseInt(retVal) : -1;
  }
  async commitVersion(mirror, version) {
    this.db.put(mirror, version);
  }
  onReferenceAdded(mirror, reference) {
    // Make sure a change is only processed once
    if (this.referenceVersion < mirror.version) {
      /**
       *   Put in code here to syncronize with your system
       */
      console.log("Reference added: ", JSON.stringify(reference, null, 4));
      // -----------------------------------------------
      this.referenceVersion = mirror.version;
      this.commitVersion("references", this.referenceVersion);
    }
  }
  onReferenceUpdated(mirror, reference, _orgReference) {
    // Make sure a change is only processed once
    if (this.referenceVersion < mirror.version) {
      /**
       *   Put in code here to syncronize with your system
       */
      console.log("Reference updated: ", JSON.stringify(reference, null, 4));
      /**
       *
       */
      this.referenceVersion = mirror.version;
      this.commitVersion("references", this.referenceVersion);
    }
  }
  onReferenceDeleted(mirror, reference) {
    // Make sure a change is only processed once
    if (this.referenceVersion < mirror.version) {
      /**
       *   Put in code here to syncronize with your system
       */
      console.log("Reference deleted: ", JSON.stringify(reference, null, 4));
      /**
       *
       */
      this.referenceVersion = mirror.version;
      this.commitVersion("references", this.referenceVersion);
    }
  }

  onTrackerAdded(mirror, tracker) {
    // Make sure a change is only processed once
    if (this.trackerVersion < mirror.version) {
      /**
       *   Put in code here to syncronize with your system
       */
      console.log("Tracker added: ", JSON.stringify(tracker, null, 4));
      /**
       *
       */
      this.trackerVersion = mirror.version;
      this.commitVersion("trackers", this.trackerVersion);
    }
  }
  onTrackerUpdated(mirror, tracker, _orgTracker) {
    if (this.trackerVersion < mirror.version) {
      /**
       *   Put in code here to syncronize with your system
       */
      console.log("Tracker updated: ", JSON.stringify(tracker, null, 4));
      /**
       *
       */
      this.trackerVersion = mirror.version;
      this.commitVersion("trackers", this.trackerVersion);
    }
  }
  onTrackerDeleted(mirror, tracker) {
    if (this.trackerVersion < mirror.version) {
      /**
       *   Put in code here to syncronize with your system
       */
      console.log("Tracker deleted: ", JSON.stringify(tracker, null, 4));
      /**
       *
       */
      this.trackerVersion = mirror.version;
      this.commitVersion("trackers", this.trackerVersion);
    }
  }
  onGPSDataUpdate(gps) {
    /**
     * If you need all information on the tracker, just look it up in trackers
     */

    // Depending on the unwind parameter this could be a single item or an array
    if (Array.isArray(gps)) {
      for (var g of gps) {
        g.tracker = this.trackers.get(g.trackerVID);
      }
    } else {
      gps.tracker = this.trackers.get(gps.trackerVID);
    }
    /**
     * If you need to know which reference the tracker is attached to, just do this
     */
    if (Array.isArray(gps)) {
      for (var g of gps) {
        g.reference = this.references.get(g.tracker.referenceId);
      }
    } else {
      gps.reference = this.references.get(gps.tracker.referenceId);
    }
    console.log(gps);
  }
  onTransmitterLinkUpdate(tlink) {
    console.log(tlink);
  }

  trackerIgnitionState = new Map();
  onVoltageChanged(data) {
    /**
     * This callback receives external voltage changes
     */
    let pState = this.trackerIgnitionState.get(data.vID);
    let nState = Ignition(data.value);
    if (pState != undefined) {
      if (pState != nState) {
        this.trackerIgnitionState.set(data.vID, nState);
        this.onIgnitionChanged(data, nState);
      }
    } else {
      this.trackerIgnitionState.set(data.vID, nState);
      this.onIgnitionChanged(data, nState);
    }
  }

  onIgnitionChanged(data, ignition) {
    /**
     *  This callback tells if the cars engine has ignition
     */
    console.log(`${data.vID} ignition is ${ignition ? "on" : "off"}`);
  }
}
module.exports = { App };
