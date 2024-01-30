const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const exerciseDoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    exercises: {
      type: [
        { type: mongoose.Schema.Types.Mixed, ref: "exercise", required: true },
      ],
      required: true,
      validate: {
        validator: function (array) {
          return array.length > 0;
        },
        message: "El array debe contener al menos un elemento.",
      },
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
