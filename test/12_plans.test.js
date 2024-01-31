const request = require("supertest");
const app = require("../app");
const { planModel } = require("../models");
const sinon = require("sinon");

beforeAll(async () => {
  await planModel.deleteMany({});
});

let findStub;

test("Se creo el plan correctamente", async() => {
  const response1 = await request(app)
  .post("/api/exerciseDone")
  .send({
    name: "Aerobico",
    exercises: [
      {
        name: "Correr",
        caloriesBurn: 100,
        time: 10,
      },
      {
        name: "Saltar la soga",
        calories: 5,
        quantity: 15,
      },
    ],
    date: new Date(),
    caloriesBurn: 105,
    userId: "987654321",
  });

  const response = await request(app)
    .post("/api/plans")
    .send({
      name: "plan ejercicios",
      suggestions: [],
      planType: "calories burn",
      planObjetive: 200,
      startDate: new Date(),
      endDate: new Date(),
      userId: "987654321",
    });
  expect(response.statusCode).toEqual(200);
})


test("[UPDATE plan] Esto deberia retornar un 200", async () => {
  const response = await request(app)
    .post("/api/plans")
    .send({
      name: "plan ejercicios",
      suggestions: [],
      planType: "calories burn",
      planObjetive: 200,
      startDate: new Date(),
      endDate: new Date(),
      userId: "987654321",
    });

  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;

  const response1 = await request(app)
    .put("/api/plans/")
    .send({
      name: "plan modificada",
      _id: mealId
    });
  expect(response1.statusCode).toEqual(200);
});


test("Esto deberia retornar un 200", async () => {
  const response = await request(app).get("/api/plans/987654321");
  expect(response.statusCode).toEqual(200);
});


test("[CREATE plan]Esto deberia retornar un 500", async () => {
  sinon.stub(planModel, "create").throws(new Error("Database error"));
  const response1 = await request(app)
  .post("/api/exerciseDone")
  .send({
    name: "Aerobico",
    exercises: [
      {
        name: "Correr",
        caloriesBurn: 100,
        time: 10,
      },
      {
        name: "Saltar la soga",
        calories: 5,
        quantity: 15,
      },
    ],
    date: new Date(),
    caloriesBurn: 105,
    userId: "987654321",
  });

  const response = await request(app)
    .post("/api/plans")
    .send({
      name: "plan ejercicios",
      suggestions: [],
      planType: "calories burn",
      planObjetive: "AA",
      startDate: new Date(),
      endDate: new Date(),
      userId: "987654321",
    });

  expect(response.status).toEqual(500);
});
