const { exerciseDoneModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const getExerciseDone = async (req, res) => {
  try {
    const user = req.user;
    const data = await exerciseDoneModel.find({});
    res.send({ data, user });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_EXERCISESDONE", 500);
  }
};

const getExerciseDoneByUserId = async (req, res) => {
  try {
    const user = req.user;
    const data = await exerciseDoneModel.find({ userId: req.params.id });
    res.send({ data, user });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_EXERCISESDONE", 500);
  }
};

const getExerciseDoneByUserIdAndDate = async (req, res) => {
  try {
    const user = req.user;

    const filter = {
      userId: req.params.id,
      date: {$gte: new Date(`${req.params.date}T00:00:00.000Z`), $lt: new Date(`${req.params.date}T23:59:59.999Z`) }
    };

    const data = await exerciseDoneModel.find(filter);
    res.send({ data, user });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_MEALS", 500);
  }
};


const createExerciseDone = async (req, res) => {
  try {
    console.log("ENTRA ACA"+JSON.stringify(req.body))
    const data = await exerciseDoneModel.create(req.body);
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_EXERCISESDONE", 500);
  }
};

const updateExerciseDoneById = async (req, res) => {
  try {
    const data = await exerciseDoneModel.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_UPDATE_EXERCISESDONE", 500);
  }
};

const deleteExerciseDoneById = async (req, res) => {
  try {
    const data = await exerciseDoneModel.delete({ _id: req.params.id });
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_DELETE_EXERCISESDONE", 500);
  }
};

const getCaloriesBurnByDays = async (req, res) => {
  try {
    const userId = req.params.id;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;
    const filter = {
      userId: userId,
      date: { $gte: startDate, $lte: endDate },
    };

    const result = await exerciseDoneModel.find(filter);

    let totalConsumido = 0;
    result.forEach((record) => {
      totalConsumido += record.caloriesBurn;
    });

    res.send({ totalConsumido });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_CALORIES", 500);
  }
};

const getCaloriesBurnBetweenDays = async (req, res) => {
  try {
    const userId = req.params.id;
    const startDate = new Date(req.params.startDate).toISOString();
    const endDate = new Date(req.params.endDate).toISOString();
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
        caloriesBurn: 0
      });
  
      fechaActual.setDate(fechaActual.getDate() + 1)
    }

    const exerciseDone = await exerciseDoneModel.find(filter);
    const dataOfExerciseDone = {};

    exerciseDone.forEach((item) => {
      const date = item.date.toISOString().split('T')[0];
      const caloriesBurn = item.caloriesBurn;

      if (dataOfExerciseDone[date]) {
        dataOfExerciseDone[date] += caloriesBurn;
      } else {
        dataOfExerciseDone[date] = caloriesBurn;
      }
    });


    function obtenerFechaSinHora(date) {
      return date.split('T')[0];
    }
    
 

    // Recorre el segundo arreglo y actualiza el primero si encuentra una fecha coincidente (sin la hora)
    for (const date in dataOfExerciseDone) {
      const caloriesBurnPerDay = dataOfExerciseDone[date];
      const fechaSinHora = obtenerFechaSinHora(date);
      const index = fechasIntermedias.findIndex(item => obtenerFechaSinHora(item.date) === fechaSinHora);
      if (index !== -1) {
        fechasIntermedias[index].caloriesBurn = caloriesBurnPerDay;
      }
    }
    res.send({ fechasIntermedias });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_CALORIES", 500);
  }
};


module.exports = {
  getExerciseDone,
  createExerciseDone,
  getExerciseDoneByUserId,
  updateExerciseDoneById,
  deleteExerciseDoneById,
  getCaloriesBurnByDays,
  getExerciseDoneByUserIdAndDate,
  getCaloriesBurnBetweenDays
};
