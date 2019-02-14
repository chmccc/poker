import { Card, deck } from './deck';

// helper function to build card arrays with shorthand input
const createHand = (vals, suits) => {
  suits.forEach((char, i) => (suits[i] = char.toUpperCase()));
  const suitNames = { S: 'Spades', D: 'Diamonds', C: 'Clubs', H: 'Hearts' };
  const output = [];
  for (let i = 0; i < vals.length; i += 1) {
    output.push(new Card(vals[i], suitNames[suits[i]]));
  }
  return output;
};

// helper function which clones a hand and all cards therein, applying an optional callback to each card
const cloneHand = (hand, callback) => {
  return hand.map(card => {
    const newCard = new Card(card.value, card.suit);
    newCard.highlightColor = card.highlightColor;
    return callback ? callback(hand) : newCard;
  });
};

// helper function which deep clones a playerData object
const clonePlayerData = oldPlayerData => {
  return Object.values(oldPlayerData).reduce((playerData, playerObj) => {
    playerData[playerObj.id] = {
      ...playerObj,
      hand: cloneHand(playerObj.hand),
      options: { ...playerObj.options },
    };
    return playerData;
  }, {});
};

// determines whether a card should be highlighted (returns a highlighted copy of card if so)
// expects a Set of used card names
const highlightSelectCards = (card, used, color) => {
  if (used.has(card.displayName)) {
    const newCard = new Card(card.value, card.suit);
    newCard.highlightColor = color;
    return newCard;
  } else return card;
};

// helper function to append n new cards to tableCards array
const addToTableCards = (oldTableCards, numNewCards) => {
  return oldTableCards.concat(
    Array(numNewCards)
      .fill(null)
      .map(() => deck.dealCard())
  );
};

// returns a basic playerData object
const createBasePlayerData = () => {
  return {
    player: {
      id: 'player',
      active: true,
      hand: [],
      balance: 100,
      currentBet: 0,
      options: { Fold: false, Call: false, Deal: true, 'New Game': false, Raise: false },
    },
    ai1: {
      id: 'ai1',
      active: true,
      hand: [],
      balance: 100,
      currentBet: 0,
      options: { Fold: false, Call: false, Raise: false },
    },
    ai2: {
      id: 'ai2',
      active: true,
      hand: [],
      balance: 100,
      currentBet: 0,
      options: { Fold: false, Call: false, Raise: false },
    },
    ai3: {
      id: 'ai3',
      active: true,
      hand: [],
      balance: 100,
      currentBet: 0,
      options: { Fold: false, Call: false, Raise: false },
    },
  };
};

export {
  createHand,
  cloneHand,
  clonePlayerData,
  highlightSelectCards,
  addToTableCards,
  createBasePlayerData,
};
