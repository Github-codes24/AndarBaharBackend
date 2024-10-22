// card shuffler
const shuffle = (deck) => {
    for (let i = 0; i < deck.length - 1; i++) {
      let j = Math.floor(Math.random() * (deck.length - i)) + i;
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  };

  module.exports={shuffle}