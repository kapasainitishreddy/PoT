import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  localWorkspaceStorageKey,
  removeLocalWorkspaceData,
} from "../src/lib/local-data.ts";

test("local workspace keys remain user-scoped", () => {
  assert.equal(
    localWorkspaceStorageKey("local-user"),
    "prooftimeline:data:local-user"
  );
});

test("local workspace deletion removes exactly the active user's data key", () => {
  const removed = [];
  const storage = { removeItem: (key) => removed.push(key) };

  assert.equal(removeLocalWorkspaceData(storage, "user-123"), true);
  assert.deepEqual(removed, ["prooftimeline:data:user-123"]);
});

test("blank user ids fail closed without deleting another namespace", () => {
  const removed = [];
  const storage = { removeItem: (key) => removed.push(key) };

  assert.equal(removeLocalWorkspaceData(storage, "   "), false);
  assert.deepEqual(removed, []);
});

test("storage failures are reported instead of claiming deletion", () => {
  const storage = {
    removeItem() {
      throw new Error("storage denied");
    },
  };

  assert.equal(removeLocalWorkspaceData(storage, "user-123"), false);
});

test("settings only offers destructive local deletion in local mode", async () => {
  const source = await readFile(
    new URL("../src/app/(app)/settings/page.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /!clerkEnabled \? \(/);
  assert.match(source, /removeLocalWorkspaceData\(window\.localStorage, user\.id\)/);
  assert.match(source, /clearPin\(\);\s*signOutLocal\(\);/);
  assert.match(source, /Cloud deletion not configured/);
  assert.match(source, /disabled\s+aria-disabled="true"/);
});

test("privacy copy does not overclaim cloud deletion", async () => {
  const source = await readFile(
    new URL("../src/app/privacy/page.tsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /Delete local workspace permanently removes/);
  assert.match(source, /Cloud\s+account deletion is not enabled/);
});
