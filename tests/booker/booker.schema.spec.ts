import { test, expect } from "../src/fixtures";
import { newBooking } from "../src/types";
import { BookingSchema, CreateBookingResponseSchema } from "../src/schemas";


test('GET /booking/:id matches BookingSchema', async ({ client, createdBooking }) => {
  const response = await client.get(createdBooking.bookingid);
  expect(response.status(), await response.text()).toBe(200);

  const body = await response.json();

  // 1. Shape: is this a valid booking?
  const result = BookingSchema.safeParse(body);
  expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);

  // 2. Values: is it the booking we created?
  expect(body).toMatchObject(createdBooking.booking);
});

test('POST /booking matches CreateBookingResponseSchema', async ({ client }) => {
  const booking = newBooking();
  const response = await client.create(booking);
  expect(response.status(), await response.text()).toBe(200);

  const body = await response.json();

  // Assert the id BEFORE the try, so finally never calls /booking/undefined
  expect(typeof body.bookingid).toBe('number');
  const id: number = body.bookingid;

  try {
    // 1. Shape of the whole response, including the nested booking
    const result = CreateBookingResponseSchema.safeParse(body);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);

    // 2. Values: the nested booking matches what we sent
    expect(body.booking).toMatchObject(booking);
  } finally {
    await client.remove(id);
  }
});

// import { Booking } from './types';
// import { BookingFromSchema } from './schemas';

// const a: Booking = {} as BookingFromSchema;
// const b: BookingFromSchema = {} as Booking;