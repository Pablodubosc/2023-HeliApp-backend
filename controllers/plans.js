const { mealModel, usersModel, planModel, exerciseDoneModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

function calculateNutritionalInformation(meal) {
  let totalCalories = 0;
  let totalFats = 0;
  let totalCarbs = 0;
  let totalProteins = 0;
  meal.foods.forEach((food) => {
    let caloriesPerFood = Math.round(
      food.weightConsumed * (food.foodId.calories / food.foodId.weight)
    );
    let fatsPerFood = Math.round(
      food.weightConsumed * (food.foodId.fats / food.foodId.weight)
    );
    let carbsPerFood = Math.round(
      food.weightConsumed * (food.foodId.carbs / food.foodId.weight)
    );
    let proteinsPerFood = Math.round(
      food.weightConsumed * (food.foodId.proteins / food.foodId.weight)
    );
    food.caloriesPerFood = caloriesPerFood;
    food.fatsPerFood = fatsPerFood;
    food.carbsPerFood = carbsPerFood;
    food.proteinsPerFood = proteinsPerFood;
    totalCalories += caloriesPerFood;
    totalFats += fatsPerFood;
    totalCarbs += carbsPerFood;
    totalProteins += proteinsPerFood;
  });
  meal.totalCalories = totalCalories;
  meal.totalFats = totalFats;
  meal.totalCarbs = totalCarbs;
  meal.totalProteins = totalProteins;
  return meal;
}

function calculateExerciseInformation(exerciseDone) {
  let totalCaloriesBurn = 0;
  exerciseDone.exercises.forEach((exercise) => {
    let caloriesBurnPerExercise = Math.round(
      exercise.timeWasted * (exercise.exerciseId.caloriesBurn / exercise.exerciseId.time)
    );
    exercise.caloriesBurnPerExercise = caloriesBurnPerExercise;
    totalCaloriesBurn += caloriesBurnPerExercise;
  });
  exerciseDone.totalCaloriesBurn = totalCaloriesBurn;
  return exerciseDone;
}

async function addWarningIfAllergy(meal,userId) {
  const userModel = await usersModel.findOne({ _id: userId }).populate({path: "allergies.allergyId",model: "foods"}).exec();
  const alergias = userModel.allergies
  const foods = meal.suggestion.foods
  for (let allergy of alergias) {
    for (let food of foods) {
      if (allergy.allergyId.name.toString() === food.foodId.name.toString()) {
        meal.allergy = true;
        return meal // Si hay una coincidencia, retorna true
      }
    }
  }
  meal.allergy = false; 
  return meal
}

const createPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const planObjetive = req.body.planObjetive;
    const planType = req.body.planType;
    if (planType != "Calories Burn"){
      const allMeals = await mealModel.find().select("-userId").populate({path: "foods.foodId",}).exec();
      const allMealsJson = allMeals.map((meal) => meal.toJSON());
      const allMealsWithInfo = allMealsJson.map((meal) =>
        calculateNutritionalInformation(meal)
      );
      const userJson = await usersModel.findOne({ _id: userId }).populate({path:'allergies.allergyId',model: "foods"}).exec();
      const allergicFoods = userJson.allergies;
        // Filtra las comidas que no contienen alimentos alérgicos
      const filteredMeals = allMealsWithInfo.filter(meal => {
          // Iterar sobre cada comida
          for (const food of meal.foods) {
            // Iterar sobre cada alimento alérgico
            for (const allergicFood of allergicFoods) {
              // Verificar si el foodId del alimento coincide con el allergyId
              if (JSON.stringify(food.foodId.name) === JSON.stringify(allergicFood.allergyId.name)){
                // Si hay coincidencia, retornar false y excluir la comida
                return false;
              }
            }
          }
          // Si no se encuentra ninguna coincidencia, retornar true y mantener la comida
          return true;
        });

        const selectedMeals = selectMealsToMeetObjetive(filteredMeals, planObjetive, "total"+planType);
        

        if (selectedMeals.length === 0) {
          handleHttpError(res, "ERROR_NO_MEALS_FOUND_FOR_PLAN", 400);
          return;
        }

        req.body.suggestions = selectedMeals; 
        req.body.userId = userId;        
    }
    else{
      const allExercises = await exerciseDoneModel.find().select("-userId").populate({path: "exercises.exerciseId",}).exec();;
      const allExercisesJson = allExercises.map((exercise) => exercise.toJSON());
      const allExercisesDoneWithInfo = allExercisesJson.map((exercise) =>
        calculateExerciseInformation(exercise)
      );
      const selectedExercise = selectExerciseToMeetObjetive(allExercisesDoneWithInfo,planObjetive, "total"+planType);

      if (selectedExercise.length === 0) {
        handleHttpError(res, "ERROR_NO_EXERCISE_FOUND_FOR_PLAN", 400);
        return;
      }
      req.body.suggestions = selectedExercise; 
      req.body.userId = userId;  
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
    if(currentObjetive + randomExercise.totalCaloriesBurn <= target)
    {
      const randomExerciseWithDone = { suggestion: randomExercise, done: false };
      selectedExercises.push(randomExerciseWithDone);
      currentObjetive += randomExercise.totalCaloriesBurn;
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
    if(currentObjetive + randomMeal[targetType] <= target && randomMeal[targetType]>0)
    {
      const randomMealWithDone = { suggestion: randomMeal, done: false };
      selectedMeals.push(randomMealWithDone);
      currentObjetive += randomMeal[targetType];
    }
  }

  return selectedMeals;
};


const getPlansByUserId = async (req, res) => {
    try {
      const userId = req.userId;
      const data = await planModel.find({ userId: userId }).select("-userId")
      const allPlans = data.map((plan) => plan.toJSON());
      const plansToSend = await Promise.all(allPlans.map(async (plan) => {
          if (plan.planType != "Calories Burn") {
            for (let i = 0; i < plan.suggestions.length; i++) {
              const suggestion = plan.suggestions[i];
              const suggestionWithWarning = await addWarningIfAllergy(suggestion,userId)
              plan.suggestions[i] = suggestionWithWarning;
          }}
        return plan
      }));
      res.send({ data:plansToSend });
    } catch (e) {
      handleHttpError(res, "ERROR_GET_PLANS", 500);
    }
  };

const deletePlanById = async (req, res) => {
    try {
      // Obtener el userId de la solicitud
      const userId = req.userId;
      // Obtener la meal por el _id
      const planToDelete = await planModel.findOne({ _id: req.params.id });
      // Verificar si la meal existe y si el userId coincide
      if (!planToDelete || planToDelete.userId.toString() !== userId) {
        return res
          .status(403)
          .json({ message: "You don't have permission to delete this meal" });
      }
  
      // Borrar la meal si todo está bien
      const deletedPlan = await planModel.deleteOne({ _id: req.params.id });
  
      res
        .status(200)
        .json({ message: "Plan successfully deleted", data: deletedPlan });
    } catch (e) {
      handleHttpError(res, "ERROR_DELETE_PLAN", 500);
    }
  };

const updatePlanById = async (req, res) => {
    try {
    const userId = req.userId;
    const planId = req.body._id;
    // Primero, verificamos si el plan pertenece al usuario actual
    const plan = await planModel.findOne({ _id: planId, userId: userId });
    if (!plan) {
      return handleHttpError(res, "Plan not found or unauthorized", 404);
    }
    const updatedPlan = await planModel.findOneAndUpdate(
      { _id: req.body._id },
      req.body
    );
    // Eliminar el userId de la respuesta
    const { userId: removedUserId, ...responseData } = updatedPlan.toObject();
    res.send({ data: responseData });
    } catch (e) {
      handleHttpError(res, "ERROR_UPDATE_PLAN", 500);
    }
  };

module.exports = {
  createPlan,
  getPlansByUserId,
  deletePlanById,
  updatePlanById
};
