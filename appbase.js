const { Connection } = require("@nanolink/nanolink-tools/lib");

class AppBase {
  url;
  apitoken;
  connection;
  db;
  references;
  trackers;

  constructor(url, apitoken) {
    this.url = url;
    this.apitoken = apitoken;
  }

  async run() {
    this.connection = new Connection(this.url, this.apitoken);
    this.connection.onReady = this.callbackTo(this.onReady);
    this.connection.onMirrorCreated = this.callbackTo(this.onMirrorCreated);
    await this.connection.connect(true);
  }
  callbackTo(f) {
    return (...p) => f.apply(this, p);
  }
  async onReady() {}
  async onMirrorCreated(mirror) {}
}

module.exports = { AppBase };
