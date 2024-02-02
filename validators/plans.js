const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator")

const validatorCreatePlan = [
    check('suggestions')
    .exists()
    .isEmpty(),
    (req, res, next) => {
        return validateResults(req, res, next);
    }
];

    
module.exports = {validatorCreatePlan};