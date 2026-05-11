'use strict';

const Events = require('events');
const Stream = require('stream');


const internals = {};


exports.encode = function (payload) {

    if (payload instanceof Stream) {
        return internals.encodeStreamPayload(payload);
    }

    const headers = Object.create(null);

    if (payload) {
        if (typeof payload !== 'string' &&
            !Buffer.isBuffer(payload)) {

            payload = JSON.stringify(payload);
            headers['content-type'] = 'application/json';
        }

        // Compute the content-length for the corresponding payload in case none set

        headers['content-length'] = (Buffer.isBuffer(payload) ? payload.length : Buffer.byteLength(payload)).toString();
    }

    return { payload, headers };
};


internals.encodeStreamPayload = function (stream) {

    const headers = Object.create(null);

    const deferredPayload = (async () => {

        const chunks = [];
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));

        await Events.once(stream, 'end');

        const payload = Buffer.concat(chunks);
        headers['content-length'] = headers['content-length'] || payload.length;

        return payload;
    })();

    return { payload: deferredPayload, headers };
};
