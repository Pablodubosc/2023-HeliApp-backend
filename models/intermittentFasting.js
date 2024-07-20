const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const intermittentFastingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    startDateTime: {
      type: Date,
      required: true,
    },
    endDateTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.startDateTime <= value;
        },
        message: (props) =>
          `La fecha de fin debe ser mayor o igual a la fecha de inicio.`,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

intermittentFastingSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model(
  "intermittentFasting",
  intermittentFastingSchema
);