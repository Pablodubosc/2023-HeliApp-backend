const request = require("supertest");
const app = require("../app");
const { foodModel, categoryModel, usersModel } = require("../models");
const { ObjectId } = require('mongodb');

beforeAll(async () => {
  await foodModel.deleteMany({});
  await categoryModel.deleteMany({});
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

async function createCategory(name, testToken) {
  const response = await request(app)
    .post("/api/category")
    .send({
      name: name,
    })
    .set("Authorization", "Bearer " + testToken);
  return response._body.data._id;
}
//ME FALTA TEST DE CATEOGRIA SIN ALERGIA EL TEMA ES QUE DA ERROR POR QUE 
//LAS FOODS NOS E FILTRAN POR USER... QUEDAN VARIAS CREADAS
test("User with Allergy to Banana cant see the food Banana", async () => {
  const testToken = await generateToken();
  const category = await createCategory("Fruta", testToken);
  const foodToSend2 = {
    name: "Banana",
    calories: 2,
    weight: 10,
    category: category,
    carbs: 0,
    proteins: 0,
    fats: 0,
  };
  const response2 = await request(app)
    .post("/api/foods")
    .send(foodToSend2)
    .set("Authorization", "Bearer " + testToken);
  expect(response2.statusCode).toEqual(200);

  const response3 = await request(app) // busca si existe en la base de datos y verifica que todos los datos esten ok
    .get("/api/auth/users/")
    .set("Authorization", "Bearer " + testToken);

  response3.body.data.allergies.push({allergyId:response2._body.data._id}) // agrega la food como alergia
  const response4 = await request(app)
  .put("/api/auth/users")
  .send(response3.body.data)
  .set("Authorization", "Bearer " + testToken)
  .set("Content-Type", "application/json");

expect(response4.statusCode).toEqual(200);

  const response5 = await request(app)
    .get("/api/foods/")
    .set("Authorization", "Bearer " + testToken);
  expect(response5._body.data).toEqual([])
}, 7000);

test("A food can't be created without a name", async () => {
  const testToken = await generateToken();
  const category = await createCategory("Carne", testToken);
  const response = await request(app)
    .post("/api/foods/")
    .send({
      name: "",
      calories: "10",
      weight: "10",
      category: category,
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(403);
  expect(response.body.errors[0].msg).toEqual("Name cant be empty");
});

test("A food can't be created without calories", async () => {
  const testToken = await generateToken();
  const category = await createCategory("Carne", testToken);
  const response = await request(app)
    .post("/api/foods/")
    .send({
      name: "Carne",
      calories: "",
      weight: 10,
      category: category,
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(403);
  expect(response.body.errors[0].msg).toEqual("Calories cant be empty");
}, 7000);

test("A food can't be created without weight", async () => {
  const testToken = await generateToken();
  const category = await createCategory("Carne", testToken);
  const response = await request(app)
    .post("/api/foods")
    .send({
      name: "Carne",
      calories: 10,
      weight: "",
      category: category,
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(403);
  expect(response.body.errors[0].msg).toEqual("Weight cant be empty");
}, 7000);

test("A food can't be created without category", async () => {
  const testToken = await generateToken();

  const response = await request(app)
    .post("/api/foods")
    .send({
      name: "Carne",
      calories: 10,
      weight: 10,
      category: "",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(403);
  expect(response.body.errors[0].msg).toEqual("Category cant be empty");
}, 7000);

test("User cant create without a valid token", async () => {
  const foodToSend = {
    name: "Rucula",
    calories: 2,
    weight: 10,
    category: "Carne",
    carbs: 0,
    proteins: 0,
    fats: 0,
  };
  const response = await request(app)
    .post("/api/foods")
    .send(foodToSend)
    .set("Authorization", "Bearer " + "token123");
  expect(response.statusCode).toEqual(401);
  expect(response.body.message).toEqual("Failed to authenticate token");
});

test("User create a foods and gets it successfully", async () => {
  const testToken = await generateToken();
  const category = await createCategory("Carne", testToken);
  const foodToSend1 = {
    name: "Lomo",
    calories: 2,
    weight: 10,
    category: category,
    carbs: 0,
    proteins: 0,
    fats: 0,
  };
  const foodToSend2 = {
    name: "Vacio",
    calories: 2,
    weight: 10,
    category: category,
    carbs: 0,
    proteins: 0,
    fats: 0,
  };
  const response = await request(app)
    .post("/api/foods")
    .send(foodToSend1)
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
  const response1 = await request(app)
    .post("/api/foods")
    .send(foodToSend2)
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  const response3 = await request(app)
    .get("/api/foods")
    .set("Authorization", "Bearer " + testToken);
  expect(response3.statusCode).toEqual(200);
  expect(response3.body.data[0].name).toEqual("Lomo");
  expect(response3.body.data[1].name).toEqual("Vacio");
  expect(response3.body.data[0].category.name).toEqual("Carne");
  expect(response3.body.data[1].category.name).toEqual("Carne");
});

test("User create a food with cateogry 'Carne' and a food with cateogry 'Fruta', then filter with 'Carne' and all the data recieve are 'Carne'", async () => {
  const testToken = await generateToken();
  const category = await createCategory("Carne", testToken);
  const foodToSend = {
    name: "Lomo",
    calories: 2,
    weight: 10,
    category: category,
    carbs: 0,
    proteins: 0,
    fats: 0,
  };
  const response = await request(app)
    .post("/api/foods")
    .send(foodToSend)
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
  const category2 = await createCategory("Fruta", testToken);
  const foodToSend2 = {
    name: "Manzana",
    calories: 2,
    weight: 10,
    category: category2,
    carbs: 0,
    proteins: 0,
    fats: 0,
  };
  const response2 = await request(app)
    .post("/api/foods")
    .send(foodToSend2)
    .set("Authorization", "Bearer " + testToken);
  expect(response2.statusCode).toEqual(200);
  const response3 = await request(app)
    .get("/api/foods/category/Carne")
    .set("Authorization", "Bearer " + testToken);
  const data = response3._body.data;
  // Chequea que todo lo que hay dentro de la respuesta del filtra tenga la cateogria Carne
  data.forEach((item) => {
    expect(item.category.name).toEqual("Carne");
  });
}, 7000);
