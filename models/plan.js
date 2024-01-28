const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    suggestions: {
      type: [],
    },
    planType:{
      type: String,
      requiere: true
    },
    planObjetive: {
      type: Number,
      min: [0],
      required: true,
    },
    startDate:{
      type: Date,
      requiere: true
    },
    endDate:{
        type: Date,
        requiere: true
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
