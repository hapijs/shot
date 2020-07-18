'use strict';

const Validate = require('@hapi/joi');


const internals = {};


internals.url = Validate.alternatives(Validate.string().required(), Validate.object().keys({
    protocol: Validate.string(),
    hostname: Validate.string(),
    port: Validate.any(),
    pathname: Validate.string().required(),
    query: Validate.any()
}).required());


internals.options = Validate.object().keys({
    url: internals.url.required(),
    headers: Validate.object(),
    payload: Validate.any(),
    simulate: Validate.object().keys({
        end: Validate.boolean(),
        split: Validate.boolean(),
        error: Validate.boolean(),
        close: Validate.boolean()
    }),
    authority: Validate.string(),
    remoteAddress: Validate.string(),
    method: Validate.string().regex(/^[a-zA-Z0-9!#\$%&'\*\+\-\.^_`\|~]+$/)
}).min(1);


module.exports = Validate.object().keys({
    dispatchFunc: Validate.func().required(),
    options: Validate.alternatives(internals.options, internals.url).required(),
    callback: Validate.func()
});
