const { ObjectId } = require("mongodb");
const { goalModel,mealModel, exerciseDoneModel } = require("../models");
const { handleHttpError } = require("../utils/handleErrors");

const getGoalsByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return handleHttpError(res, "User ID not provided", 400);
    }
    const data = await goalModel.find({ userId: userId });
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_GOALS_BY_USER_ID", 500);
  }
};

const getActiveGoalsByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return handleHttpError(res, "User ID not provided", 400);
    }
    const data = await goalModel.find({ userId: userId });
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
  const newGoal = {"name" : goal.name, "objetive": goal.objetive, "type":goal.type, "userId": goal.userId, "startDate":goal.startDate, "endDate":goal.endDate, "recurrency":goal.recurrency}
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
      const goalType = item.type;
      if(goalType == "calories burn"){
        const result = await exerciseDoneModel.find(filter);
        let totalConsumido = 0;
        result.forEach((record) => {
          totalConsumido += record.caloriesBurn;
        });

        const state = await calculateGoalStatus(item)
      
        const newItem = {
          ...item.toObject(),
          totalConsumido: totalConsumido,
          state : state
        };
      
        return newItem;
      }
      else{
        const result = await mealModel.find(filter);
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
    }
    }));
    res.send({ goalsWithProgress });
  } catch (e) {
    handleHttpError(res, "ERROR_GET_GOALS_BY_USER_ID", 500);
  }
}

const createGoal = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return handleHttpError(res, "User ID not provided", 400);
    }
    const data = await goalModel.create({ ...req.body, userId: userId });
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_CREATE_GOAL", 500);
  }
};


const updateGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;

    // Primero, verificamos si el objetivo pertenece al usuario actual
    const goal = await goalModel.findOne({ _id: goalId, userId: userId });
    if (!goal) {
      return handleHttpError(res, "Goal not found or unauthorized", 404);
    }
    const data = await goalModel.findOneAndUpdate(
      { _id: goalId},
      req.body
    );
    res.send({ data });
  } catch (e) {
    handleHttpError(res, "ERROR_UPDATE_GOAL", 500);
  }
};

const deleteGoal = async (req, res) => {
  try {
    const userId = req.userId;
    const goalId = req.params.goalId;

    // Primero, verificamos si el objetivo pertenece al usuario actual
    const goal = await goalModel.findOne({ _id: goalId, userId: userId });
    if (!goal) {
      return handleHttpError(res, "Goal not found or unauthorized", 404);
    }
    // Si el objetivo pertenece al usuario, procedemos a eliminarlo
    const data = await goalModel.deleteOne({ _id: goalId });
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
