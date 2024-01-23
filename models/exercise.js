const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    caloriesBurn: {
      type: Number,
      min: [0],
      required: true,
    },
    time: {
      type: Number,
      min: [0],
      default: 0,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

exerciseSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("exercise", exerciseSchema);
