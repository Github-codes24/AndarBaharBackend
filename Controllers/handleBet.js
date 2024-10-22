const { ANDAR, BAHAR } = require("../Constants/constant");
const { AndarBaharBet } = require("../models/gameBetModel");
const { UserMaster } = require("../models/gameuser.model");
const { MainCard } = require("../models/test.model");

const handlebet = (userId, socket) => {
  socket.on("bet", async (data) => {
    const { betType, coins, cardId } = data;
    try {
      const user = await UserMaster.findOne({ _id: userId });
      if (!user) {
        console.log({ msg: "user not found" });
        return;
      }
      if (user.coins <= 0 || coins <= 0 || user.coins - coins < 0) {
        socket.emit("noBet", { msg: "Insufficient Balance" });
        return;
      }

      if (!cardId) {
        console.log({ msg: "cardId required" });
        return;
      }

      const mainCard = await MainCard.findById(cardId);
      if (!mainCard) {
        throw new Error({ msg: "maincard not found" });
      }

      let userbet = await AndarBaharBet.findOne({ userId });
      if (!userbet) {
        userbet = new AndarBaharBet({
          userId: userId,
          game_id: mainCard._id,
        });
      }
      switch (betType) {
        case 0:
          userbet.andarbet.betCoins += parseInt(coins);
          mainCard.andar_amount += parseInt(coins);
          break;
        case 1:
          userbet.baharbet.betCoins += parseInt(coins);
          mainCard.bahar_amount += parseInt(coins);
          break;

        default:
          break;
      }
      if (betType == 1 || betType == 0) {
        user.coins -= parseInt(coins);
      }
      // add main card id to user ref
      userbet.game_id = mainCard._id;

      mainCard.total = mainCard.bahar_amount + mainCard.andar_amount;
      await mainCard.save();

      await user.save();
      await userbet.save();
      socket.emit("userDetails", { user });
    } catch (error) {
      console.log({ msg: "error in bet section", error: error });
    }
  });
};


const handleUserCoins = async (gameBetType, gameId) => {
  try {
    let users = await AndarBaharBet.find({
      game_id: gameId,
    }).populate("userId");

    if (users.length <= 0) {
      console.log({ msg: "user not found" });
      return;
    }
    for (const user of users) {
      const gameBetCoins =
        gameBetType == "andarbet"
          ? user.andarbet.betCoins
          : user.baharbet.betCoins;

      const updatedCoins = (user.userId.coins + gameBetCoins * 1.98).toFixed(2);

      await UserMaster.updateOne(
        { _id: user.userId._id }, // Assuming the user's ID is stored in _id field
        { $set: { coins: updatedCoins } }
      );
      user.andarbet.betCoins = 0;
      user.baharbet.betCoins = 0;

      await user.save();
    }
  } catch (error) {
    console.log(error);
  }
};

const betWinHandler = async (gameId) => {
  try {
    const mainCard = await MainCard.findById(gameId);
    if (mainCard.winstatus == ANDAR) {
      handleUserCoins("andarbet", gameId);
    } else if (mainCard.winstatus == BAHAR) {
      handleUserCoins("baharbet", gameId);
    }
  } catch (error) {
    console.log("error in betwin handler", error);
  }
};

module.exports = { handlebet, betWinHandler };
