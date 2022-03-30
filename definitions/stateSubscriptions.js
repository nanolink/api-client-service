const StateSubscriptions = {
  transmitterLinks(
    includeLinks,
    includeNewest,
    includeNearest,
    includeNewestByTrackerType,
    includeNewestByReferenceType
  ) {
    return `
    subscription links($trackerVIDs: [String], $subscribe: Boolean!, $onlyWhenNearestChange: Boolean, $receiverTypes: [TrackerType!]) {
        otrackers_transmitterlinksbulk(
          trackerVIDs: $trackerVIDs
          includeInitial: true
          subscribe: $subscribe
          updatepositions: true
          onlyWhenNearestChange: $onlyWhenNearestChange
          receiverTypes: $receiverTypes
        ) {
          type
          total
          deleteId
          data {
            vID
            ${includeLinks ? `links { ... linkFields }` : ""}
            ${includeNewest ? ` newest { ... linkFields }` : ""}
            ${includeNearest ? `nearest { ... linkFields }` : ""}
            ${
              includeNewestByTrackerType
                ? `newestByTrackerType { 
              gpsGate { ... linkFields }
              lanGate { ... linkFields } 
              mobile { ... linkFields }
              meshGate { ... linkFields }
              crowd { ... linkFields }
            }`
                : ""
            }
            ${
              includeNewestByReferenceType
                ? `newestByReferenceType {
              asset { ... linkFields }
              site { ... linkFields } 
              user { ... linkFields }
            }`
                : ""
            }
          }
          deleteVersion
        }
      }
      fragment linkFields on OReceiverLink {
        stamp
        lastUpdated
        vID
        rSSI
        position {
          stamp
          locationInfo { ... locationInfo }
          isFixed
        }
      }
      fragment locationInfo on GPSLocationInfo {
        date
        speed
        bearing
        accuracy
        altitude
        longitude
        latitude
      }    
    `;
  },
  gps: `
    subscription getpositions($trackerVIDs:[String]) {
        otrackers_getpositionsbulk(receiverVIDs: $trackerVIDs, subscribe:true, includeInitial: true) {
            type
            deleteId
            deleteVersion
            data {
                trackerVID
                stamp
                locationInfo {
                    date
                    speed
                    bearing
                    accuracy
                    altitude
                    longitude
                    latitude              
                }
                isFixed
            }
        }
    }`,
  statesDouble: ` 
    subscription states($field: TrackerPropertyDoubleField!, $trackerVIDs: [String]) {
      otrackers_infodouble(
        field: $field
        trackerVIDs: $trackerVIDs
        includeInitial: true
        subscribe: true
      ) {
        type
        total
        deleteId
        data {
          field
          vID
          value
          stamp
        }
        deleteVersion
      }
    }
  `,
  statesInt: ` 
    subscription states($field: TrackerPropertyIntField!, $trackerVIDs: [String]) {
      otrackers_infoint(
        field: $field
        trackerVIDs: $trackerVIDs
        includeInitial: true
        subscribe: true
      ) {
        type
        total
        deleteId
        data {
          field
          vID
          value
          stamp
        }
        deleteVersion
      }
    }
  `,
  statesBool: ` 
    subscription states($field: TrackerPropertyBoolField!, $trackerVIDs: [String]) {
      otrackers_infobool(
        field: $field
        trackerVIDs: $trackerVIDs
        includeInitial: true
        subscribe: true
      ) {
        type
        total
        deleteId
        data {
          field
          vID
          value
          stamp
        }
        deleteVersion
      }
    }
  `,
  statesLong: ` 
    subscription states($field: TrackerPropertyLongField!, $trackerVIDs: [String]) {
      otrackers_infolong(
        field: $field
        trackerVIDs: $trackerVIDs
        includeInitial: true
        subscribe: true
      ) {
        type
        total
        deleteId
        data {
          field
          vID
          value
          stamp
        }
        deleteVersion
      }
    }
  `,
  statesAny: ` 
    subscription states($field: TrackerPropertyField!, $trackerVIDs: [String]) {
      otrackers_infoanybulk(
        field: $field
        trackerVIDs: $trackerVIDs
        includeInitial: true
        subscribe: true
      ) {
        type
        total
        deleteId
        data {
          field
          vID
          value
          stamp
        }
        deleteVersion
      }
    }
  `,
};
module.exports = { StateSubscriptions };
