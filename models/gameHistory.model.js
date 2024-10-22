const mongoose = require("mongoose");

const gameHistorySchema = new mongoose.Schema(
  {
    andarBaharGameHistory: { type: Array, default: [] },
  },
  { versionKey: false },
  { timestamps: true }
);

const GameHistory = mongoose.model("GameHistory", gameHistorySchema);

module.exports = { GameHistory };
