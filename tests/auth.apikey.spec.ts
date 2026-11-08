
import { test, expect } from '@playwright/test';

const apiKey = process.env.REQRES_API_KEY;
const url = 'https://reqres.in/api/users?page=2';

test('GET /api/users with a valid key is recognised', async ({ request }) => {
  test.skip(!apiKey, 'REQRES_API_KEY not set');

  const response = await request.get(url, { headers: { 'x-api-key': apiKey! } });
  expect(response.status(), await response.text()).toBe(200);

  const body = await response.json();
  expect(body.page).toBe(2);
  expect(body.data.length).toBeGreaterThan(0);
  expect(body.data[0]).toHaveProperty('email');
  // The key was recognised, so this is not the keyless tier (undocumented field)
  expect(body._meta.context, 'valid key should not be treated as keyless').not.toBe('keyless_success');
});

test('GET /api/users with no key falls back to the keyless tier', async ({ request }) => {
  const response = await request.get(url);
  expect(response.status()).toBe(200);   // observed; the standard for a missing key would be 401

  const body = await response.json();
  expect(body._meta.context).toBe('keyless_success');
});

test('GET /api/users with a wrong key is rejected', async ({ request }) => {
  const response = await request.get(url, { headers: { 'x-api-key': 'invalid-key' } });
  expect(response.status(), await response.text()).toBe(403);   // standard would usually be 401

  const body = await response.json();
  expect(body.error).toBe('invalid_api_key');
  expect(body).not.toHaveProperty('data');   // no user data leaks on a rejected key
});




































// import { test, expect } from '@playwright/test';
// import 'dotenv/config';

// const apiKey = process.env.REQRES_API_KEY;
// const url = 'https://reqres.in/api/users?page=2';
// // test.skip(!apiKey, 'REQRES_API_KEY not set');

// test('with a wrong key', async ({ request }) => {
//   const response = await request.get(url, { headers: { 'x-api-key': 'invalid-key' } });
//   console.log(response.status(), await response.text());
// });


// test('with no key', async ({ request }) => {
//   const response = await request.get(url);
//   const body = await response.json();
//   console.log(Object.keys(body))
//   console.log(response.status(), body._meta);
//   expect(response.status()).toBe(200);          // observed today
// });

// test.skip('with a valid key', async ({ request }) => {
//   test.skip(!apiKey, 'REQRES_API_KEY not set');
//   const response = await request.get(url, { headers: { 'x-api-key': apiKey! } });
//   const body = await response.json();
//   console.log(response.status(), body._meta);   // read this first, then assert
//   expect(response.status()).toBe(200);
// });




// test('GET /api/users with a valid API key returns users', async ({ request }) => {
//   const response = await request.get('https://reqres.in/api/users?page=2', {
    
//   });
//   expect(response.status(), await response.text()).toBe(200);

//   const body = await response.json();
//   console.log(body);
//   expect(body.page).toBe(2);
//   expect(Array.isArray(body.data)).toBeTruthy();
//   expect(body.data.length).toBeGreaterThan(0);
//   expect(body.data[0]).toHaveProperty('email');
// });

// test.skip('GET /api/users with a valid API key returns users1', async ({ request }) => {
//   const response = await request.get('https://reqres.in/api/users?page=2', {
//     headers: { 'x-api-key': apiKey! },
//   });
//   expect(response.status(), await response.text()).toBe(200);

//   const body = await response.json();
//   console.log(body);
//   expect(body.page).toBe(2);
//   expect(Array.isArray(body.data)).toBeTruthy();
//   expect(body.data.length).toBeGreaterThan(0);
//   expect(body.data[0]).toHaveProperty('email');
// });