import assert from "node:assert/strict";
import { eventRegistry } from "@workspace/event-bus";
import { listObservatoryCoveredEvents } from "@workspace/policy";

const busKeys = Object.keys(eventRegistry).sort();
const covered = listObservatoryCoveredEvents().sort();

assert.deepEqual(
  covered,
  busKeys,
  "liv-observatory-program must cover every event-bus key — add to DOMAIN_BUS_EVENT_KEYS",
);

console.log("liv-observatory-sync.test.ts ok");
