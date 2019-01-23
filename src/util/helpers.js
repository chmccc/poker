import { Card } from './deck';

// helper function to build card arrays with shorthand input
const createHand = (vals, suits) => {
  suits.forEach((char, i) => suits[i] = char.toUpperCase());
  const suitNames = { S: 'Spades', D: 'Diamonds', C: 'Clubs', H: 'Hearts' };
  const output = [];
  for (let i = 0; i < vals.length; i += 1) {
    output.push(new Card(vals[i], suitNames[suits[i]]));
  }
  return output;
}

export { createHand };