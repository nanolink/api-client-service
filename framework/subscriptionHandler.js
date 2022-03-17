const { SubscriptionClient } = require("graphql-subscriptions-client");
const { deferedPromise } = require("./deferedPromise");

class SubscriptionHandler {
  url;
  client;
  authToken;
  timeout;
  constructor(url, authToken) {
    this.url = url;
    this.authToken = authToken;
  }
  async createClient() {
    let retVal = deferedPromise();
    if (this.client) {
      if (this.client == 0) {
        clearTimeout(this.timeout);
      }
      this.client.refcount = this.client.refcount + 1;
      return this.client;
    }
    let client = new SubscriptionClient(this.url, {
      lazy: false,
      reconnect: false,
      minTimeout: 15000,
      connectionParams: { authToken: this.authToken },
      connectionCallback: (error) => {
        if (error) {
          console.error(error);
          this.client = null;
          retVal.reject(error);
        } else {
          retVal.resolve(client);
        }
      },
    });
    client.on("disconnected", () => {
      retVal.reject("Connection timeout to coreserver");
      this.onDisconnected();
    });
    client.refcount = 1;
    await retVal;
    this.client = client;
    this.onConnected();
    return client;
  }
  releaseClient() {
    console.log("released:", this.url);
    let conn = this.client;
    conn.refcount = conn.refcount - 1;
    if (conn.refcount == 0) {
      this.timeout = conn.refTimeout = setTimeout(() => {
        this.client = null;
        conn.close();
      }, 10000);
    }
  }

  async subscribe(query, variables) {
    let client = await this.createClient();
    let deferred = null;
    const pending = [];
    let throwMe;
    let done = false;

    const subscription = client
      .request({ query: query, variables: variables })
      .subscribe({
        next: (data) => {
          pending.push(data);
          if (deferred != null) {
            let d = deferred;
            deferred = null;
            d.resolve(true);
          }
        },
        error: (err) => {
          console.log(err);
          throwMe = err;
          deferred?.reject(throwMe);
        },
        complete: () => {
          done = true;
          deferred?.resolve(true);
        },
      });
    return {
      self: this,
      [Symbol.asyncIterator]() {
        return this;
      },
      releaseClient() {
        this.self.releaseClient();
      },
      async next() {
        while (!this.done) {
          while (pending.length) {
            let e = pending.shift();
            if (e.errors) {
              console.error("Graph error:", e.errors);
              console.log(query);
              throw e.errors;
            }
            return { value: e.data, done: false };
          }
          deferred = deferedPromise();
          await deferred;
        }
        this.releaseClient();
        return { done: true, value: undefined };
      },
      async return() {
        this.done = true;
        subscription?.unsubscribe();
        deferred?.resolve(true);
        this.releaseClient();
        return { done: true };
      },
    };
  }
  wrapBulk(iterator, map) {
    return {
      buffer: [],
      done: false,
      [Symbol.asyncIterator]() {
        return this;
      },
      async next() {
        if (this.done) {
          return { done: true };
        }
        if (this.buffer.length) {
          return { value: this.buffer.shift() };
        } else {
          let r = await iterator.next();
          if (r.done) {
            this.done = true;
            return { done: true };
          } else {
            let mapped = map(r.value);
            if (mapped.data) {
              for (let v of mapped.data) {
                this.buffer.push({ type: "UPDATED", data: v });
              }
            } else {
              return { value: mapped };
            }
            if (this.buffer.length) {
              return {
                value: this.buffer.shift(),
              };
            } else {
              this.done = true;
              return { done: true };
            }
          }
        }
      },
      async return() {
        return iterator.return();
      },
    };
  }
  onDisconnectedInternal = () => {
    this.client = null;
    onDisconnected();
  };
  onDisconnected() {}
  onConnected() {}
}
module.exports = { SubscriptionHandler };
