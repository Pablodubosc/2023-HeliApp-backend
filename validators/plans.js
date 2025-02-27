const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validatorCreatePlan = [
    check("name")
    .exists()
    .notEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

    
module.exports = {validatorCreatePlan};