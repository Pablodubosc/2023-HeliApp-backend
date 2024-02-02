const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema(
    {
        firstName:{
            type: String,            
        },
        lastName:{
            type: String
        },
        email:{
            type: String,
            unique: true
        },
        password:{
            type: String,
            select: false
        },
        sex:{
            type: String,
        },
        age:{
            type: Number,
        },
        height:{
            type: Number,
        },
        weight:{
            type: Number,
        },
        allergies: {
            type: [],
            default: [{ name: ""}],
          },
        role: {
            type: String,
            enum: ["user", "admin", "nutritionist"]
        },
        nutritionist: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
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