const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    foods: {
      type: [],
    },
    date: {
      type: Date,
    },
    hour: {
      type: String,
    },
    calories: {
      type: Number,
      min: [0]
    },
    carbs: {
      type: Number,
      min: [0],
      default: 0,
    },
    proteins: {
      type: Number,
      min: [0],
      default: 0,
    },
    fats: {
      type: Number,
      min: [0],
      default: 0,
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

mealSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("meals", mealSchema);
