import { test, expect, APIRequestContext } from "@playwright/test";

async function getToken(request: APIRequestContext): Promise<string> {
  const res = await request.post("/auth", {
    data: { username: "admin", password: "password123" },
  });
  expect(res.status(), await res.text()).toBe(200);
  return (await res.json()).token;
}

async function createBooking(
  request: APIRequestContext,
  booking: object,
): Promise<number> {
  const res = await request.post("/booking", { data: booking });
  expect(res.status(), await res.text()).toBe(200);
  return (await res.json()).bookingid;
}

test('TASK-H DELETE /booking/:id without a token is rejected', async ({ request }) => {
  const bookingDetails = {
    firstname: 'Jim1',
    lastname: 'Brown1',
    totalprice: 111,
    depositpaid: true,
    bookingdates: { checkin: '2018-01-01', checkout: '2019-01-01' },
  };
  const id = await createBooking(request, bookingDetails);

  try {
    // Observed: 403 (the standard for a missing token would be 401)
    const response = await request.delete(`/booking/${id}`);
    expect(response.status(), await response.text()).toBe(403);

    // Proof the booking survived
    const getResponse = await request.get(`/booking/${id}`);
    expect(getResponse.status()).toBe(200);
    expect(await getResponse.json()).toMatchObject(bookingDetails);
  } finally {
    // Cleanup: remove the booking with a valid token
    const token = await getToken(request);
    await request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
  }
});
test(' TASK H PUT /booking/:id without a token is rejected', async ({ request }) => {
  const bookingDetails = {
    firstname: 'Jim1',
    lastname: 'Brown1',
    totalprice: 111,
    depositpaid: true,
    bookingdates: { checkin: '2018-01-01', checkout: '2019-01-01' },
  };
  const id = await createBooking(request, bookingDetails);

  try {
    const response = await request.put(`/booking/${id}`, {
      data: { ...bookingDetails, totalprice: 999 },
    });
    expect(response.status(), await response.text()).toBe(403);

    // Proof the data did not change
    const getResponse = await request.get(`/booking/${id}`);
    expect((await getResponse.json()).totalprice).toBe(111);
  } finally {
    const token = await getToken(request);
    await request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
  }
});

test("TASK-G Delete", async ({ request }) => {
  const userId = await getToken(request);

  const bookingDetails = {
    firstname: "Jim1",
    lastname: "Brown1",
    totalprice: 111,
    depositpaid: true,
    bookingdates: {
      checkin: "2018-01-01",
      checkout: "2019-01-01",
    },
  };
  const id = await createBooking(request, bookingDetails);

  const response = await request.delete(`/booking/${id}`, {
    headers: { Cookie: `token=${userId}` },
  });

  console.log(response.status(), await response.text()); // read this first

  expect(response.status(), await response.text()).toBe(201); // adjust to what you observe

  // Proof it is gone
  const getResponse = await request.get(`/booking/${id}`);
  expect(getResponse.status(), "deleted booking should return 404").toBe(404);
});

test.skip("Task-F-PATCH", async ({ request }) => {
  const userId = await getToken(request);

  const bookingDetails = {
    firstname: "Jim",
    lastname: "Brown",
    totalprice: 111,
    depositpaid: true,
    bookingdates: {
      checkin: "2018-01-01",
      checkout: "2019-01-01",
    },
  };
  const id = await createBooking(request, bookingDetails);

  const updateDetails = { firstname: "Patched" };

  const response = await request.patch(`/booking/${id}`, {
    data: updateDetails,
    headers: { Cookie: `token=${userId}` },
  });
  console.log(response.url());
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.firstname).toEqual("Patched");
  expect(body.lastname).toEqual(bookingDetails.lastname);
  expect(body.totalprice).toEqual(bookingDetails.totalprice);
  console.log(await response.json());
});

test.skip("Task E-PUT", async ({ request }) => {
  const token = await getToken(request);
  const bookingDetails = {
    firstname: "Jim",
    lastname: "Brown",
    totalprice: 111,
    depositpaid: true,
    bookingdates: {
      checkin: "2018-01-01",
      checkout: "2019-01-01",
    },
  };
  //  const updated = { ...bookingDetails, totalprice: 250 };
  const id = await createBooking(request, bookingDetails);
  console.log(id);
  const updateBookingDetails = {
    firstname: "Jim",
    lastname: "Brown",
    totalprice: 250,
    depositpaid: true,
    bookingdates: {
      checkin: "2018-01-01",
      checkout: "2019-01-01",
    },
  };

  const response = await request.put(`/booking/${id}`, {
    data: updateBookingDetails,
    headers: { Cookie: `token=${token}` },
  });

  console.log(response.status(), await response.text());
  expect(response.status(), await response.text()).toBe(200);
});

// test.use({
//   baseURL: "https://restful-booker.herokuapp.com",
//   extraHTTPHeaders: { Accept: "application/json" },
// });

test.skip("TASK-c and d", async ({ request }) => {
  const booking = {
    firstname: "Kiran",
    lastname: "Test",
    totalprice: 151,
    depositpaid: true,
    bookingdates: { checkin: "2026-12-01", checkout: "2026-12-05" },
    additionalneeds: "Breakfast",
  };
  const response = await request.post("/booking", { data: booking });
  const body = await response.json();
  console.log(response.status());
  console.log(await response.text());
  expect(response.status()).toBe(200);
  expect(typeof body["bookingid"]).toBe("number");
  expect(body.booking).toMatchObject(booking);
  const bookingId: number = body.bookingid;
  console.log(bookingId);

  console.log("============================");

  const getResponse = await request.get(`/booking/${bookingId}`);
  console.log(getResponse.url());
  const bodyGet = await getResponse.json();
  console.log(bodyGet);
});

test.skip("TASK-B", async ({ request }) => {
  const response = await request.post("/auth", {
    data: { username: "admin", password: "password123" },
  });

  console.log(response.status(), await response.text());

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body).not.toHaveProperty("token");

  expect(body["reason"]).toEqual("Bad credentials");
});

test.skip("TASK A GET ATOKEN", async ({ request }) => {
  const response = await request.post("/auth", {
    data: { username: "admin", password: "password123" },
  });

  console.log(response.url());

  const body = await response.json();

  console.log(body);
  expect(response.status(), await response.text()).toBe(200);

  expect(typeof body.token).toBe("string");
  expect(body.token.length).toBeGreaterThan(0);
});
