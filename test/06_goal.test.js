const request = require("supertest");
const app = require("../app");
const { goalModel, usersModel } = require("../models");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
beforeAll(async () => {
  await goalModel.deleteMany({});
  await usersModel.deleteMany({});
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

test("Create weekly goal successfully with valid data", async () => {
  const testToken = await login("adminuser@admin.com");
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Goal 1",
      type: "Calories",
      objetive: 200,
      startDate: "2024-03-18T03:00:15.454Z",
      endDate: "2024-03-25T03:00:15.454Z",
      recurrency: "Weekly",
    })
    .set("Authorization", "Bearer " + testToken);

  // Assuming that a successful response should return 201 (Created) instead of 200 (OK)
  expect(response.statusCode).toEqual(200);

  // Assuming that the response body contains the created goal data
  expect(response.body).toHaveProperty("data");
  expect(response.body.data).toHaveProperty("_id");
  expect(response.body.data.name).toEqual("Goal 1");
  expect(response.body.data.type).toEqual("Calories");
  expect(response.body.data.objetive).toEqual(200);
});
test("Create weekly goal with end date less than start date", async () => {
  const testToken = await login("adminuser3@admin.com");
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Goal 1",
      type: "Calories",
      objetive: 200,
      startDate: "2025-03-18T03:00:15.454Z",
      endDate: "2024-03-25T03:00:15.454Z",
      recurrency: "Weekly",
    })
    .set("Authorization", "Bearer " + testToken);

  // Assuming that a successful response should return 201 (Created) instead of 200 (OK)
  expect(response.statusCode).toEqual(500);
});

test("A goal is created with and invalid recurrency option an throws an error", async () => {
  const testToken = await login("adminuser4@admin.com");
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories",
      objetive: 200,
      startDate: "2025-10-22T03:00:15.454Z",
      endDate: "2025-10-24T03:00:15.454Z",
      recurrency: "weekly",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(500);
});

test("[GET GOALS BY USER ID] GET request should retrieve user's goal that were created and a 200 status code", async () => {
  const testToken = await login("adminuser5@admin.com");
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories",
      objetive: 200,
      startDate: "2023-10-22T03:00:15.454Z",
      endDate: "2023-10-24T03:00:15.454Z",
      recurrency: "Weekly",
    })
    .set("Authorization", "Bearer " + testToken);

  const response1 = await request(app)
    .get("/api/goals")
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  expect(response1._body.data[0].name).toEqual("Meta 1");
  expect(response1._body.data[0].objetive).toEqual(200);
});

test("[GET ACTIVE GOALS BY USER ID] GET active goals should only retrieve current active goals", async () => {
  const testToken = await login("adminuser6@admin.com");
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories",
      objetive: 200,
      startDate: "2023-10-22T03:00:15.454Z",
      endDate: "2025-10-24T03:00:15.454Z",
      recurrency: "Weekly",
    })
    .set("Authorization", "Bearer " + testToken);
  const response1 = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 2",
      type: "Calories",
      objetive: 200,
      startDate: "2023-10-22T03:00:15.454Z",
      endDate: "2023-10-24T03:00:15.454Z",
      recurrency: "Weekly",
    })
    .set("Authorization", "Bearer " + testToken);

  const response2 = await request(app)
    .get("/api/goals/activeGoals")
    .set("Authorization", "Bearer " + testToken);
  expect(response2.statusCode).toEqual(200);
  expect(response2._body.filteredData[0].name).toEqual("Meta 1");
  expect(response2._body.filteredData[0].objetive).toEqual(200);
  expect(response2._body.filteredData.length).toEqual(1);
});

test("[GET GOALS BY USER ID WITH PROGRESS MONTHLY] User creates a 200 calories goal and eats a meal of 60 and get retrieves the active goal and the progress", async () => {
  const testToken = await login("adminuser7@admin.com");
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
  const response1 = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories",
      objetive: 200,
      startDate: "2023-10-22T03:00:15.454Z",
      endDate: "2025-10-24T03:00:15.454Z",
      recurrency: "Monthly",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  const response2 = await request(app)
    .get("/api/goals/goalsWithProgress")
    .set("Authorization", "Bearer " + testToken);
  expect(response2.statusCode).toEqual(200);
  expect(response2._body.goalsWithProgress[0].totalConsumido).toEqual(60);
  expect(response2._body.goalsWithProgress[0].state).toEqual("In progress");
}, 60000);

test("[GET GOALS BY USER ID WITH PROGRESS MONTHLY] User creates a 200 caloriesBurn goal and do exercises for a 120 caloriesBurn get retrieves the active goal and the progress", async () => {
  const testToken = await login("pruebacaloriesburn@admin.com");
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
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories Burn",
      objetive: 200,
      startDate: "2023-10-22T03:00:15.454Z",
      endDate: "2025-10-24T03:00:15.454Z",
      recurrency: "Monthly",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  const response2 = await request(app)
    .get("/api/goals/goalsWithProgress")
    .set("Authorization", "Bearer " + testToken);
  expect(response2.statusCode).toEqual(200);
  expect(response2._body.goalsWithProgress[0].totalConsumido).toEqual(120);
  expect(response2._body.goalsWithProgress[0].state).toEqual("In progress");
}, 60000);

test("[DELETE GOAL BY ID] Deleting a goal successfully should result in a 200 status code and is not present in the DB", async () => {
  const testToken = await login("adminuser8@admin.com");
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories",
      objetive: 200,
      startDate: "2023-10-22T03:00:15.454Z",
      endDate: "2023-10-24T03:00:15.454Z",
      recurrency: "Monthly",
    })
    .set("Authorization", "Bearer " + testToken);
  const goalId = response._body.data._id;
  const responseParsed = JSON.parse(response.text);

  const response1 = await request(app)
    .delete("/api/goals/" + responseParsed.data._id)
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  const goalAfterDelete = await goalModel.findById(goalId);
  expect(goalAfterDelete).toBeNull();
}, 6000);

test("[UPDATE GOAL BY ID] Users update a goal by changing his name and PUT request returns a 200 and the updated goal", async () => {
  const testToken = await login("adminuser9@admin.com");
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories",
      objetive: 200,
      startDate: "2025-10-22T03:00:15.454Z",
      endDate: "2025-10-24T03:00:15.454Z",
      recurrency: "Weekly",
    })
    .set("Authorization", "Bearer " + testToken);
  const responseParsed = JSON.parse(response.text);
  const response1 = await request(app)
    .put("/api/goals/" + responseParsed.data._id)
    .send({ name: "Nuevo nombre" })
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  expect(response1._body.data.name).toEqual("Nuevo nombre");
}, 6000);

test("[UPDATE GOAL BY ID] Cant update a goal that is in progress", async () => {
  const testToken = await login("adminuser10@admin.com");
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories",
      objetive: 200,
      startDate: "2023-10-22T03:00:15.454Z",
      endDate: "2025-10-24T03:00:15.454Z",
      recurrency: "Monthly",
    })
    .set("Authorization", "Bearer " + testToken);
  const responseParsed = JSON.parse(response.text);

  const response1 = await request(app)
    .put("/api/goals/" + responseParsed.data._id)
    .send({ name: "Nuevo nombre" })
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(500);
  expect(response1._body.message).toEqual(
    "Can't edit a goal that has started or it's expired"
  );
}, 6000);

test("[UPDATE GOAL BY ID] Cant update a goal that is expired", async () => {
  const testToken = await login("adminuser11@admin.com");
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories",
      objetive: 200,
      startDate: "2022-10-22T03:00:15.454Z",
      endDate: "2023-10-24T03:00:15.454Z",
      recurrency: "Monthly",
    })
    .set("Authorization", "Bearer " + testToken);
  const responseParsed = JSON.parse(response.text);

  const response1 = await request(app)
    .put("/api/goals/" + responseParsed.data._id)
    .send({ name: "Nuevo nombre" })
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(500);
  expect(response1._body.message).toEqual(
    "Can't edit a goal that has started or it's expired"
  );
}, 6000);
test("[UPDATE GOAL BY ID] Cant update a goal from another user", async () => {
  const testToken = await login("adminuser12@admin.com");
  const testToken2 = await login2();
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories",
      objetive: 200,
      startDate: "2022-10-22T03:00:15.454Z",
      endDate: "2023-10-24T03:00:15.454Z",
      recurrency: "Monthly",
    })
    .set("Authorization", "Bearer " + testToken);
  const responseParsed = JSON.parse(response.text);

  const response1 = await request(app)
    .put("/api/goals/" + responseParsed.data._id)
    .send({ name: "Nuevo nombre" })
    .set("Authorization", "Bearer " + testToken2);
  expect(response1.statusCode).toEqual(404);
  expect(response1._body.message).toEqual("Goal not found or unauthorized");
}, 6000);

test("User can't create a goal with negative objetive", async () => {
  const testToken = await login("adminuser13@admin.com");
  const response = await request(app)
    .post("/api/goals")
    .send({
      name: "Meta 1",
      type: "Calories",
      objetive: -200,
      startDate: "2025-10-22T03:00:15.454Z",
      endDate: "2025-10-24T03:00:15.454Z",
      recurrency: "Weekly",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(500);
  expect(response._body.message).toEqual("ERROR_CREATE_GOAL");
});