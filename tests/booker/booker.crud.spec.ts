import { test, expect } from "@playwright/test";
import { BookingClient } from "../src/booking-client"
import { Booking, CreateBookingResponse, newBooking } from "../src/types";

// Shared by every test in this file. beforeEach fills it, because the
// `request` fixture only exists inside a test or a hook.
let client: BookingClient;

// IDs of bookings created by tests, so afterEach can delete them
const createdIds: number[] = [];

test.beforeEach(({ request }) => {
  client = new BookingClient(request);
});

test.afterEach(async () => {
  for (const id of createdIds) {
    await client.remove(id); // harmless if the booking is already gone
  }
  createdIds.length = 0;
});

// Creates a booking, asserts it worked, and records the ID for cleanup
async function createTracked(
  booking: Booking = newBooking(),
): Promise<CreateBookingResponse> {
  const response = await client.create(booking);
  expect(response.status(), await response.text()).toBe(200);

  const created: CreateBookingResponse = await response.json();
  createdIds.push(created.bookingid);
  return created;
}

test("POST /booking creates a booking", async () => {
  const booking = newBooking();
  const created = await createTracked(booking);

  expect(typeof created.bookingid).toBe("number");
  expect(created.booking).toMatchObject(booking); // nested under `booking`
});

test("GET /booking/:id returns the booking", async () => {
  const booking = newBooking();
  const { bookingid } = await createTracked(booking);

  const response = await client.get(bookingid);
  expect(response.status(), await response.text()).toBe(200);
  expect(await response.json()).toMatchObject(booking); // GET has no wrapper
});

test("PUT /booking/:id replaces the booking", async () => {
  const booking = newBooking();
  const { bookingid } = await createTracked(booking);
  const updated = { ...booking, totalprice: 999 };

  const response = await client.update(bookingid, updated);
  expect(response.status(), await response.text()).toBe(200);
  expect(await response.json()).toMatchObject(updated);

  // Prove it was saved
  const readBack = await client.get(bookingid);
  expect(await readBack.json()).toMatchObject(updated);
});

test("PATCH /booking/:id changes only the given field", async () => {
  const booking = newBooking();
  const { bookingid } = await createTracked(booking);

  const response = await client.patch(bookingid, { firstname: "Patched" });
  expect(response.status(), await response.text()).toBe(200);

  // One field changed, everything else untouched
  expect(await response.json()).toMatchObject({
    ...booking,
    firstname: "Patched",
  });
});

test("DELETE /booking/:id removes the booking", async () => {
  const { bookingid } = await createTracked();

  const response = await client.remove(bookingid);
  // Observed: 201 with body 'Created' (the standard would be 200 or 204)
  expect(response.status(), await response.text()).toBe(201);

  // Proof it is gone. The 404 body is plain text, so do not call .json()
  const readBack = await client.get(bookingid);
  expect(readBack.status(), "deleted booking should return 404").toBe(404);
});

test("DELETE /booking/:id without a token is rejected", async () => {
  const booking = newBooking();
  const { bookingid } = await createTracked(booking);

  // Observed: 403 (the standard for a missing token would be 401)
  const response = await client.remove(bookingid, false);
  expect(response.status(), await response.text()).toBe(403);

  // Proof the booking survived
  const readBack = await client.get(bookingid);
  expect(readBack.status()).toBe(200);
  expect(await readBack.json()).toMatchObject(booking);
});
