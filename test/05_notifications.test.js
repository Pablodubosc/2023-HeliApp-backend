const request = require("supertest");
const sinon = require("sinon");
const app = require("../app");
const { usersModel } = require("../models");
const {
  sendIntermittentFastingNotificationEmail,
} = require("../controllers/notifications");
const jwt = require("jsonwebtoken");
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
test("[SEND NOTIFICATION OK] Should send a reset password email successfully", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/notifications/sendEmail")
    .send({
      email: "user@example.com",
      token: "sampleToken",
      userName: "John Doe",
      url: "url",
    })
    .set("Authorization", "Bearer " + testToken);
  const responseParsed = JSON.parse(response.text);
  console.log(responseParsed);

  expect(response.statusCode).toEqual(200);
});

test("[SEND NOTIFICATION OK] Should send a reset password email successfully", async () => {
  const response = await request(app)
    .post("/api/notifications/sendEmail")
    .send({
      email: "user@example.com",
      token: "sampleToken",
      userName: "John Doe",
      url: "url",
    });

  expect(response.statusCode).toEqual(200);
});

test("Hola", async () => {
  const reqUpdateUser = {
    body: {
      email: "agmassieri00@gmail.com",
      userName: "userName",
    },
  };

  const resUpdateUser = {
    send: (data) => {},
    status: (statusCode) => {},
  };

  sendIntermittentFastingNotificationEmail(reqUpdateUser, resUpdateUser);
  //....Agregar assert
});

test("[VALIDATE TOKEN OK] Should send a reset password email successfully", async () => {
  const response = await request(app).post("/api/auth/register").send({
    firstName: "test99",
    lastName: "user",
    email: "testuser99@gmail.com",
    password: "testuser",
    sex: "male",
    age: "23",
    height: "1.80",
    weight: "70",
    secretToken: "1234",
  });

  const response1 = await request(app).get(
    "/api/notifications/validateToken/1234"
  );

  expect(response1.statusCode).toEqual(200);
});

test("[VALIDATE TOKEN NO OK] Should send a reset password email successfully", async () => {
  sinon.stub(usersModel, "findOne").throws(new Error("Database error"));

  const response1 = await request(app).get(
    "/api/notifications/validateToken/1234"
  );

  expect(response1.statusCode).toEqual(500);
}, 1000);
