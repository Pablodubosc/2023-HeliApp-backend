const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 17,
    },
    suggestions: {
      type: [],
      required: true,
      validate: {
        validator: function (array) {
          return array.length > 0;
        },
        message: "El array debe contener al menos un elemento.",
      },
    },
    planType:{
      type: String,
      enum: ["Calories", "Fats", "Proteins", "Carbs", "Calories Burn"],
      validate: {
        validator: function (option) {
          return ["Calories", "Fats", "Proteins", "Carbs", "Calories Burn"].includes(option);
        },
        message: "Invalid type of goal",
      },
      required: true,
  },
    planObjetive: {
      type: Number,
      min: [0],
      required: true,
      max: 999999,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.startDate <= value;
        },
        message: (props) =>
          `La fecha de fin debe ser mayor o igual a la fecha de inicio.`,
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

planSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("plans", planSchema);
