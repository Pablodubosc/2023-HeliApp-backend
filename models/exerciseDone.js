const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const exerciseDoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    exercises: {
      type: [
        {
          exerciseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "exercise",
            required: true,
          },
          timeWasted: {
            type: Number,
            min: [0],
            default: 0,
            required: true,
          },
        },
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
      required: true,
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

exerciseDoneSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("exerciseDone", exerciseDoneSchema);
