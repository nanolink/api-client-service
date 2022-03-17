const commonFields = "id:idStr version createdDateTime";
const commonReferenceFields = "groupId groupName labels";
const lastLogFields = "id eventCode stamp serviceDataId userId comment";
const serviceDataCommonFields = `id createdDateTime due dueSlackInDays servicePlanId userId lastLog {${lastLogFields}}`;
const mCommonFields = "type total deleteId deleteVersion";
const mServiceCommonFields = `name description createdDate createdBy dueSlackInDays ${commonFields}`;

const Subscriptions = {
  references: `
    subscription References($version:Int!) {
        mreference_getbulk(version: $version, subscribe:true)
        {
            ${mCommonFields}
            data {
                __typename
                ... on QMUser {
                    ${commonFields}
                    ${commonReferenceFields}
                    mobilePhoneNumber
                    mobileCountryCode
                    firstName
                    middleName
                    lastName
                    fullName
                    email
                    documents {
                      id name url createdDate mimeType fileName
                    }
                    serviceData {
                        __typename
                        ... on QMServiceDataOneshot { ${serviceDataCommonFields} }
                        ... on  QMServiceDataPeriodic { ${serviceDataCommonFields}  startDate lastServiceDate period intervalType }
                        ... on  QMServiceDataWarranty { ${serviceDataCommonFields}  purchaseDate warrantyInMonths }
                    }
                    deleted
                }
                ... on QMAsset { 
                    ${commonFields}
                    ${commonReferenceFields}
                    brand 
                    model 
                    keyWords
                    description
                    serial 
                    documents {
                        id name url createdDate mimeType fileName
                    }
                    serviceData {
                        __typename
                        ... on QMServiceDataOneshot { ${serviceDataCommonFields} }
                        ... on  QMServiceDataPeriodic { ${serviceDataCommonFields}  startDate lastServiceDate period intervalType }
                        ... on  QMServiceDataWarranty { ${serviceDataCommonFields}  purchaseDate warrantyInMonths }
                    }
                    deleted
                }
                ... on QMSite { 
                    ${commonFields}
                    ${commonReferenceFields}
                    name
                    geoArea {
                        longitude
                        latitude
                    }
                    documents {
                      id name url createdDate mimeType fileName
                    }
                    serviceData {
                        __typename
                        ... on QMServiceDataOneshot { ${serviceDataCommonFields} }
                        ... on  QMServiceDataPeriodic { ${serviceDataCommonFields}  startDate lastServiceDate period intervalType }
                        ... on  QMServiceDataWarranty { ${serviceDataCommonFields}  purchaseDate warrantyInMonths }
                    }
                    deleted
            }
        }                
    }
}
`,
  trackers: `
  subscription Trackers($version:Int!) {
      mtrackers_getbulk(version: $version, subscribe:true)
      {
          ${mCommonFields}
          data 
          {
              ${commonFields}
              objId: id
              vID
              pID
              key
              type
              model 
              trackerName
              referenceId 
              deleted
          }
      }
  }
`,
  groups: `
   subscription Groups($version:Int!)
   {
        mcommon_getgroups(version: $version, subscribe: true)
        {            
            ${mCommonFields}
            data {
                id:idStr 
                version
                parentId
                name
                level  
                type
            }
        }
   }
`,
  servicePlans: `
   subscription Service($version: Int!)
   {
       mservice_get(version: $version, subscribe: true)
       {
           ${mCommonFields}
           data {
               __typename
               ... on QMServicePlanOneshot 
               { 
                   ${mServiceCommonFields}
                   deleted
               }
               ... on QMServicePlanPeriodic {
                   ${mServiceCommonFields}
                   period
                   intervalType
                   deleted
               }
               ... on QMServicePlanWarranty { 
                   ${mServiceCommonFields}
                   warrantyInMonths
                   deleted
               }
           }
       }
   }
`,
  trackerLinks: `
   subscription BLELinks($version: Int!)
   {
       otrackers_getlinks(version: $version, subscribe: true)
       {
           ${mCommonFields}
           data {
               id
               createdDateTime: creationTime
               receiverVID
               transmitterVID
               version
               deleted
           }
       }
   }
`,
  referenceLinks: `
   subscription ReferenceLink($version: Int!)
   {
        oreference_getlinks(version: $version, subscribe: true)
        {
            ${mCommonFields}
            data {
                id
                type
                createdDateTime: creationTime
                referenceId1
                referenceId2
                version
                deleted
            }
        }
   }
`,
  reports: `
   subscription Reports($version: Int!) {
        mreports_getreport(version: $version, subscribe: true)
        {
            ${mCommonFields}
            data {
                id
                name
                description
                route
                version
            }
        }
   }
   `,
  jobs: `subscription jobs($version: Int!) {  
    mjob_get(version:$version, subscribe: true) {
        ${mCommonFields}
        data {
            id
            createdDateTime
            name
            description
            version
            disabled
            deleted
            trigger {
                __typename
                ... on QMJobTriggerAssetFound {
                    assetId
                }
                ... on QMJobTriggerOneshot {
                    when
                }
                ... on QMJobTriggerScheduleTimeOfDay {
                    startTime
                    period
                    lastRun
                    interval
                }
            }
            action {
            __typename
            ... on QMJobActionAssetFoundMail {
                    actionType
                    assetId
                    references
                    groups
                }
                ... on QMJobActionReport {
                    actionType
                    reports {
                    reportId
                    args {name value }
                    }
                    groups
                    references
                    dontSendEmptyReport
                }
            }  
        } 
    }  
  }`,
};
const TempSubscriptions = {
  linkconnected: `subscription linkconnected {
        otrackers_linkconnectedbulk(subscribe: true, includeInitial: true) {
          type
          total
          deleteId
          data{
            id: vID
            when
          }
          deleteVersion
        }
    }`,
  connected: `subscription connected {
        otrackers_connectedbulk(subscribe: true, includeInitial: true) {
          type
          total
          deleteId
          data{
            id: vID
            when
          }
          deleteVersion
        }
    }`,
  voltage: `subscription voltage {
        otrackers_infoanybulk(subscribe: true, includeInitial: true, fields:[EXTERNAL_VOLTAGE]) {
            type
            total
            deleteId
            deleteVersion
            data {                
                id: vID
                field
                value
                stamp
            }
        }
  }`,
  internalvoltage: `subscription internalvoltage {
        otrackers_infoanybulk(subscribe: true, includeInitial: true, fields:[INTERNAL_VOLTAGE, BATTERY_LEVEL]) {
            type
            total
            deleteId
            deleteVersion
            data {
                id: vID
                field
                value
                stamp
            }
        }
  }`,
  temperature: `subscription temperature {
        otrackers_infoanybulk(subscribe: true, includeInitial: true, fields:[TEMPERATURE]) {
            type
            total
            deleteId
            deleteVersion
            data {
                id: vID
                value
                stamp
            }
        }
  }`,
  activecounter: `subscription activecounter {
        otrackers_infoanybulk(subscribe: true, includeInitial: true, fields:[ACTIVE_COUNTER]) {
            type
            total
            deleteId
            deleteVersion
            data {
                id: vID
                value
                stamp
            }
        }
  }`,
  speed: `subscription speed {
    otrackers_getpositionsbulk(subscribe: true, includeInitial: true) {
        type
        total
        deleteId
        deleteVersion
        data {
            id: trackerVID
            locationInfo {
                date
                speed
            }    
        }
    }
  }
  `,
};

module.exports = { Subscriptions, TempSubscriptions };
