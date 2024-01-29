const { mealModel, usersModel, planModel, exerciseDoneModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const createPlan = async (req, res) => {
  try {
    const planObjetive = req.body.planObjetive;
    const planType = req.body.planType;
    const allMeals = await mealModel.find();
    const allExercises = await exerciseDoneModel.find();
    const userJson = await usersModel.findOne({ _id: req.body.userId });
    if (planType != "calories burn"){
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

        const selectedMeals = selectMealsToMeetObjetive(filteredMeals, planObjetive, planType);

        req.body.suggestions = selectedMeals;         
    }
    else{
      const selectedExercise = selectExerciseToMeetObjetive(allExercises,planObjetive, planType);

      req.body.suggestions = selectedExercise; 
    }

    const data = await planModel.create(req.body);
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_PLAN", 500);
  }
};

const selectExerciseToMeetObjetive = (allExercises, target, targetType) => {

  // Copia la lista de comidas para no modificar la original
  const exercisesCopy = [...allExercises];

  // Función para obtener una comida aleatoria de la lista
  const getRandomExercise = () => {
    const randomIndex = Math.floor(Math.random() * exercisesCopy.length);
    return exercisesCopy.splice(randomIndex, 1)[0]; // Elimina y retorna la comida seleccionada
  };

  // Inicializa variables
  let selectedExercises = [];
  let currentObjetive = 0;

  // Bucle para seleccionar comidas hasta alcanzar o superar las Calories
  while ((currentObjetive < target) && exercisesCopy.length > 0) {
    const randomExercise = getRandomExercise();
    if(currentObjetive + randomExercise.caloriesBurn < target)
    {
      const randomExerciseWithDone = { ...randomExercise._doc, done: false };
      selectedExercises.push(randomExerciseWithDone);
      currentObjetive += randomExercise.caloriesBurn;
    }
  }

  return selectedExercises;
};

const selectMealsToMeetObjetive = (filteredMeals, target, targetType) => {

  // Copia la lista de comidas para no modificar la original
  const mealsCopy = [...filteredMeals];

  // Función para obtener una comida aleatoria de la lista
  const getRandomMeal = () => {
    const randomIndex = Math.floor(Math.random() * mealsCopy.length);
    return mealsCopy.splice(randomIndex, 1)[0]; // Elimina y retorna la comida seleccionada
  };

  // Inicializa variables
  let selectedMeals = [];
  let currentObjetive = 0;

  // Bucle para seleccionar comidas hasta alcanzar o superar las Calories
  while ((currentObjetive < target) && mealsCopy.length > 0) {
    const randomMeal = getRandomMeal();
    if(currentObjetive + randomMeal[targetType] < target && randomMeal[targetType]>0)
    {
      const randomMealWithDone = { ...randomMeal._doc, done: false };
      selectedMeals.push(randomMealWithDone);
      currentObjetive += randomMeal[targetType];
    }
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

const updatePlanById = async (req, res) => {
    try {
      const data = await planModel.findOneAndUpdate(
        { _id: req.body._id },
        req.body
      );
      res.send({ data });
    } catch (e) {
      handleHttpError(res, "ERROR_UPDATE_PLAN", 500);
    }
  };

module.exports = {
  createPlan,
  getPlansByUserId,
  updatePlanById
};
