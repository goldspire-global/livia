import assert from "node:assert/strict";
import {
  guestBookPath,
  guestManageVisitPath,
  guestShopRelationshipPath,
  migrateLegacyGuestBookPath,
  parseGuestBookSlugFromHost,
} from "../guest-book-url";

assert.equal(guestBookPath("bloom-beauty-dublin"), "/book/bloom-beauty-dublin");
assert.equal(
  migrateLegacyGuestBookPath("/b/bloom/visit/tok"),
  "/book/bloom/visit/tok",
);
assert.equal(guestManageVisitPath("bloom", "bk_1"), "/my/bloom/visit/bk_1");
assert.equal(guestShopRelationshipPath("bloom"), "/my/bloom");
assert.equal(parseGuestBookSlugFromHost("bloom.livia-hq.com"), "bloom");
assert.equal(parseGuestBookSlugFromHost("app.livia-hq.com"), null);
assert.equal(parseGuestBookSlugFromHost("localhost"), null);

console.log("guest-book-url.test.ts OK");
