const { LogSubscriptions } = require("../definitions/logsubscriptions");

const DoubleFieldsLog = {
  EXTERNAL_VOLTAGE: "EXTERNAL_VOLTAGE",
  TOTAL_ODOMETER: "TOTAL_ODOMETER",
  UPTIME: "UPTIME",
  INTERNAL_VOLTAGE: "INTERNAL_VOLTAGE",
  INITIAL_ODOMETER: "INITIAL_ODOMETER",
  CALCULATED_ODOMETER: "CALCULATED_ODOMETER",
};
const IntFieldsLog = {
  TEMPERATURE: "TEMPERATURE",
  BATTERY_LEVEL: "BATTERY_LEVEL",
  NANO_LINKS_FOUND: "NANO_LINKS_FOUND",
  ALL_TAGS_FOUND: "ALL_TAGS_FOUND",
};
const BoolFieldsLog = {
  MOVEMENT: "MOVEMENT",
  IGNITION: "IGNITION",
  GPS_ENABLED: "GPS_ENABLED",
  BLUETOOTH_ENABLED: "BLUETOOTH_ENABLED",
  BLUETOOTH_FAILURE: "BLUETOOTH_FAILURE",
};
const LongFieldsLog = {
  ACTIVE_COUNTER: "ACTIVE_COUNTER",
};
const AnyFieldsLog = {
  ...DoubleFieldsLog,
  ...IntFieldsLog,
  ...BoolFieldsLog,
  ...LongFieldsLog,
};

class LogStateReceiverBase {
  connection;
  variables = {
    subscribe: undefined,
    includeInitial: undefined,
    filter: {
      trackerVIDs: undefined,
      field: undefined,
      start: undefined,
      end: undefined,
      cursor: {
        from: undefined,
        count: undefined,
      },
    },
  };
  query;

  /**
   *
   * @param {Connection} connection - THe connection handler
   * @param {boolean} subscribe - Send updates if changes occur
   * @param {boolean} includeInitial - Include initial data
   * @param {string[]} trackerVIDs - array of tracker VIDs
   * @param {string} field - State field
   * @param {date} startTime - Start time
   * @param {date} endTime - End time
   * @param {string} fromId - Start id
   * @param {number} limit - Limit no. of docs (if not set then all)
   */
  constructor(
    connection,
    subscribe,
    includeInitial,
    trackerVIDs,
    field,
    startTime,
    endTime,
    fromId,
    limit
  ) {
    this.validateField(field);
    this.connection = connection;
    this.variables.subscribe = subscribe;
    this.variables.includeInitial = includeInitial;
    this.variables.filter.trackerVIDs = trackerVIDs;
    this.variables.filter.field = field;
    this.variables.filter.start = startTime;
    this.variables.filter.end = endTime;
    this.variables.filter.cursor.from = fromId;
    this.variables.filter.cursor.count = limit;
  }
  validateField(field) {
    throw "Not implemented";
  }

  /**
   * Start the subscription
   * @param {*} unwind - Give single updates otherwise an array
   */
  async run(unwind) {
    if (!this.connection.logSubscriptionHandler) {
      this.connection.connectLog(false);
    }
    /**
     * Setup for paging to not flood the client with data
     */
    // Make copy of filter to be able to manipulate without destroying
    let vars = { ...this.variables };
    let cursor = { ...this.variables.filter.cursor };
    vars.filter = { ...this.variables.filter };
    vars.filter.cursor = cursor;

    let hasLimit = cursor.count ? true : false;
    let limitLeft = cursor.count;
    while (true) {
      if (hasLimit) {
        if (limitLeft > 1000) {
          cursor.count = 1000;
          limitLeft -= 1000;
        } else {
          if (limitLeft) {
            cursor.count = limitLeft;
            limitLeft = 0;
          } else {
            break;
          }
        }
      } else {
        cursor.count = 1000;
      }
      let sub = await this.connection.subscribelog(this.query, vars, unwind);
      let gotData = false;
      for await (let doc of sub) {
        let data = doc.data;
        if (data) {
          gotData = false;
          this.onDataReceived(data);
          cursor.from = data.id;
        }
      }
      if (!gotData) {
        break;
      }
    }
  }
  onDataReceived(data) {}
}

/**
 * Bool fields
 */
class LogStateReceiverBool extends LogStateReceiverBase {
  constructor(
    connection,
    subscribe,
    includeInitial,
    trackerVIDs,
    field,
    startTime,
    endTime,
    fromId,
    limit
  ) {
    super(
      connection,
      subscribe,
      includeInitial,
      trackerVIDs,
      field,
      startTime,
      endTime,
      fromId,
      limit
    );
    this.query = LogSubscriptions.statesBool;
  }
  validateField(field) {
    if (BoolFieldsLog[field] == undefined) {
      throw `field: ${field} is not a bool field`;
    }
  }
}
/**
 * Double fields
 */
class LogStateReceiverInt extends LogStateReceiverBase {
  constructor(
    connection,
    subscribe,
    includeInitial,
    trackerVIDs,
    field,
    startTime,
    endTime,
    fromId,
    limit
  ) {
    super(
      connection,
      subscribe,
      includeInitial,
      trackerVIDs,
      field,
      startTime,
      endTime,
      fromId,
      limit
    );
    this.query = LogSubscriptions.statesInt;
  }
  validateField(field) {
    if (IntFieldsLog[field] == undefined) {
      throw `field: ${field} is not a int field`;
    }
  }
}
class LogStateReceiverDouble extends LogStateReceiverBase {
  constructor(
    connection,
    subscribe,
    includeInitial,
    trackerVIDs,
    field,
    startTime,
    endTime,
    fromId,
    limit
  ) {
    super(
      connection,
      subscribe,
      includeInitial,
      trackerVIDs,
      field,
      startTime,
      endTime,
      fromId,
      limit
    );
    this.query = LogSubscriptions.statesDouble;
  }
  validateField(field) {
    if (DoubleFieldsLog[field] == undefined) {
      throw `field: ${field} is not a double field`;
    }
  }
}
/**
 * Long fields
 */
class LogStateReceiverLong extends LogStateReceiverBase {
  constructor(
    connection,
    subscribe,
    includeInitial,
    trackerVIDs,
    field,
    startTime,
    endTime,
    fromId,
    limit
  ) {
    super(
      connection,
      subscribe,
      includeInitial,
      trackerVIDs,
      field,
      startTime,
      endTime,
      fromId,
      limit
    );
    this.query = LogSubscriptions.statesLong;
  }
  validateField(field) {
    if (LongFieldsLog[field] == undefined) {
      throw `field: ${field} is not a long field`;
    }
  }
}
/**
 * Field of any type (value as a string)
 */
class LogStateReceiverAny extends LogStateReceiverBase {
  constructor(
    connection,
    subscribe,
    includeInitial,
    trackerVIDs,
    field,
    startTime,
    endTime,
    fromId,
    limit
  ) {
    super(
      connection,
      subscribe,
      includeInitial,
      trackerVIDs,
      field,
      startTime,
      endTime,
      fromId,
      limit
    );
    this.query = LogSubscriptions.statesAll;
  }
  validateField(field) {
    if (AnyFieldsLog[field] == undefined) {
      throw `field: ${field} is not a field`;
    }
  }
}

module.exports = {
  LogStateReceiverBool,
  BoolFieldsLog,
  LogStateReceiverInt,
  IntFieldsLog,
  LogStateReceiverDouble,
  DoubleFieldsLog,
  LogStateReceiverLong,
  LongFieldsLog,
  LogStateReceiverAny,
  AnyFieldsLog,
};
