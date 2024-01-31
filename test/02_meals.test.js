const request = require("supertest");
const app = require("../app");
const { mealModel } = require("../models");
const sinon = require("sinon");

beforeAll(async () => {
  await mealModel.deleteMany({});
});

let findStub;

test("Esto deberia retornar un 403", async () => {
  const response = await request(app).post("/api/meals").send({
    name: "",
    foods: [],
    date: "20/10/1998",
    hour: "20:15",
    calories: 200,
  });
  expect(response.statusCode).toEqual(403);
});

test("Se creo la comida correctamente", async () => {
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: 10,
          weight: 1,
          category : "Verdura"
        },
        {
          name: "Lomo",
          calories: 20,
          weight: 1,
          category : "Carne"
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
      carbs:10,
      proteins:10,
      fats:10,
      userId: "987654321",
    });
  expect(response.statusCode).toEqual(200);
});

test("[DELETE MEAL] Esto deberia retornar un 200", async () => {
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: 10,
          weight: 1,
          category : "Verdura"
        },
        {
          name: "Lomo",
          calories: 20,
          weight: 1,
          category : "Carne"
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
      carbs:10,
      proteins:10,
      fats:10,
      userId: "987654321",
    });

  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;

  const response1 = await request(app).delete("/api/meals/" + mealId);
  expect(response1.statusCode).toEqual(200);
});

test("[UPDATE MEAL] Esto deberia retornar un 200", async () => {
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: 10,
          weight: 1,
          category : "Verdura"
        },
        {
          name: "Lomo",
          calories: 20,
          weight: 1,
          category : "Carne"
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
      carbs:10,
      proteins:10,
      fats:10,
      userId: "987654321",
    });

  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;

  const response1 = await request(app)
    .put("/api/meals/" + mealId)
    .send({
      name: "Carne con papas modificada",
    });
  expect(response1.statusCode).toEqual(200);
});

test("[UPDATE MEAL] Esto deberia retornar un 200", async () => {
  sinon.stub(mealModel, "findOneAndUpdate").throws(new Error("Database error"));

  const response = await request(app).put("/api/meals/1234").send({
    name: "Carne con papas modificada",
  });
  expect(response.statusCode).toEqual(500);
});

test("[DELETE MEAL] Esto deberia retornar un 200", async () => {
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: 10,
          weight: 1,
          category : "Verdura"
        },
        {
          name: "Lomo",
          calories: 20,
          weight: 1,
          category : "Carne"
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
      carbs:10,
      proteins:10,
      fats:10,
      userId: "987654321",
    });

  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;

  const response1 = await request(app).delete("/api/meals/" + mealId);
  expect(response1.statusCode).toEqual(200);
});

test("[DELETE MEAL] Esto deberia retornar un 500", async () => {
  sinon.stub(mealModel, "delete").throws(new Error("Database error"));

  const response = await request(app).delete("/api/meals/1234");
  expect(response.statusCode).toEqual(500);
});

test("[GET MEALS BY USER ID AND DATE] Esto deberia retornar un 200", async () => {
  const fechaActual = new Date();
  // Obtener el año, mes y día
  const año = fechaActual.getFullYear();
  const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); // Los meses son indexados desde 0
  const dia = fechaActual.getDate().toString().padStart(2, '0');

  // Formatear la fecha como "YYYY-MM-DD"
  const fechaFormateada = `${año}-${mes}-${dia}`;
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: 10,
          weight: 1,
          category : "Verdura"
        },
        {
          name: "Lomo",
          calories: 20,
          weight: 1,
          category : "Carne"
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
      carbs:10,
      proteins:10,
      fats:10,
      userId: "987654321",
    });

  const response1 = await request(app).get(
    "/api/meals/user/987654321/date/"+fechaFormateada,
  );
  expect(response1.statusCode).toEqual(200);
});

test("[GET CALORIES BY USER ID AND MONTH] Esto deberia retornar un 200", async () => {
  const response = await request(app)
  .post("/api/meals")
  .send({
    name: "Carne con papas",
    foods: [
      {
        name: "Papa",
        calories: 10,
        weight: 1,
        category : "Verdura"
      },
      {
        name: "Lomo",
        calories: 20,
        weight: 1,
        category : "Carne"
      },
    ],
    date: new Date(),
    hour: "20:15",
    calories: 200,
    carbs:10,
    proteins:10,
    fats:10,
    userId: "987654321",
  });
    const startDate = encodeURI("Mon Jan 29 2024 00:00:00 GMT-0300 (hora estándar de Argentina)")

    const endDate = encodeURI("Mon Feb 12 2024 00:00:52 GMT-0300 (hora estándar de Argentina)")
    
  const response1 = await request(app).get(
    "/api/meals/user/987654321/between/"+startDate+"/"+endDate+"/type/calories"
  );
  expect(response1.statusCode).toEqual(200);
});

test("Esto deberia retornar un 200", async () => {
  const response = await request(app).get("/api/meals");
  expect(response.statusCode).toEqual(200);
});

test("Esto deberia retornar un 200", async () => {
  const response = await request(app).get("/api/meals/user/987654321");
  expect(response.statusCode).toEqual(200);
});

test("[GET CALORIES BY USER ID BETWEEN DAYS] Esto deberia retornar un 200", async () => {
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: 10,
          weight: 1,
          category : "Verdura"
        },
        {
          name: "Lomo",
          calories: 20,
          weight: 1,
          category : "Carne"
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
      carbs:10,
      proteins:10,
      fats:10,
      userId: "987654321",
    });

  const startDate = encodeURI("Mon Jan 29 2024 00:00:00 GMT-0300 (hora estándar de Argentina)")

  const endDate = encodeURI("Mon Feb 12 2024 00:00:52 GMT-0300 (hora estándar de Argentina)")
  const response1 = await request(app).get(
    "/api/meals/user/987654321/startDate/"+startDate+"/endDate/"+endDate+"/type/calories"
  );
  expect(response1.statusCode).toEqual(200);
});

test("[GET MEALS]Esto deberia retornar un 500", async () => {
  findStub = sinon.stub(mealModel, "find").throws(new Error("Database error"));

  const response = await request(app).get("/api/meals");
  expect(response.status).toEqual(500);
});

test("[GET MEALS BY USER ID]Esto deberia retornar un 500", async () => {
  findStub.throws(new Error("Database error"));
  const response = await request(app).get("/api/meals/user/123");
  expect(response.status).toEqual(500);
});

test("[GET MEALS BY USER ID AND DATE] Esto deberia retornar un 500", async () => {
  findStub.throws(new Error("Database error"));
  const response = await request(app).get(
    "/api/meals/user/987654321/date/2023-10-04"
  );
  expect(response.status).toEqual(500);
});

test("[GET CALORIES BY USER ID AND MONTH] Esto deberia retornar un 500", async () => {
  findStub.throws(new Error("Database error"));
  const response = await request(app).get(
    "/api/meals/user/987654321/between/2022-10-18/2023-10-19/type/calories"
  );
  expect(response.statusCode).toEqual(500);
});

test("[GET CALORIES BY USER ID BETWEEN DAYS] Esto deberia retornar un 500", async () => {
  findStub.throws(new Error("Database error"));
  const response = await request(app).get(
    "/api/meals/user/987654321/startDate/2022-10-18/endDate/2023-10-19/type/calories"
  );
  expect(response.statusCode).toEqual(500);
});

test("[CREATE MEAL]Esto deberia retornar un 500", async () => {
  sinon.stub(mealModel, "create").throws(new Error("Database error"));

  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: 10,
          weight: 1,
          category : "Verdura"
        },
        {
          name: "Lomo",
          calories: 20,
          weight: 1,
          category : "Carne"
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
      carbs:10,
      proteins:10,
      fats:10,
      userId: "987654321",
    });

  expect(response.status).toEqual(500);
});
