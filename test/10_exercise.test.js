const request = require('supertest');
const app = require('../app');
const { exerciseModel, usersModel } = require("../models");
const sinon = require('sinon');

let findStub;

// pasa lo mismo qu foods da error al correr todos juntos pq no es por userid.

beforeAll(async () => {
    await exerciseModel.deleteMany({});
    await usersModel.deleteMany({});
  });
  
  async function generateToken() {
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
    });
    const response1 = await request(app).post("/api/auth/login").send({
      // se logea para obtener token
      email: "adminuser@admin.com",
      password: "adminuser",
    });
    return response1._body.token;
  }

test("An exercise can't be created without a name", async() => {
    const testToken = await generateToken();
    const response = await request(app)
    .post('/api/exercise')
    .send({
            name:"",
            caloriesBurn:10,
            time: 10,
        }).set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(403);
    expect(response.body.errors[0].msg).toEqual("Name cant be empty");
})

test("An exercise can't be created without caloriesBurn", async() => {
    const testToken = await generateToken();
    const response = await request(app)
    .post('/api/exercise')
    .send({
            name:"Caminata",
            caloriesBurn:"",
            time: 10,
        }).set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(403);
    expect(response.body.errors[0].msg).toEqual("CaloriesBurn cant be empty");
})

test("An exercise can't be created without time", async() => {
    const testToken = await generateToken();
    const response = await request(app)
    .post('/api/exercise')
    .send({
            name:"Caminata",
            caloriesBurn:10,
            time: "",
        }).set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(403);
    expect(response.body.errors[0].msg).toEqual("Time cant be empty");
})

test("User cant create without a valid token", async () => {
    const response = await request(app)
    .post('/api/exercise')
    .send({
            name:"Caminata",
            caloriesBurn:10,
            time: 10,
        }).set("Authorization", "Bearer " + "token123");
    expect(response.statusCode).toEqual(401);
    expect(response.body.message).toEqual("Failed to authenticate token");
  },7000);


  test("User create two exercises and gets it successfully", async () => {
    const testToken = await generateToken();
    const response = await request(app)
    .post('/api/exercise')
    .send({
            name:"Caminata",
            caloriesBurn:10,
            time: 10,
        }).set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(200);
    const response1 = await request(app)
    .post('/api/exercise')
    .send({
            name:"Correr",
            caloriesBurn:10,
            time: 10,
        }).set("Authorization", "Bearer " + testToken);
    expect(response1.statusCode).toEqual(200);
    const response3 = await request(app)
      .get("/api/exercise")
      .set("Authorization", "Bearer " + testToken);
    expect(response3.statusCode).toEqual(200);
    expect(response3.body.data[0].name).toEqual("Caminata");
    expect(response3.body.data[1].name).toEqual("Correr");
  });
