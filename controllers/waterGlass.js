const { waterGlassModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const createWaterGlass = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await waterGlassModel.create({ ...req.body, userId: userId });

    // Convertir el documento Mongoose a un objeto de JavaScript estándar
    const { userId: removedUserId, ...dataObject } = data.toObject();

    res.send({ data: dataObject });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_WATER_GLASS", 500);
  }
};

const getWaterGlassByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    let data = await waterGlassModel.find({ userId: userId });
    data = data.map((item) => {
      const { userId, ...rest } = item.toObject();
      return rest;
    });
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_WATER_GLASS_BY_USER_ID", 500);
  }
};

const getWaterGlassForUserIdByDay = async (req, res) => {
  try {
    const userId = req.userId;
    const results = await waterGlassModel.find({ userId });
    const groupedResults = {};
    // Iteramos sobre los resultados y contamos las ocurrencias de cada fecha
    results.forEach((result) => {
      const date = result.date.toISOString().split("T")[0]; // Obtenemos la fecha en formato "YYYY-MM-DD"

      if (!groupedResults[date]) {
        groupedResults[date] = 0;
      }
      groupedResults[date]++;
    });
    res.send({ groupedResults });
  } catch (e) {
    handleHttpError(
      res,
      "ERROR_GET_WATER_GLASS_FOR_USER_ID_COUNT_BY_DATE",
      500
    );
  }
};

module.exports = {
  createWaterGlass,
  getWaterGlassByUserId,
  getWaterGlassForUserIdByDay,
};