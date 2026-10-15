import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseOpeningHours } from "./opening-hours";

const workweek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];

describe("parseOpeningHours", () => {
  it("parses English day ranges and times", () => {
    assert.deepEqual(parseOpeningHours("Saturday to Wednesday 9:00–18:00, Thursday 9:00–13:00"), [
      { days: workweek, opens: "09:00", closes: "18:00" },
      { days: ["Thursday"], opens: "09:00", closes: "13:00" },
    ]);
  });

  it("parses Persian text with Persian digits and ZWNJ", () => {
    assert.deepEqual(parseOpeningHours("شنبه تا چهارشنبه ۹ تا ۱۸، پنج‌شنبه ۹ تا ۱۳"), [
      { days: workweek, opens: "09:00", closes: "18:00" },
      { days: ["Thursday"], opens: "09:00", closes: "13:00" },
    ]);
  });

  it("accepts abbreviations, wraps around the week and skips closed days", () => {
    assert.deepEqual(parseOpeningHours("Thu-Sat 10-22:30; Sun closed"), [
      { days: ["Thursday", "Friday", "Saturday"], opens: "10:00", closes: "22:30" },
    ]);
    assert.deepEqual(parseOpeningHours("سه شنبه ۸ تا ۱۲، جمعه تعطیل"), [
      { days: ["Tuesday"], opens: "08:00", closes: "12:00" },
    ]);
  });

  it("rejects text it cannot read in full", () => {
    assert.equal(parseOpeningHours("By appointment"), null);
    assert.equal(parseOpeningHours("Saturday to Wednesday 9:00–18:00, holidays vary"), null);
    assert.equal(parseOpeningHours("Monday 9:00–25:00"), null);
    assert.equal(parseOpeningHours(""), null);
  });
});
