const { mealModel, usersModel, planModel, exerciseDoneModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

function calculateNutritionalInformation(meal) {
  console.log(meal)
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
    totalProteins = +proteinsPerFood;
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
      const userJson = await usersModel.findOne({ _id: userId });
        const allergicFoods = userJson.allergies;
        // Filtra las comidas que no contienen alimentos alérgicos
        const filteredMeals = allMealsWithInfo.filter(meal => {
          for (const food of meal.foods) {
            if (allergicFoods.includes(food.foodId._id)) {
              return false; // La comida contiene un alimento alérgico, no la incluyas
            }
          }
          return true; // La comida no contiene alimentos alérgicos, inclúyela
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
    console.log(e)
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
      exerciseDoneId = randomExercise._id;
      const randomExerciseWithDone = { exerciseDoneSuggestionId: exerciseDoneId, done: false };
      selectedExercises.push(randomExerciseWithDone);
      currentObjetive += randomExercise.totalCaloriesBurn;
    }
  }
  return selectedExercises;
};

const selectMealsToMeetObjetive = (filteredMeals, target, targetType) => {

    console.log("FILTERED")
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
      mealId= randomMeal._id;
      const randomMealWithDone = { mealSuggestionId: mealId, done: false };
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
      .populate({
        path: "suggestions.mealSuggestionId",
        model: "meals",
      })
      .populate({
        path: "suggestions.exerciseDoneSuggestionId",
        model: "exerciseDone",
      })
      .exec();
    res.send({ data });
    } catch (e) {
      console.log(e)
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

module.exports = {
  createPlan,
  getPlansByUserId,
  deletePlanById
};
