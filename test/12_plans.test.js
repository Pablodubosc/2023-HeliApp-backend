const request = require("supertest");
const app = require("../app");
const { planModel,mealModel,foodModel,usersModel,categoryModel, exerciseModel,exerciseDoneModel } = require("../models");
const sinon = require("sinon");

beforeAll(async () => {
  await mealModel.deleteMany({});
  await foodModel.deleteMany({});
  await usersModel.deleteMany({});
  await categoryModel.deleteMany({});
  await planModel.deleteMany({});
  await exerciseModel.deleteMany({});
  await exerciseDoneModel.deleteMany({});
},15000);


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

async function login2() {
  const response = await request(app).post("/api/auth/register").send({
    // se registra
    firstName: "test",
    lastName: "user2",
    email: "adminuser2@admin.com",
    password: "adminuser",
    sex: "male",
    age: "23",
    height: "1.80",
    weight: "70",
  });
  const response1 = await request(app).post("/api/auth/login").send({
    // se logea para obtener token
    email: "adminuser2@admin.com",
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

async function createFoods(token) {
  const category = await createCategory("Carne", token);
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
    carbs: 3,
    proteins: 2,
    fats: 1,
  };
  const response = await request(app)
    .post("/api/foods")
    .send(foodToSend1)
    .set("Authorization", "Bearer " + token);
  const response1 = await request(app)
    .post("/api/foods")
    .send(foodToSend2)
    .set("Authorization", "Bearer " + token);
  //console.log(response1._body);
  let foods = [
    { foodId: response._body.data._id, weightConsumed: 100 },
    { foodId: response1._body.data._id, weightConsumed: 200 },
  ];
  return foods;
}

async function createExercises(token) {
  const exerciseToSend1 = {
    name: "Caminata",
    caloriesBurn: 20,
    time: 10,
  };
  const exerciseToSend2 = {
    name: "Pesas",
    caloriesBurn: 5,
    time: 5,
  };
  const response = await request(app)
    .post("/api/exercise")
    .send(exerciseToSend1)
    .set("Authorization", "Bearer " + token);
  const response1 = await request(app)
    .post("/api/exercise")
    .send(exerciseToSend2)
    .set("Authorization", "Bearer " + token);
  //console.log(response1._body);
  let exercises = [
    { exerciseId: response._body.data._id, timeWasted: 50 },
    { exerciseId: response1._body.data._id, timeWasted: 20 },
  ];
  return exercises;
}


test("POST to create a calories plan for a user should return a 200 and should be stored in DB", async () => {
  const testToken = await login("adminuser@admin.com");
  const foods = await createFoods(testToken);
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Asado",
      foods: foods,
      date: new Date(),
      hour: "20:15",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
  const response1 = await request(app)
    .post("/api/plans")
    .send({
      name: "Plan Calorias",
      planType:"Calories",
      planObjetive : 120,
      startDate: "2024-03-18T03:00:15.454Z",
      endDate: "2024-03-25T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);
    expect(response1.statusCode).toEqual(200);
    const response2 = await request(app)
    .get("/api/plans")
    .set("Authorization", "Bearer " + testToken);
    expect(response2.statusCode).toEqual(200);
    expect(response2._body.data[0].name).toEqual("Plan Calorias");
},15000);

test("POST to create a calories burn plan for a user should return a 200 and should be stored in DB", async () => {
  const testToken = await login("planexercirse@admin.com");
  const exercises = await createExercises(testToken);
  const response = await request(app)
    .post("/api/exerciseDone")
    .send({
      name: "Pesa+Caminata",
      exercises: exercises,
      date: new Date(),
      hour: "20:15",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(200);
  const response1 = await request(app)
    .post("/api/plans")
    .send({
      name: "Plan Ejercicio",
      planType:"Calories Burn",
      planObjetive : 230,
      startDate: "2024-03-18T03:00:15.454Z",
      endDate: "2024-03-25T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);
    expect(response1.statusCode).toEqual(200);
    const response2 = await request(app)
    .get("/api/plans")
    .set("Authorization", "Bearer " + testToken);
    expect(response2.statusCode).toEqual(200);
    expect(response2._body.data[0].name).toEqual("Plan Ejercicio");
},15000);


test("POST to create a plan for a user with not available foods because he is allergy should return 400", async () => {
  const testToken = await login("alergico@admin.com");
  const foods = await createFoods(testToken);
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Asado",
      foods: foods,
      date: new Date(),
      hour: "20:15",
    })
    .set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(200);
    //seteo alergia en una food de la unica comida que hay
    const response2 = await request(app).put("/api/auth/users").send({
      allergies: [response._body.data.foods[0].foodId],
    }).set("Authorization", "Bearer " + testToken);

    expect(response2.statusCode).toEqual(200);
  const response1 = await request(app)
    .post("/api/plans")
    .send({
      name: "Plan 1",
      planType:"Calories",
      planObjetive : 120,
      startDate: "2024-03-18T03:00:15.454Z",
      endDate: "2024-03-25T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);
    expect(response1.statusCode).toEqual(400);
    expect(response1._body.message).toEqual("ERROR_NO_MEALS_FOUND_FOR_PLAN");
},15000);

test("Deleting a plan successfully should result in a 200 status code and is not present in the DB", async () => {
  const testToken = await login("alergico@admin.com");
  const foods = await createFoods(testToken);
  const response = await request(app)
    .post("/api/meals")
    .send({
      name: "Asado",
      foods: foods,
      date: new Date(),
      hour: "20:15",
    })
    .set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(200);
    const response1 = await request(app)
    .post("/api/plans")
    .send({
      name: "Plan Ejercicio",
      planType:"Calories",
      planObjetive : 230,
      startDate: "2024-03-18T03:00:15.454Z",
      endDate: "2024-03-25T03:00:15.454Z",
    })
    .set("Authorization", "Bearer " + testToken);
    expect(response1.statusCode).toEqual(200);
  const planId = response1._body.data._id;
  const planBeforeDelete = await planModel.findById(planId);
  expect(planBeforeDelete).toBeTruthy();

  const response2 = await request(app)
    .delete("/api/plans/" + planId)
    .set("Authorization", "Bearer " + testToken);
  expect(response2.statusCode).toEqual(200);
  const planAfterDelete = await planModel.findById(planId);
  expect(planAfterDelete).toBeNull();
  const responseParsed1 = JSON.parse(response2.text);
  expect(responseParsed1.message).toEqual("Plan successfully deleted");
}, 6000);