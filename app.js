const level = require("level");
const { Connect } = require("./framework/connect");
const { Mirror } = require("./framework/mirror");
const { Subscriptions } = require("./definitions/mirrors");
const { GPSReceiver } = require("./receivers/gpsReceivers");
const {
  TransmitterLinksReceiver,
} = require("./receivers/transmitterLinksReceiver");

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
    this.url = url;
    this.apitoken = apitoken;
    this.db = level("./data");
  }
  /**
   * Starts the application
   */
  async run() {
    this.connect = new Connect(`${this.url}/api/public`, this.apitoken);
    this.connect.onReady = this.callbackTo(this.onReady);
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

  /**
   * Main application code. Change this function to your needs
   */
  async onReady() {
    console.log("Ready");
    /**
     * This how you keep track of reference changes (assets, sites and users)
     * Change will occur in the callback functions
     */
    this.referenceVersion = await this.getCommittedVersion("references");
    let referenceMirror = new Mirror(
      "references",
      Subscriptions.references,
      this.connect.subscriptionHandler
    );
    referenceMirror.onInserted = this.callbackTo(this.onReferenceAdded);
    referenceMirror.onUpdated = this.callbackTo(this.onReferenceUpdated);
    referenceMirror.onDeleted = this.callbackTo(this.onReferenceDeleted);

    /**
     * load returns a Map with id as key and reference as value
     *
     * Note: the map is keep up-to date with changes from the server
     *
     * So if you i.e the information for an asset just use:
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
    this.references = await referenceMirror.load();

    /**
     * This how you keep track of tracker changes
     */
    this.trackerVersion = await this.getCommittedVersion("trackers");
    let trackerMirror = new Mirror(
      "trackers",
      Subscriptions.trackers,
      this.connect.subscriptionHandler
    );
    trackerMirror.onInserted = this.callbackTo(this.onTrackerAdded);
    trackerMirror.onUpdated = this.callbackTo(this.onTrackerUpdated);
    trackerMirror.onDeleted = this.callbackTo(this.onTrackerDeleted);

    /**
     * Work as the reference mirror, except that the key is vID
     */
    this.trackers = await trackerMirror.load();

    /**
     * This piece of code listens for GPS changes on trackers
     */
    let gpsReceivers = new GPSReceiver(this.connect.subscriptionHandler);
    gpsReceivers.onDataReceived = this.callbackTo(this.onGPSDataUpdate);
    gpsReceivers.run();

    /**
     *  This piece of code listens for tracker link changes
     */

    let tlinkReceivers = new TransmitterLinksReceiver(
      this.connect.subscriptionHandler,
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
    tlinkReceivers.run(false, false, false, true);
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
}

module.exports = { App };
