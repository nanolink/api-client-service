const axios = require("axios");
const { SubscriptionHandler } = require("./subscriptionHandler");
const { Mirror } = require("./mirror");

class Connect {
  url;
  token;
  apiToken;
  subscriptionHandler;
  constructor(url, apiToken) {
    this.url = url;
    this.apiToken = apiToken;
  }

  async connect() {
    await this.login();
    this.subscriptionHandler = new SubscriptionHandler(
      `${this.url.replace(/^http/, "ws").replace(/^https/, "wss")}/ws`,
      this.token
    );
    this.subscriptionHandler.onDisconnected = this.callbackTo(
      this.onDisconnected
    );
    this.onReady();
  }

  postQuery(url, query, variables, timeout, token) {
    token = this.token ?? token;
    let headers;
    if (token) {
      headers = {
        Authorization: `Bearer ${token}`,
        "User-Agent": HTTPAGENT,
      };
    } else {
      headers = {
        "User-Agent": HTTPAGENT,
      };
    }
    var result = axios.post(
      url,
      {
        query: query,
        variables: variables,
      },
      {
        timeout: timeout ?? 20000,
        headers: headers,
        validateStatus: function (status) {
          return (
            (status >= 200 && status < 300) || status == 400 || status == 500
          );
        },
      }
    );
    return result;
  }

  async login() {
    let result = await this.postQuery(
      this.url,
      `{
            auth_externallogin(logintoken: "${this.apiToken}") {
              result
              groupVersion
              errors {
                message
                errorKey
                detailDescription
              }        
            }
        }`
    );
    if (result.data?.errors) {
      throw result.data?.errors[0];
    }
    if (result.data.data?.auth_externallogin?.errors) {
      throw result.data.data?.auth_externallogin?.errors[0];
    }
    this.token = result?.data?.data?.auth_externallogin?.result;
    return this.token;
  }
  onDisconnected() {
    setTimeout(() => this.connect(), 5000);
  }
  callbackTo(f) {
    return (...p) => f.apply(this, p);
  }
  onReady() {}
}
module.exports = { Connect };
