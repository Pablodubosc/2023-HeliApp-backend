const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 17,
    },
    caloriesBurn: {
      type: Number,
      min: [0],
      required: true,
      max: 9999,
    },
    time: {
      type: Number,
      min: [0],
      default: 0,
      max: 999999,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

exerciseSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("exercise", exerciseSchema);
