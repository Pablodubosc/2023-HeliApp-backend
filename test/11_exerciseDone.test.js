const request = require("supertest");
const app = require("../app");
const { exerciseDoneModel } = require("../models");
const sinon = require("sinon");

beforeAll(async () => {
  await exerciseDoneModel.deleteMany({});
});

let findStub;

test("Esto deberia retornar un 403", async () => {
  const response = await request(app).post("/api/exerciseDone").send({
    name: "",
    exercises: [],
    date: "20/10/1998",
    hour: "20:15",
    caloriesBurn: 200,
  });
  expect(response.statusCode).toEqual(403);
});

test("Se creo el conjunto de ejercicios correctamente", async () => {
  const response = await request(app)
    .post("/api/exerciseDone")
    .send({
      name: "Aerobico",
      foods: [
        {
          name: "Correr",
          caloriesBurn: 100,
          time: 10,
        },
        {
          name: "Saltar la soga",
          calories: 200,
          quantity: 15,
        },
      ],
      date: "20/10/1998",
      caloriesBurn: 300,
      userId: "987654321",
    });
  expect(response.statusCode).toEqual(200);
});

test("[DELETE exercise Done] Esto deberia retornar un 200", async () => {
  const response = await request(app)
    .post("/api/exerciseDone")
    .send({
      name: "Aerobico",
      foods: [
        {
          name: "Correr",
          caloriesBurn: 100,
          time: 10,
        },
        {
          name: "Saltar la soga",
          calories: 200,
          quantity: 15,
        },
      ],
      date: "20/10/1998",
      caloriesBurn: 300,
      userId: "987654321",
    });

  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;

  const response1 = await request(app).delete("/api/exerciseDone/" + mealId);
  expect(response1.statusCode).toEqual(200);
});

test("[UPDATE exercise Done] Esto deberia retornar un 200", async () => {
  const response = await request(app)
    .post("/api/exerciseDone")
    .send({
      name: "Aerobico",
      foods: [
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
      date: "20/10/1998",
      caloriesBurn: 105,
      userId: "987654321",
    });

  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;

  const response1 = await request(app)
    .put("/api/exerciseDone/" + mealId)
    .send({
      name: "Carne con papas modificada",
    });
  expect(response1.statusCode).toEqual(200);
});

test("[UPDATE exercise Done ] Esto deberia retornar un 200", async () => {
  sinon.stub(exerciseDoneModel, "findOneAndUpdate").throws(new Error("Database error"));

  const response = await request(app).put("/api/exerciseDone/1234").send({
    name: "Carne con papas modificada",
  });
  expect(response.statusCode).toEqual(500);
});

test("[DELETE exercise Done] Esto deberia retornar un 200", async () => {
  const response = await request(app)
  .post("/api/exerciseDone")
  .send({
    name: "Aerobico",
    foods: [
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
    date: "2023-10-04T10:00:00.000Z",
    caloriesBurn: 105,
    userId: "987654321",
  });

  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;

  const response1 = await request(app).delete("/api/exerciseDone/" + mealId);
  expect(response1.statusCode).toEqual(200);
});

test("[DELETE exercise Done] Esto deberia retornar un 500", async () => {
  sinon.stub(exerciseDoneModel, "delete").throws(new Error("Database error"));

  const response = await request(app).delete("/api/exerciseDone/1234");
  expect(response.statusCode).toEqual(500);
});

test("[GET exerciseDone BY USER ID AND DATE] Esto deberia retornar un 200", async () => {
  const response = await request(app)
  .post("/api/exerciseDone")
  .send({
    name: "Aerobico",
    foods: [
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
    date: "2023-10-04T10:00:00.000Z",
    caloriesBurn: 105,
    userId: "987654321",
  });

  const response1 = await request(app).get(
    "/api/exerciseDone/user/987654321/date/2023-10-04T10:00:00.000Z"
  );
  expect(response1.statusCode).toEqual(200);
});


test("Esto deberia retornar un 200", async () => {
  const response = await request(app).get("/api/exerciseDone");
  expect(response.statusCode).toEqual(200);
});

test("Esto deberia retornar un 200", async () => {
  const response = await request(app).get("/api/exerciseDone/user/987654321");
  expect(response.statusCode).toEqual(200);
});

test("[GET exerciseDone BY USER ID BETWEEN DAYS] Esto deberia retornar un 200", async () => {
  const response = await request(app)
  .post("/api/exerciseDone")
  .send({
    name: "Aerobico",
    foods: [
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
    date: "2023-10-04T10:00:00.000Z",
    caloriesBurn: 105,
    userId: "987654321",
  });

  const response1 = await request(app).get(
    "/api/exerciseDone/user/987654321/startDate/2022-10-18/endDate/2023-10-19"
  );
  expect(response1.statusCode).toEqual(200);
});

test("[GET exerciseDone]Esto deberia retornar un 500", async () => {
  findStub = sinon.stub(exerciseDoneModel, "find").throws(new Error("Database error"));

  const response = await request(app).get("/api/exerciseDone");
  expect(response.status).toEqual(500);
});

test("[GET exerciseDone BY USER ID]Esto deberia retornar un 500", async () => {
  findStub.throws(new Error("Database error"));
  const response = await request(app).get("/api/exerciseDone/user/123");
  expect(response.status).toEqual(500);
});

test("[GET exerciseDone BY USER ID AND DATE] Esto deberia retornar un 500", async () => {
  findStub.throws(new Error("Database error"));
  const response = await request(app).get(
    "/api/exerciseDone/user/987654321/date/2023-10-04T10:00:00.000Z"
  );
  expect(response.status).toEqual(500);
});

test("[GET exerciseDone BY USER ID AND MONTH] Esto deberia retornar un 500", async () => {
  findStub.throws(new Error("Database error"));
  const response = await request(app).get(
    "/api/exerciseDone/user/987654321/between/2022-10-18/2023-10-19"
  );
  expect(response.statusCode).toEqual(500);
});

test("[GET caloriesBurn BY USER ID BETWEEN DAYS] Esto deberia retornar un 500", async () => {
  findStub.throws(new Error("Database error"));
  const response = await request(app).get(
    "/api/exerciseDone/user/987654321/startDate/2022-10-18/endDate/2023-10-19"
  );
  expect(response.statusCode).toEqual(500);
});

test("[CREATE exerciseDone]Esto deberia retornar un 500", async () => {
  sinon.stub(exerciseDoneModel, "create").throws(new Error("Database error"));

  const response = await request(app)
  .post("/api/exerciseDone")
  .send({
    name: "Aerobico",
    foods: [
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
    date: "2023-10-04T10:00:00.000Z",
    caloriesBurn: 105,
    userId: "987654321",
  });

  expect(response.status).toEqual(500);
});
