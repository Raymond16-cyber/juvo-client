import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { create } from "zustand";

function setup() {
  const pending = [];
  const testModule = { exports: {} };
  const source = readFileSync(new URL("../stores/analytics.store.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  runInNewContext(compiled.outputText, {
    exports: testModule.exports,
    require(name) {
      if (name === "zustand") return { create };
      if (name === "@/services/analytics.service") return {
        getAnalyticsService: (accountId) => new Promise((resolve, reject) => pending.push({ accountId, resolve, reject })),
      };
      throw new Error(`Unexpected runtime dependency: ${name}`);
    },
  });
  return { store: testModule.exports.useAnalyticsStore, pending };
}

test("an older account response cannot overwrite the newest analytics selection", async () => {
  const { store, pending } = setup();
  const first = store.getState().fetchAnalytics("a");
  const second = store.getState().fetchAnalytics("b");
  pending[1].resolve({ data: { account: "b" } });
  await second;
  pending[0].resolve({ data: { account: "a" } });
  await first;
  assert.equal(store.getState().data.account, "b");
});

test("reconnect refresh uses the requested account even while its first request is pending", async () => {
  const { store, pending } = setup();
  assert.equal(await store.getState().refreshAnalytics(), null);
  const first = store.getState().fetchAnalytics("b");
  const refresh = store.getState().refreshAnalytics();
  assert.equal(pending[1].accountId, "b");
  pending[1].resolve({ data: { account: "b", refreshed: true } });
  await refresh;
  pending[0].reject(new Error("Old request failed"));
  await assert.rejects(first);
  assert.equal(store.getState().data.refreshed, true);
  assert.equal(store.getState().error, null);
});
