const cardNames = ['', 'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace'];

const suitEmojis = {
  'Clubs': '♣️',
  'Hearts': '♥️',
  'Diamonds': '♦️',
  'Spades': '♠️',
}

let baseDeck = [
  {value: 2, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']},
  {value: 3, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']},
  {value: 4, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']},
  {value: 5, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']},
  {value: 6, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']}, 
  {value: 7, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']},
  {value: 8, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']},
  {value: 9, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']},
  {value: 10, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']}, // ten
  {value: 11, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']}, // jack
  {value: 12, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']}, // queen
  {value: 13, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']}, // king
  {value: 14, suits: ['Hearts', 'Clubs', 'Diamonds', 'Spades']}, // ace
];

const cloneDeck = (deck) => deck.map(({ value, suits }) => ({ value, suits: suits.map(e => e) }));

const getShort = (val) => {
  if (val === 1 || val === 14) return 'A';
  if (val === 13) return 'K';
  if (val === 12) return 'Q';
  if (val === 11) return 'J';
  return val.toString();
}

class Card {
  constructor(val, suit) {
    this.value = val === 1 ? 14 : val;
    this.suit = suit;
    this.suitEmoji = suitEmojis[suit];
    this.color = (suit === 'Hearts' || suit === 'Diamonds') ? 'red' : 'black';
    this.isAce = val === 14;
    this.displayName = `${cardNames[val]} of ${suit}`;
    this.short = getShort(val);
    this.highlight = false;
  }
  
}

class Deck {
  constructor() {
    this.deck = cloneDeck(baseDeck);
    this.remainingCards = 52;
  }
  
  dealCard() {
    if (this.deck.length === 0) throw new Error('Cannot deal more than 52 cards from a this.deck!');
    const randomCardIndex = Math.floor(Math.random() * this.deck.length);
    const { value, suits } = this.deck[randomCardIndex];
    const randomSuitIndex = Math.floor(Math.random() * suits.length);
    const suit = suits[randomSuitIndex];
    suits.splice(randomSuitIndex, 1);
    if (!suits.length) this.deck.splice(randomCardIndex, 1);
    this.remainingCards -= 1;
    return new Card(value, suit);
  }
  
  reset() { 
    this.deck = cloneDeck(baseDeck);
    this.remainingCards = 52;
  };

}

export { Deck, Card };


