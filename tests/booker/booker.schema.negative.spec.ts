// import { test, expect } from "./src/fixtures";

import {test,expect} from "../src/fixtures"
import { newBooking } from "../src/types";
import {
  BookingSchema,
  AuthResponseSchema,
  AuthErrorSchema,
  BookingIdListSchema,
} from "../src/schemas";

// Test 1: login success. Never print or assert the token's value.
test(
  "POST /auth with valid credentials matches AuthResponseSchema",
  { tag: "@smoke" },
  async ({ request }) => {
    const response = await request.post("/auth", {
      data: { username: "admin", password: "password123" },
    });
    expect(response.status(), await response.text()).toBe(200);

    const body = await response.json();
    const result = AuthResponseSchema.safeParse(body);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  },
);

// Test 2: login failure. Observed: 200 with { reason }, the standard would be 401.
test(
  "POST /auth with a wrong password returns an error body and no token",
  { tag: ["@crud", "@smoke"] },
  async ({ request }) => {
    const response = await request.post("/auth", {
      data: { username: "admin", password: "wrong-password" },
    });

    // Print first, assert second (remove the log afterwards)
    console.log(response.status(), await response.text());

    expect(response.status(), await response.text()).toBe(200); // observed behavior, log as a deviation

    const body = await response.json();

    // The body IS an error body
    const errorResult = AuthErrorSchema.safeParse(body);
    expect(errorResult.success, JSON.stringify(errorResult.error?.issues)).toBe(
      true,
    );

    // The body is NOT a success body, so no token leaked
    expect(
      AuthResponseSchema.safeParse(body).success,
      "failed login must not look like a success",
    ).toBe(false);
    expect(body).not.toHaveProperty("token");
  },
);

// Test 3: list shape
test.fixme(
  "GET /booking returns a non-empty list matching BookingIdListSchema",
  { tag: ["@crud", "@smoke"] },
  async ({ request }) => {
    const response = await request.get("/booking");
    expect(response.status(), await response.text()).toBe(200);

    const body = await response.json();
    expect(body.length, "booking list should not be empty").toBeGreaterThan(0);

    const result = BookingIdListSchema.safeParse(body);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  },
);

// Test 4: strict vs loose, no network
test.skip("BookingSchema ignores an extra field, strict() rejects it", () => {
  const withExtra = { ...newBooking(), surprise: "new field" };

  // Loose (default): unknown keys are ignored
  expect(BookingSchema.safeParse(withExtra).success).toBe(true);

  // Strict: unknown keys are an error
  const strictResult = BookingSchema.strict().safeParse(withExtra);
  console.log(JSON.stringify(strictResult.error?.issues)); // read the issue once, then remove
  expect(strictResult.success).toBe(false);
});

// Test 5: prove the schema can fail, no network
test.describe("BookingSchema rejects bad data", { tag: "@schema" }, () => {
  const badInputs: Record<string, unknown> = {
    "missing firstname": { ...newBooking(), firstname: undefined },
    "totalprice is a string": { ...newBooking(), totalprice: "150" },
    "bookingdates is null": { ...newBooking(), bookingdates: null },
    "whole body is null": null,
  };

  for (const [name, input] of Object.entries(badInputs)) {
    test(name, () => {
      const result = BookingSchema.safeParse(input);
      expect(result.success, name).toBe(false);
    });
  }
});
