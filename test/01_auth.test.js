const request = require('supertest');
const sinon = require('sinon');
const app = require('../app');
const { usersModel } = require("../models");
const jwt = require("jsonwebtoken");


let findOneStub;
let findOneAndUpdateStub;

beforeAll(async () => {
    await usersModel.deleteMany({});
});

function generateTestToken() {
  const genericUserData = {
    userId: "genericUserId",
    firstName: "test",
    lastName: "user",
    email: "testuser@example.com",
    sex: "male",
    age: 25,
    height: 1.75,
    weight: 68,
  };

  const secretKey = "llave_secreta";
  const options = { expiresIn: "1h" };

  return jwt.sign({ _id: genericUserData.userId }, secretKey, options);
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
      firstName: "test",
      lastName: "user",
      email: "adminuser@admin.com",
      password: "adminuser",
      sex: "male",
      age: "23",
      height: "1.80",
      weight: "70",
    });
    expect(response.statusCode).toEqual(200);
    const response1 = await request(app)
      .get("/api/auth/users/")
      .set("Authorization", "Bearer " + response._body.token);
    expect(response1.body.data.firstName).toEqual("test");
    expect(response1.body.data.lastName).toEqual("user");
    expect(response1.body.data.email).toEqual("adminuser@admin.com");
    expect(response1.body.data.sex).toEqual("male");
    expect(response1.body.data.age).toEqual(23);
    expect(response1.body.data.height).toEqual(1.8);
    expect(response1.body.data.weight).toEqual(70);
  });
  
  test("User tries to login with an incorrect password and gets an error", async () => {
    const response1 = await request(app).post("/api/auth/register").send({
      firstName: "test",
      lastName: "user",
      email: "adminuser@admin.com",
      password: "adminuser",
      sex: "male",
      age: "23",
      height: "1.80",
      weight: "70",
    });
    expect(response1.statusCode).toEqual(200);
    const response = await request(app).post("/api/auth/login").send({
      email: "adminuser@admin.com",
      password: "error",
    });
    expect(response.statusCode).toEqual(401);
  });

  
  test("A user sign up and then update his password, getting an 200 for confirmation", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "test",
      lastName: "user",
      email: "testuser@gmail.com",
      password: "testuser",
      sex: "male",
      age: "23",
      height: "1.80",
      weight: "70",
    });
    expect(response.statusCode).toEqual(200);
    const testToken = generateTestToken();
    const responseParsed = JSON.parse(response.text);
  
    const response1 = await request(app)
      .put("/api/auth/users/updatePassword/" + responseParsed.user._id)
      .send({
        password: "newPassword",
      })
      .set("Authorization", "Bearer " + testToken);
    expect(response1.statusCode).toEqual(200);

    
  });
  
  test("User sing up is successfully completed and stored in DB", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "test",
      lastName: "user",
      email: "testuser1@gmail.com",
      password: "testuser",
      sex: "male",
      age: "23",
      height: "1.80",
      weight: "70",
    });
    expect(response.statusCode).toEqual(200);
    const testToken = generateTestToken();
    const responseParsed = JSON.parse(response.text);
    const response1 = await request(app)
      .get("/api/auth/users/" + responseParsed.user._id)
      .set("Authorization", "Bearer " + testToken);
    expect(response1.body.data.firstName).toEqual("test");
    expect(response1.body.data.lastName).toEqual("user");
    expect(response1.body.data.email).toEqual("testuser1@gmail.com");
    expect(response1.body.data.sex).toEqual("male");
    expect(response1.body.data.age).toEqual(23);
    expect(response1.body.data.height).toEqual(1.8);
    expect(response1.body.data.weight).toEqual(70);
    expect(response1.statusCode).toEqual(200);
  });
  
  test("User sing up and the user info is obtained via its email", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "test",
      lastName: "user",
      email: "testuser999@gmail.com",
      password: "testuser",
      sex: "male",
      age: "23",
      height: "1.80",
      weight: "70",
    });
    expect(response.statusCode).toEqual(200);
    const testToken = generateTestToken();
    const response1 = await request(app)
      .get("/api/auth/users/email/testuser999@gmail.com")
      .set("Authorization", "Bearer " + testToken);
    expect(response1.statusCode).toEqual(200);
    expect(response1.body.data.firstName).toEqual("test");
    expect(response1.body.data.lastName).toEqual("user");
    expect(response1.body.data.email).toEqual("testuser999@gmail.com");
    expect(response1.body.data.sex).toEqual("male");
    expect(response1.body.data.age).toEqual(23);
    expect(response1.body.data.height).toEqual(1.8);
    expect(response1.body.data.weight).toEqual(70);
  });
  
  test("Se creo y obtuvo el usuario por email correctamente", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "test",
      lastName: "user",
      email: "testuser9999@gmail.com",
      password: "testuser",
      sex: "male",
      age: "23",
      height: "1.80",
      weight: "70",
      role: "user",
    });
    expect(response.statusCode).toEqual(200);
  
    const responseParsed = JSON.parse(response.text);
    const testToken = generateTestToken();
    const response1 = await request(app)
      .put("/api/auth/users/" + responseParsed.user._id)
      .send({
        firstName: "nuevo",
        lastName: "nombre",
      })
      .set("Authorization", "Bearer " + testToken);
    expect(response1.statusCode).toEqual(200);
  });
  
  test("Se creo y actualizo el usuario correctamente", async () => {
    const response = await request(app).post("/api/auth/register").send({
      firstName: "test99",
      lastName: "user",
      email: "testuser99@gmail.com",
      password: "testuser",
      sex: "male",
      age: "23",
      height: "1.80",
      weight: "70",
    });
    expect(response.statusCode).toEqual(200);
  
    const responseParsed = JSON.parse(response.text);
    const testToken = generateTestToken();
    const response1 = await request(app)
      .delete("/api/auth/users/" + responseParsed.user._id)
      .set("Authorization", "Bearer " + testToken);
    expect(response1.statusCode).toEqual(200);
  });
  
  test("[LOGIN]Esto debe retornar un error 500", async () => {
    const requestBody = {
      email: "test@example.com",
      password: "password123",
    };
  
    findOneStub = sinon
      .stub(usersModel, "findOne")
      .throws(new Error("Database error"));
  
    const response = await request(app).post("/api/auth/login").send(requestBody);
  
    expect(response.status).toEqual(500);
  
    usersModel.findOne.restore();
  });
  
  test("[REGISTER]Esto debe retornar un error 500", async () => {
    const requestBody = {
      firstName: "test",
      lastName: "user",
      email: "adminuser@admin.com",
      password: "adminuser",
      sex: "male",
      age: "23",
      height: "1.80",
      weight: "70",
      role: "user",
    };
  
    sinon.stub(usersModel, "create").throws(new Error("Database error"));
  
    const response = await request(app)
      .post("/api/auth/register")
      .send(requestBody);
  
    expect(response.status).toEqual(500);
  });
  
  test("[DELETE]Esto debe retornar un error 500", async () => {
    const testToken = generateTestToken();
    sinon.stub(usersModel, "delete").throws(new Error("Database error"));
  
    const response = await request(app)
      .delete("/api/auth/users/1234")
      .set("Authorization", "Bearer " + testToken);
  
    expect(response.status).toEqual(500);
  });
  
  test('[GET USERS]Esto debe retornar un error 500"', async () => {
    const testToken = generateTestToken();
    sinon.stub(usersModel, "find").throws(new Error("Database error"));
  
    const response = await request(app)
      .get("/api/auth/users")
      .set("Authorization", "Bearer " + testToken);
  
    expect(response.status).toEqual(500);
  });
  
  test('[GET USER BY ID]Esto debe retornar un error 500"', async () => {
    sinon.stub(usersModel, "findOne").throws(new Error("Database error"));
    const testToken = generateTestToken();
  
    const response = await request(app)
      .get("/api/auth/users/1234")
      .set("Authorization", "Bearer " + testToken);
  
    expect(response.status).toEqual(500);
  });
  
  test('[GET USER BY EMAIL]Esto debe retornar un error 500"', async () => {
    sinon.stub(usersModel, "findOne").throws(new Error("Database error"));
    const testToken = generateTestToken();
    const response = await request(app)
      .get("/api/auth/users/email/1234")
      .set("Authorization", "Bearer " + testToken);
  
    expect(response.status).toEqual(500);
  });
  
  test('[UPDATE USER]Esto debe retornar un error 500"', async () => {
    findOneAndUpdateStub = sinon
      .stub(usersModel, "findOneAndUpdate")
      .throws(new Error("Database error"));
    const testToken = generateTestToken();
    const response = await request(app)
      .put("/api/auth/users/1234")
      .send({
        firstName: "test",
      })
      .set("Authorization", "Bearer " + testToken);
  
    expect(response.status).toEqual(500);
  });
  
  test('[UPDATE PASSWORD]Esto debe retornar un error 500"', async () => {
    const requestBody = {
      password: "cambioDePassword",
    };
    const testToken = generateTestToken();
    findOneAndUpdateStub.throws(new Error("Database error"));
  
    const response = await request(app)
      .put("/api/auth/users/updatePassword/1234")
      .send(requestBody)
      .set("Authorization", "Bearer " + testToken);
  
    expect(response.status).toEqual(500);
  });