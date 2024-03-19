const request = require("supertest");
const app = require("../app");
const { mealModel } = require("../models");
const sinon = require("sinon");

beforeAll(async () => {
  await mealModel.deleteMany({});
});

let findStub;
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
function generateTestToken2() {
  const genericUserData = {
    userId: "genericUserId2",
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

test("A meal cannot be created without name", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "",
      foods: [
        {
          name: "Papa",
          calories: "10",
          quantity: 1,
        },
        {
          name: "Lomo",
          calories: "20",
          quantity: 1,
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(500);
});

test("Meal creation should succeed with valid data", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: "10",
          quantity: 1,
        },
        {
          name: "Lomo",
          calories: "20",
          quantity: 1,
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
      carbs: 10,
      proteins: 10,
      fats: 10,
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;
  const meal = await mealModel.findById(mealId);
  expect(meal).toBeTruthy();
});

test("Deleting a meal successfully should result in a 200 status code and is not present in the DB", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: "10",
          quantity: 1,
        },
        {
          name: "Lomo",
          calories: "20",
          quantity: 1,
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
    })
    .set("Authorization", "Bearer " + testToken);

  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;
  const mealBeforeDelete = await mealModel.findById(mealId);
  expect(mealBeforeDelete).toBeTruthy();

  const response1 = await request(app)
    .delete("/api/meals/" + mealId)
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  const mealAfterDelete = await mealModel.findById(mealId);
  expect(mealAfterDelete).toBeNull();
});
test("Can't delete a meal from another user", async () => {
  const testToken = generateTestToken();
  const testToken2 = generateTestToken2();
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: "10",
          quantity: 1,
        },
        {
          name: "Lomo",
          calories: "20",
          quantity: 1,
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
    })
    .set("Authorization", "Bearer " + testToken);

  const responseParsed = JSON.parse(response.text);
  console.log(responseParsed);
  const mealId = responseParsed.data._id;
  const mealBeforeDelete = await mealModel.findById(mealId);
  expect(mealBeforeDelete).toBeTruthy();

  const response1 = await request(app)
    .delete("/api/meals/" + mealId)
    .set("Authorization", "Bearer " + testToken2);
  expect(response1.statusCode).toEqual(403);
});
test("Can't edit a meal from another user", async () => {
  const testToken = generateTestToken();
  const testToken2 = generateTestToken2();
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: "10",
          quantity: 1,
        },
        {
          name: "Lomo",
          calories: "20",
          quantity: 1,
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
    })
    .set("Authorization", "Bearer " + testToken);

  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;
  const mealBeforeDelete = await mealModel.findById(mealId);
  expect(mealBeforeDelete).toBeTruthy();

  const response1 = await request(app)
    .put("/api/meals/" + mealId)
    .send({
      name: "Carne con papas modificada",
    })
    .set("Authorization", "Bearer " + testToken2);
  expect(response1.statusCode).toEqual(404);
});

test("Updating a meal should return a 200 status code and it should be updated in the DB", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: "10",
          quantity: 1,
        },
        {
          name: "Lomo",
          calories: "20",
          quantity: 1,
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
    })
    .set("Authorization", "Bearer " + testToken);

  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;
  const mealBeforeUpdate = await mealModel.findById(mealId);
  expect(mealBeforeUpdate).toBeTruthy();
  expect(mealBeforeUpdate.name).toEqual("Carne con papas");

  const response1 = await request(app)
    .put("/api/meals/" + mealId)
    .send({
      name: "Carne con papas modificada",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  const mealAfterpdate = await mealModel.findById(mealId);
  expect(mealAfterpdate).toBeTruthy();
  expect(mealAfterpdate.name).toEqual("Carne con papas modificada");
});

test("Updating a meal with database error should return a 500 status code", async () => {
  sinon.stub(mealModel, "findOneAndUpdate").throws(new Error("Database error"));
  const testToken = generateTestToken();
  const response = await request(app)
    .put("/api/meals/1234")
    .send({
      name: "Carne con papas modificada",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(500);
});

test("Deleting a meal with database error should return a 500 status code", async () => {
  const testToken = generateTestToken();
  sinon.stub(mealModel, "delete").throws(new Error("Database error"));

  const response = await request(app)
    .delete("/api/meals/1234")
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(500);
});

test("Retrieving meals for a user on a specific date should return a 200 status code", async () => {
  const testToken = generateTestToken();
  const fechaActual = new Date();
  // Obtener el año, mes y día
  const año = fechaActual.getFullYear();
  const mes = (fechaActual.getMonth() + 1).toString().padStart(2, "0"); // Los meses son indexados desde 0
  const dia = fechaActual.getDate().toString().padStart(2, "0");

  // Formatear la fecha como "YYYY-MM-DD"
  const fechaFormateada = `${año}-${mes}-${dia}`;
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: "10",
          quantity: 1,
        },
        {
          name: "Lomo",
          calories: "20",
          quantity: 1,
        },
      ],
      date: fechaActual,
      hour: "20:15",
      calories: 200,
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);

  const response1 = await request(app)
    .get("/api/meals/user/date/" + fechaFormateada)
    .set("Authorization", "Bearer " + testToken);
  const responseParsed = JSON.parse(response.text);
  const mealId = responseParsed.data._id;
  const meal = await mealModel.findById(mealId);
  expect(meal).toBeTruthy();
  const recievedDate = new Date(responseParsed.data.date);
  expect(recievedDate).toEqual(fechaActual);

  expect(response1.statusCode).toEqual(200);
});

test("Calories between two dates should return each day and calories", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: "10",
          quantity: 1,
        },
        {
          name: "Lomo",
          calories: "20",
          quantity: 1,
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
    })
    .set("Authorization", "Bearer " + testToken);
  const startDate = encodeURI(
    "Mon Jan 29 2024 00:00:00 GMT-0300 (hora estándar de Argentina)"
  );

  const endDate = encodeURI(
    "Mon May 13 2024 00:00:52 GMT-0300 (hora estándar de Argentina)"
  );

  const response1 = await request(app)
    .get("/api/meals/user/between/" + startDate + "/" + endDate)
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  const responseParsed = JSON.parse(response1.text);

  let totalCalories = 0;
  responseParsed.fechasIntermedias.forEach((entry) => {
    totalCalories += entry.calories;
  });
  expect(totalCalories).toEqual(200);
});

test("Esto deberia retornar un 200", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .get("/api/meals/user")
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
});

test("[GET CALORIES BY USER ID BETWEEN DAYS] Esto deberia retornar un 200", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: "10",
          quantity: 1,
        },
        {
          name: "Lomo",
          calories: "20",
          quantity: 1,
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
      userId: "987654321",
    });

  const startDate = encodeURI(
    "Mon Jan 29 2024 00:00:00 GMT-0300 (hora estándar de Argentina)"
  );

  const endDate = encodeURI(
    "Mon Feb 12 2024 00:00:52 GMT-0300 (hora estándar de Argentina)"
  );
  const response1 = await request(app)
    .get("/api/meals/user/startDate/" + startDate + "/endDate/" + endDate)
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
});

test("[GET MEALS BY USER ID]Esto deberia retornar un 500", async () => {
  const testToken = generateTestToken();
  findStub.throws(new Error("Database error"));
  const response = await request(app)
    .get("/api/meals/user/123")
    .set("Authorization", "Bearer " + testToken);
  expect(response.status).toEqual(500);
});

test("[GET MEALS BY USER ID AND DATE] Esto deberia retornar un 500", async () => {
  const testToken = generateTestToken();
  sinon.stub.throws(new Error("Database error"));
  const response = await request(app)
    .get("/api/meals/user/987654321/date/2023-10-04")
    .set("Authorization", "Bearer " + testToken);
  expect(response.status).toEqual(500);
});

test("[GET CALORIES BY USER ID AND MONTH] Esto deberia retornar un 500", async () => {
  const testToken = generateTestToken();
  findStub.throws(new Error("Database error"));
  const response = await request(app)
    .get("/api/meals/user/between/2022-10-18/2023-10-19")
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(500);
});

test("[GET CALORIES BY USER ID BETWEEN DAYS] Esto deberia retornar un 500", async () => {
  const testToken = generateTestToken();
  sinon.stub(mealModel, "find").throws(new Error("Database error"));
  const response = await request(app)
    .get("/api/meals/user/startDate/2022-10-18/endDate/2023-10-19")
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(500);
});

test("[CREATE MEAL]Esto deberia retornar un 500", async () => {
  sinon.stub(mealModel, "create").throws(new Error("Database error"));
  const testToken = generateTestToken();

  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Carne con papas",
      foods: [
        {
          name: "Papa",
          calories: "10",
          quantity: 1,
        },
        {
          name: "Lomo",
          calories: "20",
          quantity: 1,
        },
      ],
      date: new Date(),
      hour: "20:15",
      calories: 200,
    })
    .set("Authorization", "Bearer " + testToken);

  expect(response.status).toEqual(500);
});