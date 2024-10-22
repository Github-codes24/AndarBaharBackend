const randomNumberGenerator1 = () => {
  const min = 2;
  const max = 6;
  return Math.floor(Math.random() * (max - min) + 1) + min;
};

const randomNumberGenerator2 = (OtherCards) => {
  return Math.floor(Math.random() * OtherCards.length);
};
const randomNumberGenerator3 = () => {
  return Math.ceil(Math.random() * 2);
};

module.exports = {
  randomNumberGenerator1,
  randomNumberGenerator2,
  randomNumberGenerator3
};
