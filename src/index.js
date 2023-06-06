const { bootstrap } = require("global-agent");
const ws = require("ws");
const { App } = require("./app");
const { ExampleApp } = require("./example");

const coreserver = `${
  process.env.CORESERVER ?? "https://www.nanolink.com/corelocal"
}/api/public`;
const apiToken = process.env.APITOKEN;

if (process.env.GLOBAL_AGENT_HTTP_PROXY) {
  console.log("Using proxy to:", process.env.GLOBAL_AGENT_HTTP_PROXY);
  bootstrap();
}
let app = new ExampleApp(coreserver, apiToken);
//let app = new App(coreserver, apiToken);

app.run().catch((e) => {
  console.log(e);
  throw e;
});
