
import { test, expect, APIRequestContext } from '@playwright/test';

async function login(request: APIRequestContext) {
  const response = await request.post('https://dummyjson.com/auth/login', {
    data: { username: 'emilys', password: 'emilyspass', expiresInMins: 30 },
  });
  expect(response.status(), await response.text()).toBe(200);
  return response.json();
}

test('GET /auth/me with a valid Bearer token returns the logged-in user', async ({ request }) => {
  const loginBody = await login(request);

  const meResponse = await request.get('https://dummyjson.com/auth/me', {
    headers: { Authorization: `Bearer ${loginBody.accessToken}` },
  });
  expect(meResponse.status(), await meResponse.text()).toBe(200);

  const me = await meResponse.json();
  expect(me.username).toBe('emilys');
  expect(me.id).toBe(loginBody.id);
});

test.skip("JWT/Bearer Token", async ({ request }) => {
  const response = await request.post("https://dummyjson.com/auth/login", {
    data: { username: "emilys", password: "emilyspass", expiresInMins: 30 },
  });

  const body = await response.json();
  //   console.log(Object.keys(body)).

  //   console.log(await response.json(), await response.text());

  expect(response.status(), await response.text()).toBe(200);

  expect(typeof body.accessToken).toBe("string");
  expect(typeof body.refreshToken).toBe("string");
  expect(body.accessToken).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/); // header.payload.signature
  expect(body.username).toBe("emilys");
});
