const { mealModel, usersModel, planModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const createPlan = async (req, res) => {
  try {

    const calories = req.body.calories;
    const allMeals = await mealModel.find();
    const userJson = await usersModel.findOne({ _id: req.body.userId });

    const allergicFoods = userJson.allergies.map(allergy => allergy.name);

    // Filtra las comidas que no contienen alimentos alérgicos
    const filteredMeals = allMeals.filter(meal => {
      for (const food of meal.foods) {
        if (allergicFoods.includes(food.name)) {
          return false; // La comida contiene un alimento alérgico, no la incluyas
        }
      }
      return true; // La comida no contiene alimentos alérgicos, inclúyela
    });

    const selectedMeals = selectMealsToMeetCalories(filteredMeals, calories);

    req.body.meals = selectedMeals;

    const data = await planModel.create(req.body);
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_PLAN", 500);
  }
};


const selectMealsToMeetCalories = (filteredMeals, targetCalories) => {

  // Copia la lista de comidas para no modificar la original
  const mealsCopy = [...filteredMeals];

  // Función para obtener una comida aleatoria de la lista
  const getRandomMeal = () => {
    const randomIndex = Math.floor(Math.random() * mealsCopy.length);
    return mealsCopy[randomIndex];
  };

  // Inicializa variables
  let selectedMeals = [];
  let currentCalories = 0;

  // Bucle para seleccionar comidas hasta alcanzar o superar las Calories
  while ((currentCalories < targetCalories) && mealsCopy.length > 0) {
    const randomMeal = getRandomMeal();
    selectedMeals.push(randomMeal);
    currentCalories += randomMeal.calories;
  }

  // Si nos pasamos de Calories, ajustamos eliminando la última comida seleccionada
  while (currentCalories > targetCalories) {
    const removedMeal = selectedMeals.pop();
    currentCalories -= removedMeal.calories;
  }

  return selectedMeals;
};

const getPlansByUserId = async (req, res) => {
    try {
      const user = req.user;
      const data = await planModel.find({ userId: req.params.id });
      res.send({ data, user });
    } catch (e) {
      handleHttpError(res, "ERROR_GET_PLANS", 500);
    }
  };

module.exports = {
  createPlan,
  getPlansByUserId
};
