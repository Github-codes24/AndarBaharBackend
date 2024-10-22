const mongoose = require("mongoose");

const userMasterSchema = new mongoose.Schema(
  {
    coins: { type: Number},
    // game_id: { type: mongoose.Schema.Types.ObjectId, ref: "MainCard" },
    // andarbet: {
    //   bet_status: { type: String, default: null },
    //   betCoins: { type: Number, default: 0 },
    // },
    // baharbet: {
    //   bet_status: { type: String, default: null },
    //   betCoins: { type: Number, default: 0 },
    // },
  },
  { versionKey: false },
  { timestamps: true }
);

const UserMaster = mongoose.model("UserMaster", userMasterSchema);

module.exports = { UserMaster };
