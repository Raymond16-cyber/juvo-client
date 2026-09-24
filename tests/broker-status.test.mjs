import assert from "node:assert/strict";
import { test } from "node:test";
import { brokerStatusCopy, brokerStatusStyle } from "../lib/broker-status.ts";

test("MetaTrader transitional, failure and connected states have labels and dark-mode colors", () => {
  for (const status of ["synchronizing", "stale", "offline", "connected", "disconnected", "error"]) {
    assert.ok(brokerStatusCopy[status]);
    assert.match(brokerStatusStyle(status), /dark:text-/);
  }
  assert.notEqual(brokerStatusCopy.synchronizing, brokerStatusCopy.connected);
  assert.equal(brokerStatusCopy.reauthorization_required, "Reconnect required");
});
