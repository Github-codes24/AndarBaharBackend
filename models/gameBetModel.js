const mongoose = require("mongoose");

const gameBetSchema = new mongoose.Schema(
  {
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: "UserMaster",default:null },
    game_id: { type: mongoose.Schema.Types.ObjectId, ref: "MainCard",default:null },
    andarbet: {
      betCoins: { type: Number, default: 0 },
    },
    baharbet: {
      betCoins: { type: Number, default: 0 },
    },
  },
  { versionKey: false },
  { timestamps: true }
);

const AndarBaharBet = mongoose.model("AndarBaharBet", gameBetSchema);

module.exports = { AndarBaharBet };
