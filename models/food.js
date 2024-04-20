const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      min: [0],
      required: true,
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
    weight: {
      type: Number,
      min: [0],
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

foodSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("foods", foodSchema);