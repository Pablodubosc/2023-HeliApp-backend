const { waterGlassModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const createWaterGlass = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await waterGlassModel.create({ ...req.body, userId: userId });

    // Convertir el documento Mongoose a un objeto de JavaScript estándar
    const dataObject = data.toObject();

    // Eliminar la propiedad 'userId' del objeto
    delete dataObject.userId;

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
    const result = await waterGlassModel.aggregate([
      {
        $match: { userId },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    res.send({ result });
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