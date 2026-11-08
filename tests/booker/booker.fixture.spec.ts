import {test,expect} from "../src/fixtures"
import {newBooking} from '../src/types'
test('POST /booking creates a booking', async ({ client }) => {
  const booking = newBooking();

  // 1. Create the booking
  const response = await client.create(booking);

  // 2. Assert the status FIRST, with the body text as the failure message
  expect(response.status(), await response.text()).toBe(200);

  // 3. Parse the body once, only after the status is confirmed
  const body = await response.json();

  // 4. Assert the id, so cleanup is possible even if a later assertion fails
  expect(typeof body.bookingid).toBe('number');
  const id: number = body.bookingid;

  try {
    // 5. Compare the NESTED level, because the create response is
    //    { bookingid, booking: {...} }, not the booking itself
    expect(body.booking).toMatchObject(booking);
  } finally {
    // 6. Always clean up, even when the assertion above fails
    await client.remove(id);
  }
});