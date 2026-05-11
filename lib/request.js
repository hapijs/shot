'use strict';

const Events = require('events');
const Stream = require('stream');
const Url = require('url');

const Payload = require('./payload');
const Symbols = require('./symbols');


const internals = {};


exports = module.exports = internals.Request = class extends Stream.Readable {

    constructor(options) {

        super({
            emitClose: options.simulate?.close !== false,
            autoDestroy: true        // This is the default in node 14+
        });

        // options: method, url, payload, headers, remoteAddress

        let url = options.url;
        if (typeof url === 'object') {
            url = Url.format(url);
        }

        const uri = Url.parse(url);
        this.url = uri.path;

        this.httpVersion = '1.1';
        this.method = (options.method ? options.method.toUpperCase() : 'GET');

        const { payload, headers: baseHeaders } = Payload.encode(options.payload ?? null);

        this.headers = baseHeaders;

        const headers = options.headers ?? {};
        for (const field of Object.keys(headers)) {
            this.headers[field.toLowerCase()] = headers[field];
        }

        this.headers['user-agent'] = this.headers['user-agent'] ?? 'shot';

        const hostHeaderFromUri = function () {

            if (uri.port) {
                return uri.host;
            }

            if (uri.protocol) {
                return uri.hostname + (uri.protocol === 'https:' ? ':443' : ':80');
            }

            return null;
        };

        this.headers.host = this.headers.host ?? hostHeaderFromUri() ?? options.authority ?? 'localhost:80';

        // NOTE connection is deprecated in favor of socket as of node v13

        this.socket = this.connection = new internals.MockSocket(options);

        // Use _shot namespace to avoid collision with Node

        this._shot = {
            payload,
            simulate: options.simulate ?? {}
        };

        return this;
    }

    async prepare() {

        this._shot.payload = await this._shot.payload;
    }

    _read(size) {

        setImmediate(() => {

            if (this._shot.payload) {
                if (this._shot.simulate.split) {
                    this.push(this._shot.payload.slice(0, 1));
                    this.push(this._shot.payload.slice(1));
                }
                else {
                    this.push(this._shot.payload);
                }
            }

            if (this._shot.simulate.error) {
                this.destroy(new Error('Simulated'));
            }
            else if (this._shot.simulate.end !== false) {        // 'end' defaults to true
                this.push(null);
            }
            else {
                this.destroy();
            }
        });
    }
};


internals.Request.prototype[Symbols.injection] = true;

internals.MockSocket = class MockSocket extends Events.EventEmitter {

    constructor({ remoteAddress }) {

        super();

        this.remoteAddress = remoteAddress ?? '127.0.0.1';
    }

    // Net.Socket APIs used by hapi

    end() {}
    setTimeout() {}
};
