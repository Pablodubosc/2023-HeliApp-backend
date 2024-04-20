const { intermittentFastingModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");
const schedule = require("node-schedule");
const { sendIntermittentFastingNotificationEmail } = require("./notifications");

const createIntermittentFasting = async (req, res) => {
  try {
    const userId = req.userId;
    const overlappingFasting = await intermittentFastingModel.findOne({
      $or: [
        {
          startDateTime: { $lt: req.body.endDateTime },
          endDateTime: { $gt: req.body.startDateTime },
        },
      ],
      userId: userId,
    });

    if (overlappingFasting) {
      return handleHttpError(res, "CONFLICTING_FASTING_PERIOD", 501);
    }

    const data = await intermittentFastingModel.create(req.body);
    const endDateTime = new Date(req.body.endDateTime);
    schedule.scheduleJob(
      endDateTime.setTime(endDateTime.getTime() - 60 * 60000),
      () => {
        const reqUpdateUser = {
          body: {
            email: req.body.email,
            userName: req.body.userName,
          },
        };

        const resUpdateUser = {
          send: (data) => {},
          status: (statusCode) => {
            console.log(`Status Code: ${statusCode}`);
          },
        };

        sendIntermittentFastingNotificationEmail(reqUpdateUser, resUpdateUser);
      }
    );
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_INTERMITTENT_FASTING", 500);
  }
};

const getIntermittentFastingByUserId = async (req, res) => {
  try {
    const data = await intermittentFastingModel.find({
      userId: req.userId,
    });
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_INTERMITTENT_FASTING_BY_USER_ID", 500);
  }
};

const getActiveIntermittentFastingByUserId = async (req, res) => {
  try {
    const currentDate = new Date();

    const data = await intermittentFastingModel.find({
      userId: req.userId,
    });
    const filteredData = data.filter(
      (item) =>
        new Date() >= item.startDateTime && new Date() <= item.endDateTime
    );
    res.send({ filteredData });
  } catch (e) {
    handleHttpError(
      res,
      "ERROR_GET_ACTIVE_INTERMITTENT_FASTING_BY_USER_ID",
      500
    );
  }
};

const deleteActiveIntermittentFasting = async (req, res) => {
  try {
    const data = await intermittentFastingModel.delete({
      _id: req.params.IntermittentFastingId,
    });
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_DELETE_GOAL", 500);
  }
};

module.exports = {
  createIntermittentFasting,
  getIntermittentFastingByUserId,
  getActiveIntermittentFastingByUserId,
  deleteActiveIntermittentFasting,
};
