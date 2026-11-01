import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import config from '../next.config.mjs';
const require = createRequire(import.meta.url);
const { prepareDestination } = require('next/dist/shared/lib/router/utils/prepare-destination');

test('Socket.IO handshakes are not redirected before reaching the rewrite', () => {
  assert.equal(config.skipTrailingSlashRedirect, true);
});

test('the WebSocket rewrite preserves the Socket.IO endpoint trailing slash', async () => {
  const rules = await config.rewrites();
  const rule = rules.find(rule => rule.source === '/socket.io/:path*');
  const destination = prepareDestination({ destination: rule.destination, params: { path: undefined }, query: { EIO: '4', transport: 'websocket' }, appendParamsToQuery: false });
  assert.equal(destination.parsedDestination.pathname, '/socket.io/');
});
