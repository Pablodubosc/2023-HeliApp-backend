const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const goalSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            requiere: true            
        },
        type:{
            type: String,
            requiere: true
        },
        objetive:{
            type: Number,
            min: [0],
            requiere: true
        },
        userId:{
            type: String,
            requiere: true
        },
        startDate:{
            type: Date,
            requiere: true
        },
        endDate:{
            type: Date,
            requiere: true
        },
        recurrency:{
            type: String,
            requiere: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);    

goalSchema.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('goal', goalSchema);