const { exerciseDoneModel, exerciseModel } = require("../models");
const exercise = require("../models/exercise");
const exerciseDone = require("../models/exerciseDone");
const { handleHttpError } = require("../utils/handleErrors");

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


const getExerciseDoneByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await exerciseDoneModel
      .find({ userId: userId })
      .select("-userId")
      .populate({
        path: "exercises.exerciseId",
      })
      .exec();

      // Convertir el resultado en un objeto JavaScript utilizando toJSON()
    const exercisesDone = data.map((exerciseDone) => exerciseDone.toJSON());
    const exercisesDoneToSend = exercisesDone.map((exerciseDone) =>
      calculateExerciseInformation(exerciseDone)
    );

    res.send({ data: exercisesDoneToSend });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_EXERCISESDONE", 500);
  }
};


const getExerciseDoneByUserIdAndDate = async (req, res) => {
  try {
    const userId = req.userId;

    const filter = {
      userId: userId,
      date: {
        $gte: new Date(`${req.params.date}T00:00:00.000Z`),
        $lt: new Date(`${req.params.date}T23:59:59.999Z`),
      },
    };

    let data = await exerciseDoneModel
      .find(filter)
      .select("-userId")
      .populate({
        path: "exercises.exerciseId"
      })
      .exec();
    const exercisesDone = data.map((exerciseDone) => exerciseDone.toJSON());
    const exercisesDoneToSend = exercisesDone.map((exerciseDone) =>
      calculateExerciseInformation(exerciseDone)
    );
    res.send({ exercisesDoneToSend });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_MEALS", 500);
  }
};


const createExerciseDone = async (req, res) => {
  try {
    const userId = req.userId;
    const exerciseDoneData = { ...req.body, userId };
    const data = await exerciseDoneModel.create(exerciseDoneData);
     // Eliminar el userId de la respuesta
     const { userId: removedUserId, ...responseData } = data.toObject();
     //res.status(200).end();
     res.send({ data: responseData });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_EXERCISESDONE", 500);
  }
};


const updateExerciseDoneById = async (req, res) => {
  try {
    const userId = req.userId;
    const exerciseDoneId = req.params.id;

    // Primero, verificamos si la comida pertenece al usuario actual
    const exerciseDone = await exerciseDoneModel.findOne({ _id: exerciseDoneId, userId: userId });
    if (!exerciseDone) {
      return handleHttpError(res, "ExerciseDone not found or unauthorized", 404);
    }

    // Si la comida pertenece al usuario, procedemos a actualizarla
    const updatedExerciseDone = await exerciseDoneModel.findOneAndUpdate(
      { _id: exerciseDoneId },
      req.body
    );

    // Eliminar el userId de la respuesta
    const { userId: removedUserId, ...responseData } = updatedExerciseDone.toObject();

    res.send({ data: responseData });
  } catch (e) {
    handleHttpError(res, "ERROR_UPDATE_MEAL", 500);
  }
};


const deleteExerciseDoneById = async (req, res) => {
  try {
    // Obtener el userId de la solicitud
    const userId = req.userId;
    // Obtener la meal por el _id
    const exerciseDoneToDelete = await exerciseDoneModel.findOne({ _id: req.params.id });
    // Verificar si la meal existe y si el userId coincide
    if (!exerciseDoneToDelete || exerciseDoneToDelete.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You don't have permission to delete this exerciseDone" });
    }

    // Borrar la meal si todo está bien
    const deletedExerciseDone = await exerciseDoneModel.deleteOne({ _id: req.params.id });

    res
      .status(200)
      .json({ message: "ExerciseDone successfully deleted", data: deletedExerciseDone });
  } catch (e) {
    handleHttpError(res, "ERROR_DELETE_MEAL", 500);
  }
};



const getCaloriesBurnBetweenDays = async (req, res) => {
  try {
    const userId = req.userId;
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
        totalCaloriesBurn: 0
      });

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    const exercisesDone = await exerciseDoneModel
      .find(filter)
      .select("-userId")
      .populate({
        path: "exercises.exerciseId",
      })
      .exec();
    const dataOfExercisesDone = {};
    exercisesDone.forEach((item) => {
      const date = item.date.toISOString().split("T")[0];
      const exerciseDone = calculateExerciseInformation(item);
      const totalCaloriesBurnPerDay = exerciseDone.totalCaloriesBurn;

      if (dataOfExercisesDone[date]) {
        dataOfExercisesDone[date] += totalCaloriesBurnPerDay;
      } else {
        dataOfExercisesDone[date] = totalCaloriesBurnPerDay;
      }
    });

    function obtenerFechaSinHora(date) {
      return date.split("T")[0];
    }

    // Recorre el segundo arreglo y actualiza el primero si encuentra una fecha coincidente (sin la hora)
    for (const date in dataOfExercisesDone) {
      const totalCaloriesBurn = dataOfExercisesDone[date];
      const fechaSinHora = obtenerFechaSinHora(date);
      const index = fechasIntermedias.findIndex(
        (item) => obtenerFechaSinHora(item.date) === fechaSinHora
      );
      if (index !== -1) {
        fechasIntermedias[index].totalCaloriesBurn = totalCaloriesBurn;
      }
    }
    res.send({ fechasIntermedias });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_CALORIES", 500);
  }
};

const getCaloriesBurnByDays = async (req, res) => {
  try {
    const userId = req.userId;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;
    const filter = {
      userId: userId,
      date: { $gte: startDate, $lte: endDate },
    };

    const result = await exerciseDoneModel
      .find(filter)
      .select("-userId")
      .populate({
        path: "exercises.exerciseId",
      })
      .exec();
    const exercisesDone = result.map((exerciseDone) => exerciseDone.toJSON());
    const exercisesDoneToSend = exercisesDone.map((exerciseDone) =>
      calculateExerciseInformation(exerciseDone)
    );
    let totalCaloriesBurn = 0;
    exercisesDoneToSend.forEach((record) => {
      totalCaloriesBurn += record.totalCaloriesBurn;
    });

    res.send({ totalCaloriesBurn });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_CALORIES", 500);
  }
};


module.exports = {
  createExerciseDone,
  getExerciseDoneByUserId,
  updateExerciseDoneById,
  deleteExerciseDoneById,
  getCaloriesBurnByDays,
  getExerciseDoneByUserIdAndDate,
  getCaloriesBurnBetweenDays
};
