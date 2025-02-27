const request = require("supertest");
const app = require("../app");
const { usersModel,foodModel } = require("../models");

beforeAll(async () => {
  await usersModel.deleteMany({});
  await foodModel.deleteMany({});
});

async function createCategory(name, testToken) {
  const response = await request(app)
    .post("/api/category")
    .send({
      name: name,
    })
    .set("Authorization", "Bearer " + testToken);
  return response._body.data._id;
}

test("User tries to login with a non existing account an recieves an error (404)", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: "noexiste@esteusuario.com",
    password: "error",
  });
  expect(response.statusCode).toEqual(404);
});

test("User sign up is succesfull and new user its stored in the DB", async () => {
  const response = await request(app).post("/api/auth/register").send({
    // se registra
    firstName: "test",
    lastName: "user",
    email: "prueba@admin.com",
    password: "adminuser",
    sex: "male",
    age: "23",
    height: "1.80",
    weight: "70",
  });
  expect(response.statusCode).toEqual(200); // valida que se registro ok
  const response1 = await request(app).post("/api/auth/login").send({
    // se logea para obtener token
    email: "prueba@admin.com",
    password: "adminuser",
  });
  const response2 = await request(app) // busca si existe en la base de datos y verifica que todos los datos esten ok
    .get("/api/auth/users/")
    .set("Authorization", "Bearer " + response1._body.token);

  expect(response2.body.data.firstName).toEqual("test");
  expect(response2.body.data.lastName).toEqual("user");
  expect(response2.body.data.email).toEqual("prueba@admin.com");
  expect(response2.body.data.sex).toEqual("male");
  expect(response2.body.data.age).toEqual(23);
  expect(response2.body.data.height).toEqual(1.8);
  expect(response2.body.data.weight).toEqual(70);
},7000);

test("User sign up and update his allergies and is succesfully stored in the DB", async () => {
  const response = await request(app).post("/api/auth/register").send({
    // se registra
    firstName: "test",
    lastName: "user",
    email: "adminuser@admin.com",
    password: "adminuser",
    sex: "male",
    age: "23",
    height: "1.80",
    weight: "70",
    allergies : []
  });
  expect(response.statusCode).toEqual(200); // valida que se registro ok
  const response1 = await request(app).post("/api/auth/login").send({
    // se logea para obtener token
    email: "adminuser@admin.com",
    password: "adminuser",
  });
  const category = await createCategory("Carne", response1._body.token);
  const response2 = await request(app)
    .post("/api/foods/")
    .send({
      name: "Prueba",
      calories: "10",
      weight: "10",
      category: category,
    })
    .set("Authorization", "Bearer " + response1._body.token);
    
    const response3 = await request(app).put("/api/auth/users").send({
      allergies: [{allergyId:response2._body.data._id}],
    }).set("Authorization", "Bearer " + response1._body.token);
  
    const response4 = await request(app) // busca si existe en la base de datos y verifica que todos los datos esten ok
    .get("/api/auth/users/")
    .set("Authorization", "Bearer " + response1._body.token);
    console.log(response4.body.data)
    expect(response4.body.data.allergies.length).toEqual(1)
});


test("User cant update his Password with a random token", async () => {
  const response = await request(app)
    .put("/api/auth/users/updatePassword/")
    .send({
      password: "newPassword",
    })
    .set("Authorization", "Bearer " + "token123");
    expect(response.status).toEqual(400);
    expect(response._body.message).toEqual("TOKEN_IS_REQUIRED");
});

test("User cant update his Password with an invalid token format", async () => {
  const response = await request(app)
    .put("/api/auth/users/updatePassword/")
    .send({
      password: "newPassword",
    })
    .set("Authorization", "Bearer " + "");
    expect(response.status).toEqual(400);
    expect(response._body.message).toEqual("TOKEN_IS_REQUIRED");
});

test("User cant update his Password without a token", async () => {
  const response = await request(app)
    .put("/api/auth/users/updatePassword/")
    .send({
      password: "newPassword",
    });
    expect(response.status).toEqual(400);
    expect(response._body.message).toEqual("TOKEN_IS_REQUIRED");
});

test("User cant sign-in in an unexsiting account", async () => {
  const response = await request(app).post("/api/auth/login").send({
    email: "noexiste@admin.com",
    password: "noexiste",
  });
  expect(response.status).toEqual(404);
  expect(response._body.message).toEqual("USER_NOT_EXISTS");
});

test("User cant login with an incorrect password and gets an error", async () => {
  const response1 = await request(app).post("/api/auth/register").send({
    firstName: "test",
    lastName: "user",
    email: "badlogin@admin.com",
    password: "adminuser",
    sex: "male",
    age: "23",
    height: "1.80",
    weight: "70",
  });
  expect(response1.statusCode).toEqual(200);
  const response2 = await request(app).post("/api/auth/login").send({
    email: "badlogin@admin.com",
    password: "error",
  });
  expect(response2.statusCode).toEqual(401);
});


test("User sign up and then delete his account succesfull", async () => {
  const response = await request(app).post("/api/auth/register").send({
    // se registra
    firstName: "test",
    lastName: "user",
    email: "usertodelete@admin.com",
    password: "adminuser",
    sex: "male",
    age: "23",
    height: "1.80",
    weight: "70",
  });
  expect(response.statusCode).toEqual(200);

  const response2 = await request(app).post("/api/auth/login").send({
    // se logea para obtener token
    email: "usertodelete@admin.com",
    password: "adminuser",
  });
  expect(response2.statusCode).toEqual(200);

  const response3 = await request(app)
    .delete("/api/auth/users/")
    .set(
      // borra el usuario
      "Authorization",
      "Bearer " + response2._body.token
    );
  expect(response3.statusCode).toEqual(200);
  expect(response3._body.message).toEqual("USER_DELETE_SUCCESFULL");

  const response4 = await request(app) // busca si existe en la base de datos y no existe
    .get("/api/auth/users/")
    .set("Authorization", "Bearer " + response2._body.token);
  
  expect(response4.status).toEqual(404);
  expect(response4._body.message).toEqual("USER_NOT_EXISTS");
});