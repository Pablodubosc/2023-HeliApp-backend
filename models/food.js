const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 17,
    },
    calories: {
      type: Number,
      min: [0],
      required: true,
      max: 9999,
    },
    carbs: {
      type: Number,
      min: [0],
      default: 0,
      max: 9999,
    },
    proteins: {
      type: Number,
      min: [0],
      default: 0,
      max: 9999,
    },
    fats: {
      type: Number,
      min: [0],
      default: 0,
      max: 9999,
    },
    weight: {
      type: Number,
      min: [0],
      required: true,
      max: 999999,
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