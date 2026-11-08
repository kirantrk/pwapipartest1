// import { test, expect } from "../tests/src/fixtures";

import {test , expect} from "../src/fixtures"
import { newBooking } from "../src/types";

test("GET /booking/:id returns the created booking", async ({
  client,
  createdBooking,
} , testInfo) => {
  console.log('worker', testInfo.workerIndex, testInfo.title);
  const response = await client.get(createdBooking.bookingid);
  console.log(response.status(), await response.text());

  expect(response.status(), await response.text()).toBe(200);
  const body = await response.json();
  expect(body).toMatchObject(createdBooking.booking);
});

test("PUT /booking/:id updates the booking", async ({
  client,
  createdBooking,
},testInfo) => {
  console.log('worker', testInfo.workerIndex, testInfo.title);
  const updated = { ...newBooking(), totalprice: 999 };
  const response = await client.update(createdBooking.bookingid, updated);
  expect(response.status(), await response.text()).toBe(200);
  const body = await response.json();
  expect(body).toMatchObject(updated);

  const getResponse = await client.get(createdBooking.bookingid);
  expect(getResponse.status(), await getResponse.text()).toBe(200);
  const getBody = await getResponse.json();

  expect(getBody).toMatchObject(updated);

  // 3. A readable proof of the one value that changed (150 -> 999)
  expect(getBody.totalprice).toBe(999);

  // TODO: assert status 200 and that the response matches `updated`
  // TODO: read back with client.get and compare again
});
