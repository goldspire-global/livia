import assert from "node:assert/strict";
import { normalizeRetailCartItems } from "../beauty-retail";

const merged = normalizeRetailCartItems([
  { productId: "a", quantity: 2 },
  { productId: "a", quantity: 1 },
  { productId: "b", quantity: 1 },
]);
assert.equal(merged.length, 2);
assert.equal(merged.find((i) => i.productId === "a")?.quantity, 3);
assert.equal(merged.find((i) => i.productId === "b")?.quantity, 1);

console.log("beauty-retail-cart.test.ts OK");
