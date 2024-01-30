const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    suggestions: {
      type: [],
    },
    planType:{
      type: String,
      required: true
    },
    planObjetive: {
      type: Number,
      min: [0],
      required: true
    },
    startDate:{
      type: Date,
      required: true
    },
    endDate:{
      type: Date,
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
