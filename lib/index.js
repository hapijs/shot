'use strict';

const Hoek = require('@hapi/hoek');
const Validate = require('@hapi/validate');

const Request = require('./request');
const Response = require('./response');
const Symbols = require('./symbols');


const internals = {};


internals.options = Validate.object().keys({
    url: Validate.alternatives([
        Validate.string(),
        Validate.object().keys({
            protocol: Validate.string(),
            hostname: Validate.string(),
            port: Validate.any(),
            pathname: Validate.string().required(),
            query: Validate.any()
        })
    ])
        .required(),
    headers: Validate.object(),
    payload: Validate.any(),
    simulate: {
        end: Validate.boolean(),
        split: Validate.boolean(),
        error: Validate.boolean(),
        close: Validate.boolean()
    },
    authority: Validate.string(),
    remoteAddress: Validate.string(),
    method: Validate.string(),
    validate: Validate.boolean(),
    timeout: Validate.number().integer().positive()
});


exports.inject = async function (dispatchFunc, options) {      // eslint-disable-line require-await

    options = (typeof options === 'string' ? { url: options } : options);

    if (options?.validate !== false) {                                                           // Defaults to true
        Hoek.assert(typeof dispatchFunc === 'function', 'Invalid or missing dispatch function');
        Validate.assert(options ?? null, internals.options, 'Invalid options:');
    }

    const timeout = options?.timeout;

    return new Promise((resolve, reject) => {

        let timer;
        let timedOut = false;

        const onEnd = (res) => {

            clearTimeout(timer);
            if (!timedOut) {
                resolve(res);
            }
        };

        const req = new Request(options);
        const res = new Response(req, onEnd);

        if (timeout) {
            timer = setTimeout(() => {

                timedOut = true;
                req.destroy();
                res.destroy();
                reject(new Error(`Request timed out after ${timeout}ms`));
            }, timeout);
        }

        req.prepare()
            .then(() => dispatchFunc(req, res))
            .catch((err) => {

                clearTimeout(timer);
                reject(err);
            });
    });
};


exports.isInjection = function (obj) {

    return !!obj[Symbols.injection];
};
