const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const exerciseDoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    exercises: {
      type: [],
    },
    date: {
      type: Date,
    },
    hour: {
      type: String,
    },
    caloriesBurn: {
      type: Number,
      min: [0]
    },
    userId: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

exerciseDoneSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("exerciseDone", exerciseDoneSchema);
