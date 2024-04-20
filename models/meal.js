const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    foods: {
      type: [
        {
          foodId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "foods",
            required: true,
          },
          weightConsumed: {
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
    hour: {
      type: String,
      match: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
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

mealSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("meals2", mealSchema);