import {test , expect} from "@playwright/test"

test.skip("GET single post returns correct data" , async({request})=>{

    // https://jsonplaceholder.typicode.com

    const response = await request.get('/posts/1')

  expect(response.status()).toBe(200);
  expect(response).toBeOK();
  expect(response.headers()['content-type']).toContain('application/json');


    const body = await response.json()
    console.log(body);
    expect(body).toMatchObject({id:1,userId:1})
    expect(body.title).toBeTruthy()

})

test("GET list returns 100 posts" , async({request})=>{

    const response = await request.get("/posts")

    const body = await response.json()

    console.log(body);

    expect(response.ok()).toBeTruthy()

    expect(body).toHaveLength(100)

})