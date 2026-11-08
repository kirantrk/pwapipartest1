// Step 1: only import what you need. No node:http, no APIRequestContext alias.
import { test as base } from '@playwright/test';
import { BookingClient } from './booking-client';
import { CreateBookingResponse, newBooking } from './types';

// Step 2: worker fixtures cannot read the project's baseURL (it is test-scoped),
// so define the URL here. Restful-Booker is the same URL as in your config.
const BOOKER_URL = 'https://restful-booker.herokuapp.com';

// Test-scoped fixtures: built fresh for every test
type MyTestFixtures = {
  client: BookingClient;
  createdBooking: CreateBookingResponse;
};

// Worker-scoped fixtures: built once per worker process
// authToken is a plain string, not AuthResponse
type MyWorkerFixtures = {
  authToken: string;
};

// Step 3: first type argument = test fixtures, second = worker fixtures
export const test = base.extend<MyTestFixtures, MyWorkerFixtures>({
  // Step 4: authToken is a SIBLING key, not inside another fixture.
  // Worker fixtures are a tuple: [function, { scope: 'worker' }]
  authToken: [
    async ({ playwright }, use) => {
      // "request" is test-scoped, so use "playwright" to make our own context
      const context = await playwright.request.newContext({ baseURL: BOOKER_URL });

      const response = await context.post('/auth', {
        data: { username: 'admin', password: 'password123' },
      });
      if (response.status() !== 200) {
        throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
      }

      const body = await response.json();
      // This API returns 200 even for bad credentials, so check for the token itself
      if (!body.token) {
        throw new Error(`Login returned no token: ${JSON.stringify(body)}`);
      }

      console.log('LOGIN once'); // never log the token itself

      await use(body.token as string);

      // Teardown: close the context we created
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  // Step 5: client now depends on authToken and hands it to BookingClient
  client: async ({ request, authToken }, use) => {
    await use(new BookingClient(request, authToken));
  },

  createdBooking: async ({ client }, use) => {
    const response = await client.create(newBooking());
    if (response.status() !== 200) {
      throw new Error(
        `createdBooking setup failed: ${response.status()} ${await response.text()}`,
      );
    }
    const created: CreateBookingResponse = await response.json();

    await use(created);

    // Teardown is the last line of this fixture
    await client.remove(created.bookingid);
  },
});

export { expect } from '@playwright/test';