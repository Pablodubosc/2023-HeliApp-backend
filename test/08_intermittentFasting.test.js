const request = require("supertest");
const app = require("../app");
const { intermittentFastingModel } = require("../models");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
beforeAll(async () => {
  await intermittentFastingModel.deleteMany({});
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

test("Se creo el intermittent fasting correctamente", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/intermittentFasting")
    .send({
      startDateTime: "2023-10-22T03:00:15.454Z",
      endDateTime: "2023-10-23T05:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
  const intermitentId = response.body.data._id;

  const createdIntermitent = await intermittentFastingModel.findById(intermitentId);
  expect(createdIntermitent).toBeDefined();
});

// NO ANDA
test("[ERROR 501] Ya existe un ayuno intermitente en ese horario", async () => {
  const testToken = generateTestToken();
  const response = await request(app).post("/api/intermittentFasting").send({
    startDateTime: "2023-10-22T03:00:15.454Z",
    endDateTime: "2023-10-23T05:00:15.454Z",
  })
  .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
  const response1 = await request(app).post("/api/intermittentFasting").send({
    startDateTime: "2023-10-22T03:00:15.454Z",
    endDateTime: "2023-10-23T05:00:15.454Z",
  })
  .set("Authorization", "Bearer " + testToken);
  console.log(response)
  expect(response1.statusCode).toEqual(501);
  
});

test("Se obtuvieron los intermittent fastings activos correctamente", async () => {
  const response = await request(app).get(
    "/api/intermittentFasting/active/987654321"
  );
  expect(response.statusCode).toEqual(200);
});

test("Se obtuvieron los intermittent fastings correctamente", async () => {
  const response = await request(app).get("/api/intermittentFasting/987654321");
  expect(response.statusCode).toEqual(200);
});

test("Se obtuvieron los intermittent fastings correctamente", async () => {
  const response = await request(app).get("/api/intermittentFasting/987654321");
  expect(response.statusCode).toEqual(200);
});

test("Se elimino el intermittent fasting correctamente", async () => {
  const response = await request(app).post("/api/intermittentFasting").send({
    startDateTime: "2023-10-27T03:00:15.454Z",
    endDateTime: "2023-10-28T05:00:15.454Z",
    userId: "987654321",
  });

  const responseParsed = JSON.parse(response.text);

  const response1 = await request(app).delete(
    "/api/intermittentFasting/active/" + responseParsed.data._id
  );

  expect(response1.statusCode).toEqual(200);
});

test("No se elimino el intermittent fasting correctamente", async () => {
  const response = await request(app).post("/api/intermittentFasting").send({
    startDateTime: "2023-10-29T03:00:15.454Z",
    endDateTime: "2023-10-30T05:00:15.454Z",
    userId: "987654321",
  });

  const responseParsed = JSON.parse(response.text);

  sinon
    .stub(intermittentFastingModel, "delete")
    .throws(new Error("Database error"));

  const response1 = await request(app).delete(
    "/api/intermittentFasting/active/" + responseParsed.data._id
  );

  expect(response1.statusCode).toEqual(500);
});

test("No se creo el intermittent fasting correctamente", async () => {
  sinon
    .stub(intermittentFastingModel, "create")
    .throws(new Error("Database error"));

  const response = await request(app).post("/api/intermittentFasting").send({
    startDateTime: "2023-10-24T03:00:15.454Z",
    endDateTime: "2023-10-25T05:00:15.454Z",
    userId: "987654321",
  });

  expect(response.statusCode).toEqual(500);
});

test("[ERROR 500] No se obtuvieron los intermittent fastings activos correctamente", async () => {
  sinon
    .stub(intermittentFastingModel, "find")
    .throws(new Error("Database error"));

  const response = await request(app).get(
    "/api/intermittentFasting/active/987654321"
  );
  expect(response.statusCode).toEqual(500);
});

test("[ERROR 500] No se obtuvieron los intermittent fastings correctamente", async () => {
  const response = await request(app).get("/api/intermittentFasting/987654321");
  expect(response.statusCode).toEqual(500);
});
