// import { test, expect } from "@playwright/test";

// test("is empty cred", async ({ request }) => {
//     const response = await request.get(
//       "https://httpbin.org/basic-auth/user/pass",
//     );
//     //   console.log(response.status(),await response.text(),response.headers());
//     // console.log(response.headers());
//     expect(response.status(), await response.text()).toBe(401);
//     expect(response.headers()["www-authenticate"]).toContain("Basic");
//     expect(await response.text()).toBe("");
//   });


// test.describe.skip("Wrong Block", () => {
//   test.use({ httpCredentials: { username: "user", password: "wrong" } });
//   test("is rejected", async ({ request }) => {
//     const response = await request.get(
//       "https://httpbin.org/basic-auth/user/pass",
//     );
//     //   console.log(response.status(),await response.text(),response.headers());
//     // console.log(response.headers());
//     expect(response.status(), await response.text()).toBe(401);
//     expect(response.headers()["www-authenticate"]).toContain("Basic");
//     expect(await response.text()).toBe("");
//   });
// });

// // test.use({
// //   httpCredentials: {
// //     username: "user",
// //     password: "pass",
// //   },
// // });

// test.skip("Vai Http Cred", async ({ request }) => {
//   const response = await request.get(
//     "https://httpbin.org/basic-auth/user/pass",
//   );

//   // console.log(await response.status() ,await response.text());
//   expect(response.status(), await response.text()).toBe(200);

//   const body = await response.json();
//   expect(body.authenticated).toBe(true);
//   expect(body.user).toBe("user");
// });

// test.skip("basic user id and pass", async ({ request }) => {
//   const encoded = Buffer.from("user:pass").toString("base64");

//   const response = await request.get(
//     "https://httpbin.org/basic-auth/user/pass",
//     { headers: { Authorization: `Basic ${encoded}` } },
//   );

//   console.log(response.status(), await response.text());
//   expect(response.status(), await response.text()).toBe(200);

//   const body = await response.json();
//   expect(body.authenticated).toBe(true);
//   expect(body.user).toBe("user");
// });
