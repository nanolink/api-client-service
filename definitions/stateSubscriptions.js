const StateSubscriptions = {
  transmitterLinks(includeLinks, includeNewest, includeNearest) {
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
};

module.exports = { StateSubscriptions };
