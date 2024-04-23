const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const waterGlassSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

waterGlassSchema.plugin(mongooseDelete, { overrideMethods: "all" });
module.exports = mongoose.model("waterGlass", waterGlassSchema);