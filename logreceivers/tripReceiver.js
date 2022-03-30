const { LogSubscriptions } = require("../definitions/logsubscriptions");

const GPSOption = {
  NONE: "NONE",
  START_AND_END: "START_AND_END",
  ALL: "ALL",
};
const OdometerOption = {
  NONE: "NONE",
  START_AND_END: "START_AND_END",
  ALL: "ALL",
};
const LinkOption = {
  NONE: "NONE",
  ALL: "ALL",
};

class TripsReceiver {
  connection;
  trackerVIDs;
  minStopTime;
  start;
  end;
  constructor(connection, trackerVIDs, start, end, minStopTime) {
    this.connection = connection;
    this.trackerVIDs = trackerVIDs;
    this.start = start;
    this.end = end;
    this.minStopTime = minStopTime;
  }
  async run(gpsOption, odometerOption, linkOption) {
    if (!this.connection.logSubscriptionHandler) {
      this.connection.connectLog(false);
    }
    let includeGPS = gpsOption != GPSOption.NONE;
    let includeOdometer = odometerOption != OdometerOption.NONE;
    let includeLinks = linkOption != LinkOption.NONE;
    if (gpsOption && GPSOption[gpsOption] == undefined) {
      throw "Invalid gpsOption";
    }
    if (odometerOption && OdometerOption[odometerOption] == undefined) {
      throw "Invalid odoMeterOption";
    }
    if (linkOption && LinkOption[linkOption] == undefined) {
      throw "Invalid linkOption";
    }
    let vars = {
      trackerVIDs: this.trackerVIDs,
      start: this.start,
      end: this.end,
      minStopTime: this.minStopTime,
      gpsOption: gpsOption,
      odometerOption: odometerOption,
      linkOption: linkOption,
    };
    let sub = await this.connection.subscribelog(
      LogSubscriptions.trips(includeLinks, includeGPS, includeOdometer),
      vars
    );
    let curTrip = null;
    for await (let doc of sub) {
      let data = doc.data;
      if (data) {
        switch (data.__typename) {
          case "QTrip":
            if (curTrip) {
              this.onTripPostProcess(curTrip);
            }
            curTrip = { ...data };
            break;
          case "QGPSTripInfo":
            if (!curTrip.gps) {
              curTrip.gps = [data];
            } else {
              curTrip.gps.push(data);
            }
            break;
          case "QOdometerTripInfo":
            if (!curTrip.odometer) {
              curTrip.odometer = [data];
            } else {
              curTrip.odometer.push(data);
            }
            break;
          case "QLinkTripInfo":
            if (!curTrip.links) {
              curTrip.links = [data];
            } else {
              curTrip.links.push(data);
            }
            break;
        }
      }
    }
    if (curTrip) {
      this.onTripPostProcess(curTrip);
    }
  }
  onTripPostProcess(trip) {
    if (trip.odometer) {
      let firstO = trip.odometer[0];
      let lastO = trip.odometer[trip.odometer.length - 1];
      trip.distance = lastO.value - firstO.value;
    }
    this.onDataReceived(trip);
  }
  onDataReceived(trip) {}
}

module.exports = { GPSOption, OdometerOption, LinkOption, TripsReceiver };
