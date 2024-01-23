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


const createExerciseDone = async (req, res) => {
  try {
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



module.exports = {
  getExerciseDone,
  createExerciseDone,
  getExerciseDoneByUserId,
  updateExerciseDoneById,
  deleteExerciseDoneById,
};
