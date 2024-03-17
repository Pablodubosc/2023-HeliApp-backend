const { foodModel, usersModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const getFoods = async (req, res) => {
  try {
    const user = req.user;
    const data = await foodModel.find({});
    res.send({ data, user });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_FOODS", 500);
  }
};

const getFoodsWithOutAllergies = async (req, res) => {
  try {
    const user = req.user;
    const allFoods = await foodModel.find({});
    const allergies = await usersModel.findOne({ _id: req.params.id });
    const data = allFoods.filter(alimento => !(allergies.allergies).some(alergia => alergia.name === alimento.name));

    res.send({ data, user });
  } catch (e) {
    console.log(e)
    handleHttpError(res, "ERROR_GET_FOODS", 500);
  }
};

const getFoodsByCategory = async (req, res) => {
  try {
    const user = req.user;
    const data = await foodModel.find({
      category: req.params.categoryName,
    });
    res.send({ data, user });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_CATEGORIES", 500);
  }
};

const getFoodsByCategoryWithOutAllergies = async (req, res) => {
  try {
    const user = req.user;
    const foodsByCategory = await foodModel.find({
      category: req.params.categoryName,
    });
    const allergies = await usersModel.findOne({ _id: req.params.id });
    const data = foodsByCategory.filter(alimento => !(allergies.allergies).some(alergia => alergia.name === alimento.name));

    res.send({ data, user });
  } catch (e) {
    console.log(e)
    handleHttpError(res, "ERROR_GET_FOODS", 500);
  }
};


const createFood = async (req, res) => {
  try {
    const data = await foodModel.create(req.body);
    res.status(200).send({ message: 'Food create succesfully', foodId : data._id });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_FOOD", 500);
  }
};

module.exports = { getFoods, createFood, getFoodsByCategory, getFoodsWithOutAllergies,getFoodsByCategoryWithOutAllergies };
