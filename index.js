const { bootstrap } = require("global-agent");
const ws = require("ws");
const { App } = require("./app");

/* 
   This code initializes the framework, so that it is compatible with node.
*/

const coreserver =
  process.env.CORESERVER ?? "https://www.nanolink.com/corelocal";
const apiToken = process.env.APITOKEN;

if (process.env.GLOBAL_AGENT_HTTP_PROXY) {
  console.log("Using proxy to:", process.env.GLOBAL_AGENT_HTTP_PROXY);
  bootstrap();
}
global.HTTPAGENT = "nanolink/1.0.0";
class WebSocketSub extends ws.WebSocket {
  constructor(address, protocols, options) {
    super(address, protocols, {
      headers: { "User-Agent": HTTPAGENT },
      ...options,
    });
  }
}
Object.assign(global, ws);
global.WebSocket = WebSocketSub;

let app = new App(coreserver, apiToken);

app.run().catch((e) => {
  console.log(e);
  throw e;
});
