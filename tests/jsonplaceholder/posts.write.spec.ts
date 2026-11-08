import { test, expect } from "@playwright/test";

//'https://jsonplaceholder.typicode.com'

test("POST-Comments", async ({ request }) => {
  const payload = {
    postId: 1,
    name: "Kiran Test",
    email: "kiran@example.com",
    body: "Practicing Playwright API testing",
  };

  const response = await request.post("/comments", { data: payload });
  const body = await response.json();
  console.log(await response.json());

  expect(response.status(), "POST should return 201 Created").toBe(201);

  expect(await response.json()).toMatchObject(payload);

  expect(response.headers()["content-type"]).toContain("application/json");
  expect(typeof body.id).toBe("number");
  expect(body.id).toBeGreaterThan(100);
});

test("GET-WEEk-2 exe-3", async ({ request }) => {
  const response = await request.get("/posts/9999");
  // console.log(response.status());
  expect(response.status());
  expect(response.ok()).toBeFalsy();
  // console.log(await response.json());
  expect(await response.json()).toEqual({});
});

test("GET POST BY PARAMS", async ({ request }) => {
  interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
  }
  const response = await request.get("/posts", { params: { userID: 1 } });
  console.log(response.url());
  expect(response.status()).toBe(200);
  const posts: Post[] = await response.json();
  expect(posts.length).toBeGreaterThan(0);

  for (const post of posts) {
    expect(post.userId, `post ${post.id} has the wrong userId`).toBe(1);
  }
});

test("GET-Par-1", async ({ request }) => {
  const response = await request.get("/users/1");

  expect(response.status()).toBe(200);

  await expect(response).toBeOK();

  const user = await response.json();

  expect(user.name).toBeTruthy();

  expect(user.email).toContain("@");

  expect(user.address.city).toBeTruthy();
});

test("PATCH updates One field", async ({ request }) => {
  const response = await request.patch("/posts/1", {
    data: { title: "patched" },
  });
});

test("PUT replaces a Post", async ({ request }) => {
  const payload = { id: 1, title: "updated", body: "new body", userId: 1 };
  const response = await request.put("/posts/1", { data: payload });

  expect(response.status()).toBe(200);

  console.log(await response.json());

  // expect(await response.json())
});

test("Post Creates a post", async ({ request }) => {
  const payload = { title: "foo", body: "bar", userId: 1 };
  const response = await request.post("/posts", { data: payload });

  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body).toMatchObject(payload);
  expect(body.id).toBeDefined();
});
