const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const goalSchema = new mongoose.Schema(
    {
        name:{
            type: String,            
        },
        calories:{
            type: Number,
            min: [0],
        },
        userId:{
            type: String
        },
        startDate:{
            type: Date
        },
        endDate:{
            type: Date
        },
        recurrency:{
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);    

goalSchema.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('goal', goalSchema);