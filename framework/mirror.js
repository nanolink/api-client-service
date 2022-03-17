const { deferedPromise } = require("./deferedPromise");

const SyncType = {
  DELETED: "DELETED",
  UPDATED: "UPDATED",
  START: "START",
  DONE: "DONE",
  VERSION_ERROR: "VERSION_ERROR",
};

class Mirror {
  storage;
  handler;
  name;
  query;
  version = -1;
  currentIterator;
  constructor(name, query, handler) {
    this.storage = new Map();
    this.handler = handler;
    this.name = name;
    this.query = query;
  }

  processRecord(record) {
    if (record.version > this.version) {
      this.version = record.version;
    }
    let orgdoc = this.storage.get(record.id);
    if (record.deleted != undefined && record.deleted) {
      if (orgdoc) {
        this.storage.delete(orgdoc.id);
        this.onDeleted(this, orgdoc);
      }
    } else {
      this.storage.set(record.id, record);
      if (orgdoc) {
        this.onUpdated(this, record, orgdoc);
      } else {
        this.onInserted(this, record);
      }
    }
  }

  loadInternal() {
    let initPromise = deferedPromise();
    this.handler
      .subscribe(this.query, { version: this.version })
      .then(async (iterator) => {
        this.currentIterator = iterator;
        for await (let msg of iterator) {
          let record = msg[Object.keys(msg)[0]];
          switch (record.type) {
            case SyncType.START:
              break;
            case SyncType.UPDATED:
              if (Array.isArray(record.data)) {
                for (let r of record.data) {
                  this.processRecord(r);
                }
              } else {
                this.processRecord(record.data);
              }
              break;
            case SyncType.VERSION_ERROR: {
              initPromise.reject("VERSIONERROR");
            }
            case SyncType.DELETED: {
              if (record.deleteVersion > this.version) {
                this.version = record.deleteVersion;
              }
              let orgdoc = this.storage.get(record.deleteId);
              this.storage.delete(record.deleteId);
              if (orgdoc) {
                this.onDeleted(this, orgdoc);
              }
              break;
            }

            case SyncType.DONE:
              initPromise.resolve(this.storage);
              break;
          }
        }
      })
      .catch((e) => initPromise.reject(e));
    return initPromise;
  }
  load() {
    let initPromise = deferedPromise();
    this.loadInternal()
      .then((result) => {
        initPromise.resolve(result);
      })
      .catch((e) => {
        this.version = -1;
        if (e == "VERSIONERROR") {
          this.loadInternal()
            .resolve((r) => initPromise.resolve(r))
            .catch((e) => initPromise.reject(e));
        }
      });
    return initPromise;
  }

  onDeleted(mirror, doc) {}
  onUpdated(mirror, doc, orgdoc) {}
  onInserted(mirror, doc) {}
}
module.exports = { Mirror, SyncType };
