const request = require('supertest');
const app = require('../app');
const { foodModel } = require("../models");
const { usersModel } = require("../models");


beforeAll(async () => {
    await foodModel.deleteMany({});
  });

async function generateToken() {
   const response = await request(app).post("/api/auth/register").send({ // se registra
    firstName: "test",
    lastName: "user",
    email: "adminuser@admin.com",
    password: "adminuser",
    sex: "male",
    age: "23",
    height: "1.80",
    weight: "70",
  });
  const response1 = await request(app).post("/api/auth/login").send({ // se logea para obtener token
    email: "adminuser@admin.com",
    password: "adminuser",
  });
  return response1._body.token
}
test("A food can't be created without a name", async () => {
    const testToken = await generateToken();
    const response = await request(app)
      .post("/api/foods/")
      .send({
        name: "",
        calories: "10",
        weight: "10",
        category: "Carne",
      })
      .set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(403);
    expect(response.body.errors[0].msg).toEqual("Name cant be empty")
  });

  test("A food can't be created without calories", async () => {
    const testToken = await generateToken();
    const response = await request(app)
      .post("/api/foods/")
      .send({
        name: "Carne",
        calories: "",
        weight: 10,
        category: "Carne",
      })
      .set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(403);
    expect(response.body.errors[0].msg).toEqual("Calories cant be empty")
  });

  test("A food can't be created without weight", async () => {
    const testToken =  await generateToken();
    const response = await request(app)
      .post("/api/foods")
      .send({
        name: "Carne",
        calories: 10,
        weight: "",
        category: "Carne",
      })
      .set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(403);
    expect(response.body.errors[0].msg).toEqual("Weight cant be empty")
  });

  test("A food can't be created without category", async () => {
    const testToken =  await generateToken();
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
    expect(response.body.errors[0].msg).toEqual("Category cant be empty")
  });


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

  test("User create a food succesfully", async () => {
    const testToken =  await generateToken();
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
      .set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(200);
    const foodId = response.body.foodId;
    const food = await foodModel.findById(foodId);
    expect(food).toBeTruthy(); // que es tobetruthy?
    expect(food.name).toEqual("Rucula")
  });


  test("User create a food with cateogry 'Carne' and a food with cateogry 'Fruta', then filter with 'Carne' and all the data recieve are 'Carne'", async () => {
    const testToken =  await generateToken();
    const foodToSend = {
      name: "Lomo",
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
      .set("Authorization", "Bearer " + testToken);
    expect(response.statusCode).toEqual(200);
    const foodToSend2 = {
      name: "Manzana",
      calories: 2,
      weight: 10,
      category: "Fruta",
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
    const data = response3.body.data;
     // Chequea que todo lo que hay dentro de la respuesta del filtra tenga la cateogria Carne
    data.forEach(item => {
        expect(item.category).toEqual('Carne');
    });
  });


/*

test("Esto deberia retornar un 403", async() => {
    const response = await request(app)
    .post('/api/foods')
    .send(
        {
            "name":"",
            "calories":"10",
            "weight": "10",
            "category": "Carne"
        }
    )
    expect(response.statusCode).toEqual(403);
})

test("Se creo el alimento correctamente", async() => {
    const response = await request(app)
    .post('/api/foods')
    .send(
        {
            "name": "Rucula",
            "calories": "2",
            "weight": "10",
            "category": "Carne",
            "carbs": "",
            "proteins": "",
            "fats": ""
        }
    )
    expect(response.statusCode).toEqual(200);
})

test("[GET FOODS BY CATEGORY] Se obtuvieron los alimentos por categoria correctamente", async() => {
    const response = await request(app)
    .get('/api/foods/category/Carne')
    expect(response.statusCode).toEqual(200);
})

test("Se obtuvieron los alimentos correctamente [200]", async() => {
    const response = await request(app)
    .get('/api/foods')
    expect(response.statusCode).toEqual(200);
})

test('[GET FOODS]Esto deberia retornar un 500', async () => {
    findStub = sinon.stub(foodModel, 'find').throws(new Error('Database error'));

    const response = await request(app)
      .get('/api/foods');

    expect(response.status).toEqual(500);
}, 1000);

test('[CREATE FOOD]Esto deberia retornar un 500', async () => {
    sinon.stub(foodModel, 'create').throws(new Error('Database error'));

    const response = await request(app)
      .post('/api/foods')
      .send({
                "name": "Rucula",
                "calories": "2",
                "weight": "10",
                "category": "Carne"
            });

    expect(response.status).toEqual(500);
});

test('[GET FOODS BY CATEGORY]Esto deberia retornar un 500', async () => {
    findStub.throws(new Error('Database error'));

    const response = await request(app)
    .get('/api/foods/category/Verdura');

    expect(response.status).toEqual(500);
});*/