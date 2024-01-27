const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    meals: {
      type: [],
    },
    calories: {
      type: Number,
      min: [0],
      required: true,
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

planSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("plans", planSchema);
