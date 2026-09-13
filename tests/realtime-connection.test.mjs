import assert from "node:assert/strict";
import { test } from "node:test";
import { connectRealtime } from "../lib/realtime-connection.ts";

function setup(t) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const sockets = [];
  let opens = 0;
  const stop = connectRealtime({
    url: "ws://localhost/test", onMessage: () => {}, onOpen: () => { opens += 1; },
    createSocket: () => { const socket = { close() { this.closed = true; } }; sockets.push(socket); return socket; },
  });
  t.after(stop);
  return { sockets, stop, opens: () => opens };
}

test("a dropped socket reconnects and refreshes again after opening", (t) => {
  const state = setup(t);
  state.sockets[0].onopen();
  state.sockets[0].onclose({ code: 1006 });
  t.mock.timers.tick(1000);
  assert.equal(state.sockets.length, 2);
  state.sockets[1].onopen();
  assert.equal(state.opens(), 2);
});

test("repeated failures back off and stopping cancels queued reconnections", (t) => {
  const state = setup(t);
  state.sockets[0].onerror();
  t.mock.timers.tick(1000);
  state.sockets[1].onerror();
  t.mock.timers.tick(1000);
  assert.equal(state.sockets.length, 2);
  t.mock.timers.tick(1000);
  assert.equal(state.sockets.length, 3);
  state.sockets[2].onerror();
  state.stop();
  t.mock.timers.tick(60000);
  assert.equal(state.sockets.length, 3);
  assert.equal(state.sockets[2].onmessage, null);
});

test("a stalled handshake retries and policy rejection stops reconnection", (t) => {
  const state = setup(t);
  t.mock.timers.tick(10000);
  assert.equal(state.sockets[0].closed, true);
  t.mock.timers.tick(1000);
  assert.equal(state.sockets.length, 2);
  state.sockets[1].onclose({ code: 1008 });
  t.mock.timers.tick(60000);
  assert.equal(state.sockets.length, 2);
});
