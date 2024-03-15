const { categoryModel } = require('../models');
const { handleHttpError } = require('../utils/handleErrors');


const getCategories = async (req, res) => {
    try{
        const data = await categoryModel.find({});
        res.send({ data, user });        
    } catch(e){
        handleHttpError(res, 'ERROR_GET_CATEGORIES', 500);
    }
}


const createCategory = async (req, res) => {
    try{
        const data = await categoryModel.create(req.body);
        res.send({data});
    } catch(e){
        handleHttpError(res, 'ERROR_CREATE_CATEGORY', 500);
    }
}

module.exports = { getCategories, createCategory };