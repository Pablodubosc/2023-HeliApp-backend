const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema(
    {
        firstName:{
            type: String,
            required: true,
            maxlength: 25,            
        },
        lastName:{
            type: String,
            required: true,
            maxlength: 25,  
        },
        email:{
            type: String,
            required: true,
            unique: true,
            maxlength: 40,  
        },
        password:{
            type: String,
            select: false
        },
        sex:{
            type: String,
            required: true,
        },
        age:{
            type: Number,
            required: true,
            max: 99
        },
        height:{
            type: Number,
            required: true,
            max: 999
        },
        weight:{
            type: Number,
            required: true,
            max: 999
        },
        allergies: [{
            allergyId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "foods"}
        }],
        secretToken:{
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);    

userSchema.plugin(mongooseDelete, { overrideMethods: 'all' });
module.exports = mongoose.model('users', userSchema);