const request = require("supertest");
const app = require("../app");
const { waterGlassModel } = require("../models");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
beforeAll(async () => {
  await waterGlassModel.deleteMany({});
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
test("Creating a water glass record should store it in the database", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/waterGlass")
    .send({
      startDate: "2023-10-22T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
  const waterGlassId = response.body.data._id;

  const createdWaterGlass = await waterGlassModel.findById(waterGlassId);
  expect(createdWaterGlass).toBeDefined();
});


// NO ME ANDA.
test("Se obtuvieron los water glass for user id by day correctamente", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/waterGlass")
    .send({
      startDate: "2023-10-22T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);

  const response1 = await request(app)
    .get("/api/waterGlass/countByDay/")
    .set("Authorization", "Bearer " + testToken);
  const response1Parsed = JSON.parse(response1.text);
  expect(response1.statusCode).toEqual(200);
  expect(response1Parsed.result[0].count).toEqual(1);
});

test("Successfully retrieved water consumption records by user ID", async () => {
  const testToken = generateTestToken();
  const createWaterGlassResponse = await request(app)
    .post("/api/waterGlass")
    .send({
      startDate: "2023-10-22T03:00:15.454Z",
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

test("[ERROR 500] No se obtuvieron los water glass for user id by day correctamente", async () => {
  const testToken = generateTestToken();
  sinon.stub(waterGlassModel, "aggregate").throws(new Error("Database error"));
  const response = await request(app).get(
    "/api/waterGlass/countByDay/987654321"
  );
  expect(response.statusCode).toEqual(500);
});

test("[ERROR 500] No se obtuvieron los water glass by user id correctamente", async () => {
  sinon.stub(waterGlassModel, "find").throws(new Error("Database error"));
  const response = await request(app).get("/api/waterGlass/987654321");
  expect(response.statusCode).toEqual(500);
});