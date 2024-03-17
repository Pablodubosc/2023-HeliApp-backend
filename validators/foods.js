const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validatorCreateFood = [
    check("name")
    .exists()
    .notEmpty().withMessage("Name cant be empty"),
    check('calories')
    .exists()
    .notEmpty().withMessage("Calories cant be empty"),
    check('weight')
    .exists()
    .notEmpty().withMessage("Weight cant be empty"),
    check('category')
    .exists()
    .notEmpty().withMessage("Category cant be empty"),
    (req, res, next) => {
        if (req.body.carbs === "") {
            req.body.carbs = 0;
        }
        if (req.body.proteins === "") {
            req.body.proteins = 0;
          }
        if (req.body.fats === "") {
            req.body.fats = 0;
        }
        return validateResults(req, res, next);
    }
];

    
module.exports = {validatorCreateFood};