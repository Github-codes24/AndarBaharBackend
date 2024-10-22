const { andarBaharGameHistory, ANDAR, BAHAR } = require("../Constants/constant");
const { MainCard } = require("../models/test.model");
const { CardNameGenerator } = require("../utils/CardNameGenerator");
const { gameHistoryData } = require("../utils/gameHistoryData");
const {
  randomNumberGenerator1,
  randomNumberGenerator2,
  randomNumberGenerator3,
} = require("../utils/randomNumberGenerators");
const { shuffle } = require("../utils/shuffle");

const cardID = { cardID: null };
let deck = [];
let randomWinCard;

const MainCardGenerator = async () => {
  const suits = ["hearts", "diamonds", "clubs", "spades"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "jack",
    "queen",
    "king",
    "ace",
  ];
  try {
    deck = [];
    for (const rank of ranks) {
      for (const suit of suits) {
        const card = { rank, suit };
        deck.push(card);
      }
    }
    //shuffle deck
    shuffle(deck);

    // Draw a random card
    const drawnCard = deck.pop();
    const randomCard = CardNameGenerator(drawnCard);
    let mainCard = new MainCard({
      main_card: randomCard,
      andar_amount: 0,
      bahar_amount: 0,
      total: 0,
      baharcards: [],
      andarcards: [],
      winstatus: "",
    });
    let cardCreated = await mainCard.save();
    cardID.cardID = cardCreated._id;
    // OtherCards
    const OtherCards = deck.filter((card, index) => {
      if (card.rank == drawnCard.rank && card.suit !== drawnCard.suit) {
        let cardl = deck.splice(index, 1);
        return cardl;
      }
    });

    if (OtherCards.length > 0) {
      const randomCardIndex = randomNumberGenerator2(OtherCards);
      const randomWinCardObj = OtherCards[randomCardIndex];

      randomWinCard = CardNameGenerator(randomWinCardObj);
    }
  } catch (error) {
    console.log(error);
  }
};

// gameCardHandler

const gameCardHandler = async (gameCardId) => {

  try {
    if (deck.length > 0) {
      const andarcards = [];
      const baharcards = [];
      let randomNumber = randomNumberGenerator1();

      const mainCard = await MainCard.findById(gameCardId);

      if (!mainCard) {
        console.log({ msg: "maincard not found" });
      }
      for (let i = 0; i < randomNumber; i++) {
        const drawcard1 = deck.splice(i, 1);
        const drawcard2 = deck.splice(i, 1);
        let card1 = CardNameGenerator(drawcard1[0]);
        let card2 = CardNameGenerator(drawcard2[0]);
        andarcards.push(card1);
        baharcards.push(card2);
      }

      if (mainCard.andar_amount < mainCard.bahar_amount) {
        andarcards.pop();
        andarcards.push(randomWinCard);
        mainCard.winstatus = ANDAR;
      } else if (mainCard.andar_amount > mainCard.bahar_amount) {
        baharcards.push(randomWinCard);
        mainCard.winstatus = BAHAR;
      } else if (mainCard.andar == mainCard.bahar) {
        const randomWinNumber = randomNumberGenerator3();
        if (randomWinNumber === 1) {
          andarcards.pop();
          andarcards.push(randomWinCard);
          mainCard.winstatus = ANDAR;
        }else if(randomWinNumber === 2){
          baharcards.push(randomWinCard);
          mainCard.winstatus = BAHAR;
        }
      }

      mainCard.andarcards = andarcards;
      mainCard.baharcards = baharcards;
      // history added
      let winValue = mainCard.winstatus == ANDAR ? "A" : "B";
      gameHistoryData(winValue, andarBaharGameHistory);

      await mainCard.save();
    }
  } catch (error) {
    console.log({ msg: "error in gamehandlerfunction-", error: error });
  }
};

module.exports = { MainCardGenerator, gameCardHandler, cardID };
