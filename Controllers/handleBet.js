// Import necessary constants and models
const { ANDAR, BAHAR } = require("../Constants/constant"); // ANDAR and BAHAR constants for game types
const { AndarBaharBet } = require("../models/gameBetModel"); // Model for handling bets in the game
const { UserMaster } = require("../models/gameuser.model"); // Model for user data
const { MainCard } = require("../models/test.model"); // Model for the main game card
 
// Maximum bet limits per match for each side
const MAX_ANDAR_BET = 5000;
const MAX_BAHAR_BET = 5000;
 
// Function to handle the user's bet
const handlebet = (userId, socket) => {
  socket.on("bet", async (data) => {
    const { betType, coins, cardId } = data; // Extracting betType, coins, and cardId from the data sent by the user
 
    try {
      // Find the user by userId
      const user = await UserMaster.findOne({ _id: userId });
      if (!user) {
        console.log({ msg: "user not found for bet" }); // Log if user is not found
        return;
      }
 
      // Check if the user has sufficient balance to place the bet
      if (user.coins <= 0 || coins <= 0 || user.coins - coins < 0) {
        socket.emit("noBet", { msg: "Insufficient Balance" }); // Emit "noBet" event if user has insufficient balance
        return;
      }
 
      // Ensure that a valid cardId is provided
      if (!cardId) {
        console.log({ msg: "cardId required" }); // Log if cardId is not provided
        return;
      }
 
      // Find the main card using the cardId
      const mainCard = await MainCard.findById(cardId);
      if (!mainCard) {
        throw new Error({ msg: "maincard not found" }); // Throw an error if the main card is not found
      }
 
      // Find or create a bet for the user
      let userbet = await AndarBaharBet.findOne({ userId });
      if (!userbet) {
        userbet = new AndarBaharBet({
          userId: userId,
          game_id: mainCard._id, // Link the bet to the main card
        });
      }
 
      const newBetAmount = parseInt(coins);
 
      // Check bet limits based on bet type
      if (betType === 0) { // ANDAR bet
        if (userbet.andarbet.betCoins + newBetAmount > MAX_ANDAR_BET) {
          socket.emit("noBet", { msg: "ANDAR bet limit exceeded. Maximum bet limit is 5000 coins." });
          return;
        }
      } else if (betType === 1) { // BAHAR bet
        if (userbet.baharbet.betCoins + newBetAmount > MAX_BAHAR_BET) {
          socket.emit("noBet", { msg: "BAHAR bet limit exceeded. Maximum bet limit is 5000 coins." });
          return;
        }
      }
 
      // Handle the bet based on the betType (ANDAR or BAHAR)
      switch (betType) {
        case 0: // ANDAR bet
          userbet.andarbet.betCoins += parseInt(coins); // Add bet amount to andarbet
          mainCard.andar_amount += parseInt(coins); // Update andar_amount on the main card
          break;
        case 1: // BAHAR bet
          userbet.baharbet.betCoins += parseInt(coins); // Add bet amount to baharbet
          mainCard.bahar_amount += parseInt(coins); // Update bahar_amount on the main card
          break;
 
        default:
          break;
      }
 
      // Deduct coins from the user's balance if a valid bet is made
      if (betType == 1 || betType == 0) {
        user.coins -= parseInt(coins);
      }
 
      // Update the main card's total bet amount
      mainCard.total = mainCard.bahar_amount + mainCard.andar_amount;
 
      // Save the changes to the main card and the user's bet
      await mainCard.save();
      await user.save();
      await userbet.save();
 
      // Emit "userDetails" event to the client with updated user information
      socket.emit("userDetails", { user });
      // console.log(user)
    } catch (error) {
      console.log({ msg: "error in bet section", error: error }); // Log any errors that occur during bet handling
    }
  });
};
 
// Function to handle updating user coins after a win
const handleUserCoins = async (gameBetType, gameId) => {
  try {
    // Find all bets for the given gameId and populate the userId field
    let users = await AndarBaharBet.find({
      game_id: gameId,
    })
    console.log("line90", gameId, users)
 
    // If no users are found, log a message and return
    if (users.length <= 0) {
      console.log({ msgline93: "user not found is not no" });
      return;
    }
 
    // Loop through each user and update their coins based on the bet type (ANDAR or BAHAR)
    for (const user of users) {
      const gameBetCoins =
        gameBetType == "andarbet"
          ? user.andarbet.betCoins
          : user.baharbet.betCoins;
 
      // Calculate the updated coin balance
      const usernote = user.userId.coins
      console.log(usernote, "108")
 
      const updatedCoins = (user.userId.coins + gameBetCoins * 1.98).toFixed(2);
      console.log(updatedCoins, "108")
 
      // Update the user's coin balance in the database
      await UserMaster.updateOne(
        { _id: user.userId._id }, // Assuming the user's ID is stored in _id field
        { $set: { coins: updatedCoins } }
      );
 
      // Reset the bet coins to 0 after the win is processed
      user.andarbet.betCoins = 0;
      user.baharbet.betCoins = 0;
 
      // Save the user's updated bet information
      await user.save();
    }
  } catch (error) {
    console.log(error); // Log any errors that occur during coin handling
  }
};
 
// Function to handle the bet win logic based on the winning type (ANDAR or BAHAR)
const betWinHandler = async (gameId) => {
  console.log("lien 128", gameId)
  try {
    // Find the main card using the game,Id
    const mainCard = await MainCard.findById(gameId);
 
    // If the main card's win status is ANDAR, handle the ANDAR bet wins
    if (mainCard.winstatus == ANDAR) {
      handleUserCoins("andarbet", gameId);
    }
    // If the main card's win status is BAHAR, handle the BAHAR bet wins
    else if (mainCard.winstatus == BAHAR) {
      handleUserCoins("baharbet", gameId);
    }
  } catch (error) {
    console.log("error in betwin handler", error); // Log any errors that occur during bet win handling
  }
};

console.log("hello testing")
 
// Export the functions to be used in other parts of the application
module.exports = { handlebet, betWinHandler };