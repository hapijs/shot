
## Introduction

Injects a fake HTTP request/response into a node HTTP server for simulating server logic, writing tests, or debugging. Does not use a socket
connection so can be run against an inactive server (server not in listen mode).

## Example

```javascript
const Http = require('http');
const Shot = require('@hapi/shot');


const internals = {};


internals.main = async function () {

    const dispatch = function (req, res) {

        const reply = 'Hello World';
        res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length': reply.length });
        res.end(reply);
    };

    const server = Http.createServer(dispatch);

    const res = await Shot.inject(dispatch, { method: 'get', url: '/' });
    console.log(res.payload);
};


internals.main();
```

Note how `server.listen` is never called.

## Methods

### `await Shot.inject(dispatchFunc, options)`

Injects a fake request into an HTTP server.

- `dispatchFunc` - listener function. The same as you would pass to `Http.createServer` when making a node HTTP server. Has the signature `function (req, res)` where:
  - `req` - a simulated request object. Inherits from `Stream.Readable`.
  - `res` - a simulated response object. Inherits from node's `Http.ServerResponse`.
- `options` - request options object where:
  - `url` - a string specifying the request URL.
  - `method` - a string specifying the HTTP request method, defaulting to `'GET'`.
  - `authority` - a string specifying the HTTP HOST header value to be used if no header is provided, and the `url`
    does not include an authority component. Defaults to `'localhost'`.
  - `headers` - an optional object containing request headers.
  - `remoteAddress` - an optional string specifying the client remote address. Defaults to `'127.0.0.1'`.
  - `payload` - an optional request payload. Can be a string, Buffer, Stream or object.
  - `simulate` - an object containing flags to simulate various conditions:
    - `end` - indicates whether the request will fire an `end` event. Defaults to `undefined`, meaning an `end` event will fire.
    - `split` - indicates whether the request payload will be split into chunks. Defaults to `undefined`, meaning payload will not be chunked.
    - `error` - whether the request will emit an `error` event. Defaults to `undefined`, meaning no `error` event will be emitted. If set to `true`, the emitted error will have a message of `'Simulated'`.
    - `close` - whether the request will emit a `close` event. Defaults to `undefined`, meaning no `close` event will be emitted.
  - `validate` - Optional flag to validate this options object. Defaults to `true`.

Returns a response object where:

- `raw` - an object containing the raw request and response objects where:
  - `req` - the simulated request object.
  - `res` - the simulated response object.
- `headers` - an object containing the response headers.
- `statusCode` - the HTTP status code. If response is aborted before headers are sent, the code is `499`.
- `statusMessage` - the HTTP status message.
- `payload` - the payload as a UTF-8 encoded string.
- `rawPayload` - the raw payload as a Buffer.
- `trailers` - an object containing the response trailers.
- `aborted` - optional property which is `true` for aborted, ie. not fully transmitted, responses.

### `Shot.isInjection(obj)`

Checks if given object `obj` is a Shot `Request` object.
