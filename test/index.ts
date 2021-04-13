import { IncomingMessage, ServerResponse } from 'http';
import { Readable } from 'stream';

import * as Lab from '@hapi/lab';
import * as Shot from '..';


const { expect } = Lab.types;


const dispatch = function (req: Shot.MaybeInjectedRequest, res: ServerResponse) {

    res.end();
};

const plain = function (req: IncomingMessage, res: ServerResponse) {

    res.end();
};

// Shot.inject()

expect.type<Shot.ResponseObject>(await Shot.inject(dispatch, '/'));
expect.type<Shot.ResponseObject>(await Shot.inject(dispatch, { url: '/'}));
expect.type<Shot.ResponseObject>(await Shot.inject(dispatch, { url: { pathname: '/', query: { a: 'b' } } }));
expect.type<Shot.ResponseObject>(await Shot.inject(dispatch, { url: '/', payload: 'string' }));
expect.type<Shot.ResponseObject>(await Shot.inject(dispatch, { url: '/', payload: Buffer.from('buffer') }));
expect.type<Shot.ResponseObject>(await Shot.inject(dispatch, { url: '/', payload: { ja: 'son' } }));
expect.type<Shot.ResponseObject>(await Shot.inject(dispatch, { url: '/', payload: new Readable({ read() { this.push(null); } }) }));
expect.type<Shot.ResponseObject>(await Shot.inject(dispatch, {
    url: '/',
    method: 'POST',
    authority: 'server',
    headers: { a: 'b', c: ['d'], e: 1 },
    remoteAddress: '1.2.3.4',
    payload: 'value',
    simulate: {
        end: false,
        split: true,
        error: true,
        close: false
    },
    validate: false
}));

expect.error(await Shot.inject());
expect.error(await Shot.inject(dispatch));
expect.error(await Shot.inject(dispatch, {}));
expect.error(await Shot.inject(dispatch, { url: {} }));
expect.error(await Shot.inject(plain, '/'));

// Shot.isInjection()

await Shot.inject((req: Shot.MaybeInjectedRequest, res) => {

    expect.type<boolean>(Shot.isInjection(req));
    expect.type<boolean>(Shot.isInjection(res));

    res.end();
}, '/');

expect.error(Shot.isInjection({}))
expect.error(Shot.isInjection())
