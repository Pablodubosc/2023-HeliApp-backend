const request = require('supertest');
const app = require('../app');
const { exerciseModel } = require("../models");
const sinon = require('sinon');

let findStub;

beforeAll(async () => {
    await exerciseModel.deleteMany({});
});

test("Se creo el ejercicio correctamente", async() => {
    const response = await request(app)
    .post('/api/exercise')
    .send(
        {
            name:"Ejercicio1",
            caloriesBurn:10,
            time: 10,
        }
    )
    expect(response.statusCode).toEqual(200);
})


test("Se obtuvieron los ejercicios correctamente [200]", async() => {
    const response = await request(app)
    .get('/api/exercise')
    expect(response.statusCode).toEqual(200);
})

test('[GET Exercise]Esto deberia retornar un 500', async () => {
    findStub = sinon.stub(exerciseModel, 'find').throws(new Error('Database error'));

    const response = await request(app)
      .get('/api/exercise');

    expect(response.status).toEqual(500);
}, 1000);

test('[CREATE Exercise]Esto deberia retornar un 500 por mal formato en caloriesBurn', async () => {
    sinon.stub(exerciseModel, 'create').throws(new Error('Database error'));

    const response = await request(app)
      .post('/api/exercise')
      .send({
                name: "Correr",
                caloriesBurn: "aaaa",
                time: 100,
            });

    expect(response.status).toEqual(500);
});
