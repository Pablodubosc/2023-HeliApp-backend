const { exerciseModel, usersModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const getExercise = async (req, res) => {
  try {
    const user = req.user;
    const data = await exerciseModel.find({});
    res.send({ data, user });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_FOODS", 500);
  }
};


const createExercise = async (req, res) => {
  try {
    const data = await exerciseModel.create(req.body);
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_FOOD", 500);
  }
};

module.exports = { getExercise, createExercise };
