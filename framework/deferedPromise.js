function deferedPromise() {
  let resolve;
  let reject;
  const p = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  p.resolve = resolve;
  p.reject = reject;
  return p;
}

module.exports = { deferedPromise };
