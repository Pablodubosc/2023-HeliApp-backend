const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema(
    {
        firstName:{
            type: String,
            required: true,            
        },
        lastName:{
            type: String,
            required: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
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
        },
        height:{
            type: Number,
            required: true,
        },
        weight:{
            type: Number,
            required: true,
        },
        allergies: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "foods"
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