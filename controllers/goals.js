const { ObjectId } = require("mongodb");
const { goalModel,mealModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const getGoalsByUserId = async (req, res) => {
  try {
    const data = await goalModel.find({ userId: req.params.userId });
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_GOALS_BY_USER_ID", 500);
  }
};

const getActiveGoalsByUserId = async (req, res) => {
  try {
    const data = await goalModel.find({ userId: req.params.userId });
    const filteredData = data.filter(
      (item) => new Date() >= item.startDate && new Date() <= item.endDate
    );
    res.send({ filteredData });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_GOALS_BY_USER_ID", 500);
  }
};

const calculateGoalStatus = async (goal) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const goalStartDate = new Date(goal.startDate);
  goalStartDate.setHours(0, 0, 0, 0);

  const goalEndDate = new Date(goal.endDate);
  goalEndDate.setHours(0, 0, 0, 0);

  if (today < goalStartDate) {
    return "Not started";
  } else if (today >= goalStartDate && today <= goalEndDate) {
    return "In progress";
  } else {
    if( goal.recurrency === "Monthly" )
    {
      await goalModel.deleteOne({ _id: goal._id });
      goal.startDate.setMonth(goal.startDate.getMonth() + 1);
      goal.endDate.setMonth(goal.endDate.getMonth() + 1);
      await createNewRecurrencyGoal(goal)
    }
    if( goal.recurrency === "Weekly" )
    {
      await goalModel.deleteOne({ _id: goal._id });
      goal.startDate.setDate(goal.startDate.getDate() + 7);
      goal.endDate.setDate(goal.endDate.getDate() + 7);
      await createNewRecurrencyGoal(goal)
    }
    return "Expired";
  }
};

const createNewRecurrencyGoal = async (goal) => {
  const newGoal = {"name" : goal.name, "calories": goal.calories, "userId": goal.userId, "startDate":goal.startDate, "endDate":goal.endDate, "recurrency":goal.recurrency}
  await goalModel.create(newGoal);
};

const getGoalsByUserWithProgress = async(req,res) => {
  try {
    const goals = await goalModel.find({ userId: req.params.userId });
    const goalsWithProgress = await Promise.all(goals.map(async (item) => {
      const userId = item.userId;
      const startDate = item.startDate.toISOString();
      const endDate = item.endDate.toISOString();
      const filter = {
        userId: userId,
        date: { $gte: startDate, $lte: endDate },
      };
    
      const result = await mealModel.find(filter);
      const goalType = item.type;
      let totalConsumido = 0;
      result.forEach((record) => {
        totalConsumido += record[goalType];
      });

      const state = await calculateGoalStatus(item)
    
      const newItem = {
        ...item.toObject(),
        totalConsumido: totalConsumido,
        state : state
      };
    
      return newItem;
    }));
    res.send({ goalsWithProgress });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_GOALS_BY_USER_ID", 500);
  }
}

const createGoal = async (req, res) => {
  try {
    const data = await goalModel.create(req.body);
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_GOAL", 500);
  }
};


const updateGoal = async (req, res) => {
  try {
    const data = await goalModel.findOneAndUpdate(
      { _id: req.params.goalId },
      req.body
    );
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_UPDATE_GOAL", 500);
  }
};

const deleteGoal = async (req, res) => {
  try {
    const data = await goalModel.delete({ _id: req.params.goalId });
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_DELETE_GOAL", 500);
  }
};

module.exports = {
  getGoalsByUserId,
  createGoal,
  updateGoal,
  deleteGoal,
  getActiveGoalsByUserId,
  getGoalsByUserWithProgress
};
