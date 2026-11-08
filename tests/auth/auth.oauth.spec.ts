import {test , expect} from "@playwright/test"
import { createMockOAuth } from '../helpers/mock-oauth-server'

import { OAuthClient } from "../src/oauth-client"

const mock = createMockOAuth(4010,3)

test.beforeAll(async ()=>{
    await mock.start()
})


test.afterAll(async ()=>{
    await mock.stop()
})

test("MOCK TES" , async({request})=>{

    console.log("MOCK PASS");
})

test('token is reused until it expires', async ({ request }) => {
  const client = new OAuthClient(request, mock.url);
  const before = mock.tokensIssued();

  for (let i = 0; i < 3; i++) {
    const response = await client.getData();
    expect(response.status(), await response.text()).toBe(200);
  }
  expect(mock.tokensIssued() - before).toBe(1);

  await new Promise((resolve) => setTimeout(resolve, 4000));   // longer than the 3-second lifetime

  await client.getData();
  expect(mock.tokensIssued() - before).toBe(2);
});

test('wrong client secret is rejected', async ({ request }) => {
  const client = new OAuthClient(request, mock.url, 'my-client', 'wrong');
  const response = await client.requestToken();
  expect(response.status(), await response.text()).toBe(401);
  expect((await response.json()).error).toBe('invalid_client');
});

test('GET /api/data without a token is rejected', async ({ request }) => {
  const response = await request.get(`${mock.url}/api/data`);
  expect(response.status(), await response.text()).toBe(401);
});