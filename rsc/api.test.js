const fetch = require('node-fetch');

let userId = '';
const body = {
  "username": "Janka Mavr",
  "age": 35,
  "hobbies": [
    "Snowboarding"
  ]
};
const updatedUser = {
  "username": "Jon Doe",
  "age": 40,
  "hobbies": []
};

describe('API tests', () => {
  test('GET api/users - DB does not have any user yet', async () => {
    const response = await fetch('http://localhost:3000/api/users');
    const users = await response.json();
    expect(users).toHaveLength(0);
  });

  test('POST api/users - New user has been created', async () => {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'post',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    });
    const user = await response.json();
    userId = user.id;
    expect(user).toEqual({ ...body, id: userId });
  });

  test(`GET api/users:id - DB has the created user`, async () => {
    const response = await fetch(`http://localhost:3000/api/users?id=${userId}`);
    const user = await response.json();
    expect(user).toEqual({ ...body, id: userId });
  });

  test(`PUT api/users - Created user has been changed`, async () => {
    const response = await fetch(`http://localhost:3000/api/users?id=${userId}`, {
      method: 'put',
      body: JSON.stringify(updatedUser),
      headers: {'Content-Type': 'application/json'}
    });
    const user = await response.json();
    expect(user).toEqual({ ...updatedUser, id: userId });
    expect(user.id).toEqual(userId);
  });

  test(`DELETE api/users - Created user has been deleted`, async () => {
    const response = await fetch(`http://localhost:3000/api/users?id=${userId}`, { method: 'delete' });
    const status = await response.status;
    expect(status).toEqual(204);
  });

  test(`GET api/users:id - DB does not have created user anymore`, async () => {
    const response = await fetch(`http://localhost:3000/api/users?id=${userId}`);
    const status = await response.status;
    expect(status).toEqual(404);
  });
})
