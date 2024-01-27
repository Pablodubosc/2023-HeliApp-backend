const { mealModel, usersModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const getMeals = async (req, res) => {
  try {
    const user = req.user;
    const data = await mealModel.find({});
    res.send({ data, user });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_MEALS", 500);
  }
};

const getMealsByUserId = async (req, res) => {
  try {
    const user = req.user;
    const data = await mealModel.find({ userId: req.params.id });
    res.send({ data, user });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_MEALS", 500);
  }
};

const getMealsByUserIdAndDate = async (req, res) => {
  try {
    const user = req.user;

    const filter = {
      userId: req.params.id,
      date: {$gte: new Date(`${req.params.date}T00:00:00.000Z`), $lt: new Date(`${req.params.date}T23:59:59.999Z`) }
    };

    const data = await mealModel.find(filter);
    res.send({ data, user });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_MEALS", 500);
  }
};

const createMeal = async (req, res) => {
  try {
    const data = await mealModel.create(req.body);
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_MEALS", 500);
  }
};

const updateMealById = async (req, res) => {
  try {
    const data = await mealModel.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_UPDATE_MEAL", 500);
  }
};

const deleteMealById = async (req, res) => {
  try {
    const data = await mealModel.delete({ _id: req.params.id });
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_DELETE_MEAL", 500);
  }
};

const getCaloriesByDays = async (req, res) => {
  try {
    
    const userId = req.params.id;
    const startDate = new Date(req.params.startDate).toISOString();
    const endDate = new Date(req.params.endDate).toISOString();
    const type = req.params.type.toLowerCase();
    const filter = {
      userId: userId,
      date: { $gte: startDate, $lte: endDate },
    };

    const fechaFin = new Date(endDate);
    const fechasIntermedias = [];
    let fechaActual = new Date(startDate);
  
    while (fechaActual < fechaFin) {
      fechasIntermedias.push({
        date: fechaActual.toISOString(),
        [type]: 0
      });
  
      fechaActual.setDate(fechaActual.getDate() + 1)
    }

    const meals = await mealModel.find(filter);
    const dataOfMeals = {};

    meals.forEach((item) => {
      const date = item.date.toISOString().split('T')[0];
      const typePerDay = item[type];

      if (dataOfMeals[date]) {
        dataOfMeals[date] += typePerDay;
      } else {
        dataOfMeals[date] = typePerDay;
      }
    });


    function obtenerFechaSinHora(date) {
      return date.split('T')[0];
    }
    
 

    // Recorre el segundo arreglo y actualiza el primero si encuentra una fecha coincidente (sin la hora)
    for (const date in dataOfMeals) {
      const typeValue = dataOfMeals[date];
      const fechaSinHora = obtenerFechaSinHora(date);
      const index = fechasIntermedias.findIndex(item => obtenerFechaSinHora(item.date) === fechaSinHora);
      if (index !== -1) {
        fechasIntermedias[index][type] = typeValue;
      }
    }
    res.send({ fechasIntermedias });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_CALORIES", 500);
  }
};

const getCaloriesBetweenDays = async (req, res) => {
  try {
    const userId = req.params.id;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;
    const type = req.params.type;
    const filter = {
      userId: userId,
      date: { $gte: startDate, $lte: endDate },
    };

    const result = await mealModel.find(filter);

    let totalConsumido = 0;
    result.forEach((record) => {
      totalConsumido += record[type];
    });

    res.send({ totalConsumido });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_CALORIES", 500);
  }
};



module.exports = {
  getMeals,
  createMeal,
  getMealsByUserId,
  getMealsByUserIdAndDate,
  updateMealById,
  deleteMealById,
  getCaloriesBetweenDays,
  getCaloriesByDays,
};
