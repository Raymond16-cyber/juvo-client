import assert from "node:assert/strict";
import { test } from "node:test";
import {
  brokerStatusCopy,
  brokerStatusStyle,
  metaTraderDesktopGuidance,
  metaTraderReasonCopy,
  metaTraderStatusGuidance,
} from "../lib/broker-status.ts";

test("MetaTrader transitional, failure and connected states have labels and dark-mode colors", () => {
  for (const status of ["synchronizing", "stale", "offline", "connected", "disconnected", "error"]) {
    assert.ok(brokerStatusCopy[status]);
    assert.match(brokerStatusStyle(status), /dark:text-/);
  }
  assert.notEqual(brokerStatusCopy.synchronizing, brokerStatusCopy.connected);
  assert.equal(brokerStatusCopy.reauthorization_required, "Reconnect required");
});

test("MetaTrader guidance explains desktop online requirement and status reasons", () => {
  assert.match(metaTraderDesktopGuidance.desktopOnline, /desktop/i);
  assert.match(metaTraderDesktopGuidance.offlineCatchUp, /catch/i);
  assert.equal(
    metaTraderStatusGuidance("stale"),
    metaTraderReasonCopy.heartbeat_timeout,
  );
  assert.equal(
    metaTraderStatusGuidance("offline", "heartbeat_timeout"),
    metaTraderReasonCopy.heartbeat_timeout,
  );
  assert.equal(
    metaTraderStatusGuidance("synchronizing", "catching_up"),
    metaTraderReasonCopy.catching_up,
  );
  assert.equal(metaTraderStatusGuidance("connected"), null);
});
