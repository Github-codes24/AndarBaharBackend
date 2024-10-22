// CardNameGenerator
const CardNameGenerator = (card) => {
  const createCard = `${card.suit}_${card.rank}.png`;
  return createCard;
};

module.exports={CardNameGenerator}
