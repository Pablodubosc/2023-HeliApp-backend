const { foodModel, usersModel, categoryModel  } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const getFoods = async (req, res) => {
  try {
    const user = req.user;
    const allFoods = await foodModel.find({}).populate({ path: "category" }).exec();
    const userModel = await usersModel.findById(user)
    const data = allFoods.filter(alimento => !(userModel.allergies).some(alergia => alergia.allergyId.toString() === alimento._id.toString()));
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_FOODS", 500);
  }
};

const getAllFoods = async (req, res) => {
  try {
    const user = req.user;
    const allFoods = await foodModel.find({}).populate({ path: "category" }).exec();
    res.send({ allFoods });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_FOODS", 500);
  }
};

const getFoodsByCategory = async (req, res) => {
  try {
    const user = req.user;
    const category = await categoryModel.findOne({
      name: req.params.categoryName,
    });
    // Busca la categoría por nombre
    if (!category) {
      return handleHttpError(res, "CATEGORY_NOT_FOUND", 404);
    }
    const allFoodsWithCategory = await foodModel
      .find({ category: category._id }) // Filtra los alimentos por la categoría encontrada
      .populate("category") // Pobla el campo 'category' del modelo de alimentos
      .exec();

    const userModel = await usersModel.findById(user)
    const data = allFoodsWithCategory.filter(alimento => !(userModel.allergies).some(alergia => alergia._id.toString() === alimento._id.toString()));
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_CATEGORIES", 500);
  }
};


const createFood = async (req, res) => {
  try {
    const data = await foodModel.create(req.body);
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_FOOD", 500);
  }
};

module.exports = { getFoods,getAllFoods, createFood, getFoodsByCategory };
