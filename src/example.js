const level = require("level");
const { Connection } = require("@nanolink/nanolink-tools/lib");
const {
  GPSReceiver,
} = require("@nanolink/nanolink-tools/lib/receivers/gpsReceivers");
const {
  TransmitterLinksReceiver,
} = require("@nanolink/nanolink-tools/lib/receivers/transmitterLinksReceiver");
const {
  StatesReceiverDouble,
  DoubleFields,
  StatesReceiverBool,
  BoolFields,
} = require("@nanolink/nanolink-tools/lib/receivers/statesReceiver");
const { AppBase } = require("./appbase");
const {
  TripReceiver,
} = require("@nanolink/nanolink-tools/lib/logreceivers/tripReceiver");
const {
  WorkHoursReceiver,
} = require("@nanolink/nanolink-tools/lib/logreceivers/workHoursReceiver");
const {
  PositionReceiver,
} = require("@nanolink/nanolink-tools/lib/receivers/positionReceiver");
const {
  GPSLogReceiver,
} = require("@nanolink/nanolink-tools/lib/logreceivers/gpsLogReceiver");


/**
 *  The main application class.
 */
class ExampleApp extends AppBase {
  /**
   * Instance of level db
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @type {*}
   */
  db;
  /**
   * Reference mirror
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @type {*}
   */
  references;
  /**
   * Tracker mirror
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @type {*}
   */
  trackers;
  /**
   * vid to objectid map
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @type {*}
   */
  vid2objectid;

  /**
   * Creates an instance of ExampleApp.
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @constructor
   * @param {*} url
   * @param {*} apitoken
   */
  constructor(url, apitoken) {
    super(url, apitoken);
    this.db = level("./data");
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
   * Start the app
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @async
   * @returns {*}
   */
  async run() {
    await super.run();    
    await this.connection.connectLog(true);
  }

  /**
   * Called whenever a mirror is ready for use
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @example
   * // So if you want to monitor mirror changes. Implement this callback
   * if (mirror.name == "references") {
   *   this.referenceVersion = await this.getCommittedVersion("references");
   *   mirror.onInserted = this.callbackTo(this.onReferenceAdded);
   *   mirror.onUpdated = this.callbackTo(this.onReferenceUpdated);
   *   mirror.onDeleted = this.callbackTo(this.onReferenceDeleted);
   * } else if (mirror.name == "trackers") {
   *   this.trackerVersion = await this.getCommittedVersion("trackers");
   *   mirror.onInserted = this.callbackTo(this.onTrackerAdded);
   *   mirror.onUpdated = this.callbackTo(this.onTrackerUpdated);
   *   mirror.onDeleted = this.callbackTo(this.onTrackerDeleted);
   * }
   * @async
   * @param {*} mirror
   * @returns {*}
   */
  async onMirrorCreated(mirror) {
    /*
     *  Setup callbacks to keep track of changes. Version is persisted to allow for restarts
     */
    // if (mirror.name == "references") {
    //   this.referenceVersion = await this.getCommittedVersion("references");
    //   mirror.onInserted = this.callbackTo(this.onReferenceAdded);
    //   mirror.onUpdated = this.callbackTo(this.onReferenceUpdated);
    //   mirror.onDeleted = this.callbackTo(this.onReferenceDeleted);
    // } else if (mirror.name == "trackers") {
    //   this.trackerVersion = await this.getCommittedVersion("trackers");
    //   mirror.onInserted = this.callbackTo(this.onTrackerAdded);
    //   mirror.onUpdated = this.callbackTo(this.onTrackerUpdated);
    //   mirror.onDeleted = this.callbackTo(this.onTrackerDeleted);
    // }
  }

  /**
   * Called when the log is ready.
   * Receivers valid for this function are located under: @nanolink/nanolink-tools/lib/logreceivers
   * @date 5/31/2023 - 3:14:27 PM
   *
   * @async
   * @returns {*}
   */
  async onLogReady() {
    console.log("LogReady");
    /*
     * This receiver handles work hours
     */
    // let workHoursReceiver = new WorkHoursReceiver(this.connection);
    // workHoursReceiver.onDataReceived = this.callbackTo(
    //   this.onWorkHoursReceived
    // );
    // workHoursReceiver.run(
    //   false,
    //   false,
    //   false,
    //   [],
    //   "2023-05-20",
    //   null,
    //   null,
    //   true,
    //   true
    // );
    /*
     * This receiver handles GPS updates
     */
    // this.gpsStart = await this.getCommittedObjectId("gpslog");
    // let gpsLog = new GPSLogReceiver(
    //   this.connection,
    //   this.gpsStart,
    //   "2023-03-01T13:00"
    // );
    // gpsLog.onDataReceived = this.callbackTo(this.onGPSLogReceived); 
    // gpsLog.onInitialReceived = () => {
    //   console.log("Initial received");
    // };
    // gpsLog.run(true);
    /*
     * This receiver returns completed trips with GPS and Distance travelled (odoEnd - OdoStart)
     */
    // let tripReceiver = new TripReceiver(this.connection);
    // tripReceiver.onDataReceived = this.callbackTo(this.onTripReceived);
    // tripReceiver.run(
    //   true, // Set to true if active links are need (i.e what tools are in the van during the trip)
    //   true, // Include GPS coordinates
    //   true, // Include odometer start/end
    //   null, // List of trackers, if null then all
    //   '2023-03-09', // start date/time
    //   null, // end date/time
    //   120, // Ignore stops shorter than this period
    //   true, // Set to true to get initial data from the server
    //   true // If true then events for new completed trips are sent
    // );
  }

  /**
   * Main application code. Change this function to your needs.
   * 
   * Mirrors should always be initialized in this function
   *
   * Receivers valid in this function are located under: @nanolink/nanolink-tools/lib/receivers/ 
   * 
   * @example
   * // So if you i.e want the information for an reference just use:
   * // getMirror returns a Map with id as key and the document as value
   * // Note: the map is kept up-to date with changes from the server
   * let references = await this.connection.getMirror("references");
   * let theReference = references.get(referenceId);
   * let name;
   * if (theReference.__typename == "QAsset") {
   *    name = theReference.brand + ' ' + theReference.model;
   * } else if (theReference.__typename == "QSite") {
   *    name = theReference.name;
   * } else if (theReference.__typename == "QUser") {
   *    name = theReference.fullName;
   * }
   * 
   * // This piece of code listens for GPS changes on trackers (receivers only)
   * let gpsReceivers = new GPSReceiver(this.connection);
   * gpsReceivers.onDataReceived = this.callbackTo(this.onGPSDataUpdate);
   * gpsReceivers.run(true);
   * @date 6/2/2023 - 1:57:40 PM
   *
   * @async   * 
   * @returns {*}
   */
  async onReady() {
    console.log("Ready");
    // this.references = await this.connection.getMirror("references");
    this.trackers = await this.connection.getMirror("trackers");
    console.log('Got mirrors')
    /*
     * This code creates a Map between vID and ObjectId
     */
    this.vid2objectid = new Map();
    for (let tr of this.trackers.values()) {
      this.vid2objectid.set(tr.vID, tr.objId);
    }

    /*
     * This piece of code listens for GPS changes on trackers (receivers only)
     * let gpsReceivers = new GPSReceiver(this.connection);
     * gpsReceivers.onDataReceived = this.callbackTo(this.onGPSDataUpdate);
     * gpsReceivers.run(true);
     */
    // let gpsReceivers = new GPSReceiver(this.connection);
    // gpsReceivers.onDataReceived = this.callbackTo(this.onGPSDataUpdate);
    // gpsReceivers.run(true);
 
    /*
     *  This piece of code listens for tracker link changes
     */
    // let tlinkReceivers = new TransmitterLinksReceiver(
    //   this.connection,
    //   ["LAN_GATE_TRACKER"], // Only for Lan gates (set to null for all)
    //   true
    // );
    // tlinkReceivers.onDataReceived = this.callbackTo(
    //   this.onTransmitterLinkUpdate
    // );
    // tlinkReceivers.run(true, false, true, true);

    /*
     *  This piece of code listens for external voltage changes
     */
    // let voltReceiver = new StatesReceiverDouble(
    //   this.connection,
    //   DoubleFields.EXTERNAL_VOLTAGE
    // );
    // voltReceiver.onDataReceived = this.callbackTo(this.onVoltageChanged);
    // voltReceiver.run();

    /*
     * This piece of listens for for ignition changes
     */
    // let ignitionReceiver = new StatesReceiverBool(this.connection, BoolFields.IGNITION)
    // ignitionReceiver.onDataReceived = this.callbackTo(this.onIgnition);
    // ignitionReceiver.run();

    /*
     *  This piece of code listens battery percent changes
     */
    // let batteryPercentReceiver = new StatesReceiverDouble(
    //   this.connection,
    //   DoubleFields.BATTERY_PERCENT
    // );
    // batteryPercentReceiver.onDataReceived = this.callbackTo(
    //   this.onBatteryPercentChanged
    // );
    // batteryPercentReceiver.run();

    
    /*
     * This subscription returns periods where trackers has been running. (Ignition true)
     * Has the same arguments as the above subscription (tripReceiver)
     */
    // let tagPosReceiver = new TagPositionReceiver(this.connection);
    // tagPosReceiver.onDataReceived = this.callbackTo(this.onTagPositionReceived);
    // tagPosReceiver.run(true);
    let posReceiver = new PositionReceiver(this.connection);
    posReceiver.onDataReceived = this.callbackTo(this.onPositionReceived);
    posReceiver.run(true, true, ['1800007F6FFA', '180001E6CBFA']);
  }

  /**
   * Get a persistet version from leveldb
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @async
   * @param {*} mirror
   * @returns {unknown}
   */
  async getCommittedVersion(mirror) {
    let retVal;
    try {
      retVal = await this.db.get(mirror);
    } catch {}
    return retVal ? parseInt(retVal) : -1;
  }
  /**
   * Get a persisten version as ObjectId from leveldb
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @async
   * @param {*} mirror
   * @returns {unknown}
   */
  async getCommittedObjectId(mirror) {
    let retVal;
    try {
      retVal = await this.db.get(mirror);
    } catch {}
    return retVal;
  }
  /**
   * Commit a version to leveldb (Both int and ObjectId)
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @async
   * @param {*} mirror
   * @param {*} version
   * @returns {*}
   */
  async commitVersion(mirror, version) {
    this.db.put(mirror, version);
  }
  /**
   * Called when a reference is added to nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} mirror
   * @param {*} reference
   */
  onReferenceAdded(mirror, reference) {
    // Make sure a change is only processed once
    if (this.referenceVersion < mirror.version) {
      /*
       *   Put in code here to syncronize with your system
       */
      console.log("Reference added: ", JSON.stringify(reference, null, 4));
      // -----------------------------------------------
      this.referenceVersion = mirror.version;
      this.commitVersion("references", this.referenceVersion);
    }
  }
  /**
   * Called when a reference is updated in nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} mirror
   * @param {*} reference
   * @param {*} _orgReference
   */
  onReferenceUpdated(mirror, reference, _orgReference) {
    // Make sure a change is only processed once
    if (this.referenceVersion < mirror.version) {
      /*
       *   Put in code here to syncronize with your system
       */
      console.log("Reference updated: ", JSON.stringify(reference, null, 4));
      this.referenceVersion = mirror.version;
      this.commitVersion("references", this.referenceVersion);
    }
  }
  /**
   * Called when a reference is deleted in nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} mirror
   * @param {*} reference
   */
  onReferenceDeleted(mirror, reference) {
    // Make sure a change is only processed once
    if (this.referenceVersion < mirror.version) {
      /*
       *   Put in code here to syncronize with your system
       */
      console.log("Reference deleted: ", JSON.stringify(reference, null, 4));
      this.referenceVersion = mirror.version;
      this.commitVersion("references", this.referenceVersion);
    }
  }

  /**
   * Called when a tracker is added to the nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} mirror
   * @param {*} tracker
   */
  onTrackerAdded(mirror, tracker) {
    // Make sure a change is only processed once
    if (this.trackerVersion < mirror.version) {
      /*
       *   Put in code here to syncronize with your system
       */
      console.log("Tracker added: ", JSON.stringify(tracker, null, 4));
      this.trackerVersion = mirror.version;
      this.commitVersion("trackers", this.trackerVersion);
    }
  }
  /**
   * Called when a tracker is updated in the nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} mirror
   * @param {*} tracker
   * @param {*} _orgTracker
   */
  onTrackerUpdated(mirror, tracker, _orgTracker) {
    if (this.trackerVersion < mirror.version) {
      /*
       *   Put in code here to syncronize with your system
       */
      console.log("Tracker updated: ", JSON.stringify(tracker, null, 4));
      this.trackerVersion = mirror.version;
      this.commitVersion("trackers", this.trackerVersion);
    }
  }
  /**
   * Called when a tracker is deleted in the nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} mirror
   * @param {*} tracker
   */
  onTrackerDeleted(mirror, tracker) {
    if (this.trackerVersion < mirror.version) {
      /*
       *   Put in code here to syncronize with your system
       */
      console.log("Tracker deleted: ", JSON.stringify(tracker, null, 4));
      this.trackerVersion = mirror.version;
      this.commitVersion("trackers", this.trackerVersion);
    }
  }
  /**
   * Called when a gps is received from nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} gps
   */
  onGPSDataUpdate(gps) {
    /*
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
    /*
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
  /**
   * Called when a gps log entry is received from nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} gps
   */
  onGPSLogReceived(gps) {
    if (gps.longitude) {
      console.log(gps);
      this.commitVersion("gpslog", gps.id);
    }
  }

  /**
   * Called when transmitterlink is received from the nanolink system
   * @param {OTransmitterLink} tlink
   */
  onTransmitterLinkUpdate(tlink) {    
    let link = tlink.nearest ?? tlink.newest;
    let antenna;
    if (link) {
      antenna = {
        vID: link.vID,
        objId: this.vid2objectid.get(link.vID),
        rSSI: link.rSSI,
        linkActive: tlink.nearest != null,
        lastUpdated: link?.lastUpdated,
        latitude: link?.position?.locationInfo?.latitude,
        longitude: link?.position?.locationInfo?.longitude,
      };
    }
    let beaconPosition = {
      vID: tlink.vID,
      objId: this.vid2objectid.get(link.vID),
      antenna: antenna,
    };
    console.log(beaconPosition);
  }

  /**
   * Called when battery percent in received from the nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} data
   */
  onBatteryPercentChanged(data) {
    console.log(`${data.vID} battery percent ${data.value}`);
  }

  /**
   * Called when a trip is received from the nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} data
   */
  onTripReceived(data) {
    console.log("TRIP:", data);
  }
  /**
   * Called when work hour entry is received from the nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} data
   */
  onWorkHoursReceived(data) {
    console.log("WORKHOURS (in s)", data);
  }

  /**
   * Called when a calculated position on nanolink is received from the nanolink system
   * @date 5/31/2023 - 3:13:33 PM
   *
   * @param {*} data
   */
  onTagPositionReceived(data) {
    if (data.vID != '1800007F6FFA') {
      return;
    }
    console.log(data);
    return;
    let antenna;
    if (data.link) {
      antenna = {
        vID: data.link.vID,
        objId: this.vid2objectid.get(data.link.vID),
        rSSI: data.link.rSSI,
        endTime: data.link.endTime,
        linkActive: !data.link.endTime,
        lastUpdated: data.link.lastUpdated,
        latitude: data.link.position?.locationInfo?.latitude,
        longitude: data.link.position?.locationInfo?.longitude,
        trackerType: data.link.trackerType,
      };
    }
    let beaconPosition = {
      vID: data.vID,
      objId: this.vid2objectid.get(data.vID),
      antenna: antenna,
    };
    console.log("POS", beaconPosition);
  }

  onIgnition(data) {
    console.log(data);
  }
  onPositionReceived(data) {
    if (data.source == 'GPS') {
      return;
    }
    let receiver = this.trackers.get(data.setBy);
    let antenna = {
      vID: data.setBy,
      objId: receiver.id,
      rSSI: data.rssi,
      linkActive: data.source == 'Proximity',
      lastUpdated: data.stamp,
      longitude: data.longitude,
      latitude: data.latitude,
      trackerType: receiver.type,
    }
    let beaconPosition = {
      vID: data.trackerVID,
      objId: this.vid2objectid.get(data.trackerVID),
      antenna: antenna,
    };
    console.log(beaconPosition);
  }
}
module.exports = { ExampleApp };
