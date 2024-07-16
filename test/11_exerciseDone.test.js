const request = require("supertest");
const app = require("../app");
const { exerciseDoneModel,exerciseModel,usersModel } = require("../models");
const sinon = require("sinon");

beforeAll(async () => {
  await exerciseModel.deleteMany({});
  await exerciseDoneModel.deleteMany({});
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

let findStub;

test("POST request for a user should return a 200 and should be retrieved with a GET request", async () => {
  const testToken = await login("adminuser@admin.com");
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
    .get("/api/exerciseDone/user")
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  expect(response1._body.data[0].name).toEqual("Pesa+Caminata");
  expect(response1._body.data[0].totalCaloriesBurn).toEqual(120);
});

test("An exerciseDone cannot be created without name", async () => { //  y esto?
  const testToken = await login("adminuser1@admin.com");
  const exercises = await createExercises(testToken);
  const response = await request(app)
    .post("/api/exerciseDone")
    .send({
      name: "",
      exercises: exercises,
      date: new Date(),
      hour: "20:15",
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response.statusCode).toEqual(403);
  expect(response.body.errors[0].msg).toEqual("Invalid value");
});

test("Deleting a exerciseDone successfully should result in a 200 status code and is not present in the DB", async () => {
  const testToken = await login("adminuser2@admin.com");
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
  //console.log(response._body.data);
  const exerciseDoneId = response._body.data._id;
  const exerciseDoneBeforeDelete = await exerciseDoneModel.findById(exerciseDoneId);
  expect(exerciseDoneBeforeDelete).toBeTruthy();

  const response1 = await request(app)
    .delete("/api/exerciseDone/" + exerciseDoneId)
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  const exerciseDoneAfterDelete = await exerciseDoneModel.findById(exerciseDoneId);
  expect(exerciseDoneAfterDelete).toBeNull();
  const responseParsed1 = JSON.parse(response1.text);
  expect(responseParsed1.message).toEqual("ExerciseDone successfully deleted");
}, 6000);


test("Updating the name and timeWasted of a exerciseDone should return a 200 status code and name should change and its total calories burn", async () => {
  const testToken = await login("adminuser3@admin.com");
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

  const exerciseDoneId = response._body.data._id;
  const exerciseDoneBeforeUpdate = await exerciseDoneModel.findById(exerciseDoneId);
  expect(exerciseDoneBeforeUpdate).toBeTruthy();
  expect(exerciseDoneBeforeUpdate.name).toEqual("Pesa+Caminata");
  exercises[0].timeWasted = 100;
  const response1 = await request(app)
    .put("/api/exerciseDone/" + exerciseDoneId)
    .send({
      name: "Cambiado",
      foods: exercises,
    })
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  const exerciseDoneAfterUpdate = await exerciseDoneModel.findById(exerciseDoneId);
  expect(exerciseDoneAfterUpdate.name).toEqual("Cambiado");
});


test("Retrieving exercisesDone for a user on a specific date should return a 200 status code and exercises information", async () => {
  const testToken = await login("adminuser4@admin.com");
  const exercises = await createExercises(testToken);
  const fechaActual = new Date();
  // Obtener el año, mes y día
  const año = fechaActual.getFullYear();
  const mes = (fechaActual.getMonth() + 1).toString().padStart(2, "0"); // Los meses son indexados desde 0
  const dia = fechaActual.getDate().toString().padStart(2, "0");

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
  // Formatear la fecha como "YYYY-MM-DD"
  const fechaFormateada = `${año}-${mes}-${dia}`;

  const response1 = await request(app)
    .get("/api/exerciseDone/user/date/" + fechaFormateada)
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  expect(response1._body.exercisesDoneToSend[0].name).toEqual("Pesa+Caminata");
  const response2 = await request(app)
    .get("/api/exerciseDone/user/date/2025-08-04")
    .set("Authorization", "Bearer " + testToken);
  expect(response2._body.exercisesDoneToSend[0]).toBeUndefined();
});


test("CaloriesBurn between two dates should return each day and calories", async () => {
  const testToken = await login("adminuser5@admin.com");
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
  const startDate = encodeURI(
    "Mon Jul 16 2024 00:00:00 GMT-0300 (hora estándar de Argentina)"
  );

  const endDate = encodeURI(
    "Mon Jul 29 2024 00:00:52 GMT-0300 (hora estándar de Argentina)"
  );

  const response1 = await request(app)
    .get("/api/exerciseDone/user/between/" + startDate + "/" + endDate)
    .set("Authorization", "Bearer " + testToken);
  expect(response1.statusCode).toEqual(200);
  let totalCaloriesBurn = 0;
  response1._body.fechasIntermedias.forEach((entry) => {
    totalCaloriesBurn += entry.totalCaloriesBurn;
  });
  expect(totalCaloriesBurn).toEqual(120);
});

test("CaloriesBurn between two dates should return total calories", async () => {
  const testToken = await login("adminuser6@admin.com");
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
  const response2 = await request(app)
  .post("/api/exerciseDone")
  .send({
    name: "Pesa+Caminata",
    exercises: exercises,
    date: new Date().setDate(new Date().getDate() + 1),
    hour: "20:15",
  })
  .set("Authorization", "Bearer " + testToken)
  //Cambiar fecha
  const startDate = encodeURI(
    "Mon Jul 16 2024 00:00:00 GMT-0300 (hora estándar de Argentina)"
  );

  const endDate = encodeURI(
    "Mon Aug 5 2024 00:00:52 GMT-0300 (hora estándar de Argentina)"
  );

  const response3 = await request(app)
    .get("/api/exerciseDone/user/startDate/" + startDate + "/endDate/" + endDate)
    .set("Authorization", "Bearer " + testToken);
  expect(response3.statusCode).toEqual(200);
  expect(response3._body.totalConsumido).toEqual(240);
},9000);


test("Can't edit a exerciseDone from another user", async () => {
  const testToken1 = await login("adminuser6@admin.com");
  const exercises = await createExercises(testToken1);
  const response = await request(app)
  .post("/api/exerciseDone")
  .send({
    name: "Pesa+Caminata",
    exercises: exercises,
    date: new Date(),
    hour: "20:15",
  })
  .set("Authorization", "Bearer " + testToken1);
  const testToken2 = await login2();

  const exerciseDoneId = response._body.data._id;
  const exerciseDoneBeforeUpdate = await exerciseDoneModel.findById(exerciseDoneId);
  expect(exerciseDoneBeforeUpdate).toBeTruthy();
  expect(exerciseDoneBeforeUpdate.name).toEqual("Pesa+Caminata");

  const response1 = await request(app)
    .put("/api/exerciseDone/" + exerciseDoneId)
    .send({
      name: "Cambiado",
    })
    .set("Authorization", "Bearer " + testToken2);
  expect(response1.statusCode).toEqual(404);
  expect(response1._body.message).toEqual("ExerciseDone not found or unauthorized");
});


test("Can't delete a exerciseDone from another user", async () => {
  const testToken1 = await login("adminuser9@admin.com");
  const testToken2 = await login2();
  const exercises = await createExercises(testToken1);
  const response = await request(app)
  .post("/api/exerciseDone")
  .send({
    name: "Pesa+Caminata",
    exercises: exercises,
    date: new Date(),
    hour: "20:15",
  })
  .set("Authorization", "Bearer " + testToken1);

  const exerciseDoneId = response._body.data._id;
  const response1 = await request(app)
    .delete("/api/exerciseDone/" + exerciseDoneId)
    .set("Authorization", "Bearer " + testToken2);
  expect(response1.statusCode).toEqual(403);
  const responseParsed1 = JSON.parse(response1.text);
  expect(responseParsed1.message).toEqual(
    "You don't have permission to delete this exerciseDone"
  );
});
