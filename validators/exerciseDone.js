const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validatorCreateExerciseDone = [
    check("name")
    .exists()
    .notEmpty(),
    check('exercises')
    .exists()
    .notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

    
module.exports = {validatorCreateExerciseDone};