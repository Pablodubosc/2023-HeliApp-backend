const request = require("supertest");
const app = require("../app");
const { waterGlassModel } = require("../models");
beforeAll(async () => {
  await waterGlassModel.deleteMany({});
});
async function login(email) {
  const response = await request(app).post("/api/auth/register").send({
    // se registra
    firstName: "test",
    lastName: "user",
    email: email,
    password: "adminuser",
    sex: "male",
    age: "23",
    height: "1.80",
    weight: "70",
  });
  const response1 = await request(app).post("/api/auth/login").send({
    // se logea para obtener token
    email: email,
    password: "adminuser",
  });
  return response1._body.token;
}

test("Creating a water glass record should store it in the database", async () => {
  const testToken = await login("adminuser@admin.com");
  const response = await request(app)
    .post("/api/waterGlass")
    .send({
      date: "2023-10-22T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
  const waterGlassId = response.body.data._id;
  const createdWaterGlass = await waterGlassModel.findById(waterGlassId);
  expect(createdWaterGlass).toBeDefined();
});

test("Se obtuvieron los water glass for user id by day correctamente. ", async () => {
  const testToken = await login("adminuser1@admin.com");
  const response = await request(app)
    .post("/api/waterGlass")
    .send({
      date: "2024-04-10T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);
  const response2 = await request(app)
    .post("/api/waterGlass")
    .send({
      date: "2024-04-10T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);
  const response3 = await request(app)
    .post("/api/waterGlass")
    .send({
      date: "2024-04-11T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);

  const response1 = await request(app)
    .get("/api/waterGlass/countByDay/")
    .set("Authorization", "Bearer " + testToken);
  //falta ordenar la response para el grafico
  expect(response1._body.data[0].count).toEqual(2);
  expect(response1._body.data[1].count).toEqual(1);
});

test("Successfully retrieved water consumption records by user ID", async () => {
  const testToken = await login("adminuser3@admin.com");
  const createWaterGlassResponse = await request(app)
    .post("/api/waterGlass")
    .send({
      date: "2024-04-10T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(createWaterGlassResponse.statusCode).toEqual(200);

  const getWaterGlassResponse = await request(app)
    .get("/api/waterGlass")
    .set("Authorization", "Bearer " + testToken);
  expect(getWaterGlassResponse.statusCode).toEqual(200);

  const responseData = JSON.parse(getWaterGlassResponse.text);
  expect(responseData).toBeDefined();
  expect(responseData.data).toBeDefined();
  expect(responseData.data.length).toBeGreaterThanOrEqual(0);
});

/* test("[ERROR 500] No se creo el water glass correctamente", async () => {
  const testToken = generateTestToken();
  sinon.stub(waterGlassModel, "create").throws(new Error("Database error"));

  const response = await request(app).post("/api/waterGlass").send({
    startDate: "2023-10-22T03:00:15.454Z",
  });
  expect(response.statusCode).toEqual(500);
}); */

/* test("[ERROR 500] No se obtuvieron los water glass for user id by day correctamente", async () => {
  const testToken = generateTestToken();
  sinon.stub(waterGlassModel, "aggregate").throws(new Error("Database error"));
  const response = await request(app).get(
    "/api/waterGlass/countByDay/987654321"
  );
  expect(response.statusCode).toEqual(500);
});
 */
/* test("[ERROR 500] No se obtuvieron los water glass by user id correctamente", async () => {
  sinon.stub(waterGlassModel, "find").throws(new Error("Database error"));
  const response = await request(app).get("/api/waterGlass/987654321");
  expect(response.statusCode).toEqual(500);
}); */