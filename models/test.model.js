const mongoose = require("mongoose");

const MainCardSchema = new mongoose.Schema(
  {
    main_card: String,
    andar_amount: Number,
    bahar_amount: Number,
    total: Number,
    baharcards: Array,
    andarcards: Array,
    winstatus: String,
  },
  { versionKey: false }
);

const MainCard = mongoose.model("MainCard", MainCardSchema);

module.exports = { MainCard };
