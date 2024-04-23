const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validatorCreateExercise = [
    check("name")
    .exists()
    .notEmpty().withMessage("Name cant be empty"),
    check('caloriesBurn')
    .exists()
    .notEmpty().withMessage("CaloriesBurn cant be empty"),
    check('time')
    .exists()
    .notEmpty().withMessage("Time cant be empty"),
    (req, res, next) => {
        return validateResults(req, res, next);
      },
];

    
module.exports = {validatorCreateExercise};