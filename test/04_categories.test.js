const request = require("supertest");
const app = require("../app");
const { categoryModel } = require("../models");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
beforeAll(async () => {
  await categoryModel.deleteMany({});
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
test("Category can't be created without a name and validator returns a 403", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/category")
    .send({
      name: "",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(403);
  expect(response.body.errors[0].msg).toEqual("Name cant be empty");
});

test("Category is succesfully created, stored in the DB and returns a 200", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/category")
    .send({
      name: "Verduras",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
  const responseParsed = JSON.parse(response.text);
  const categoryId = responseParsed.data._id;
  const category = await categoryModel.findById(categoryId);
  expect(category).toBeTruthy();
  expect(category.name).toEqual("Verduras");
});


test("GET requests is succesfully made after a POST, getting the correct category and receving a 200", async () => {
  const testToken = generateTestToken();
  const response = await request(app)
    .post("/api/category")
    .send({
      name: "Verduras",
    })
    .set("Authorization", "Bearer " + testToken);
  const response1 = await request(app)
    .get("/api/category")
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  const responseParsed = JSON.parse(response1.text);
  expect(responseParsed.data[0].name).toEqual("Verduras");
});

test("Creating a category with database error should return a 500 status code", async () => {
  const testToken = generateTestToken();
  sinon.stub(categoryModel, "create").throws(new Error("Database error"));

  const response = await request(app)
    .post("/api/category")
    .send({
      name: "Verduras",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(500);
});

test("Retrieving categories with database error should return a 500 status code", async () => {
  const testToken = generateTestToken();
  sinon.stub(categoryModel, "find").throws(new Error("Database error"));

  const response = await request(app)
    .get("/api/category")
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(500);
});