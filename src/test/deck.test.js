import { Deck, Card } from '../util/deck.js';

describe('deck module tests', () => {
  const deck = new Deck();
  test('dealCard should return a card taken from the deck', () => {
    expect(deck.dealCard()).toBeInstanceOf(Card);
    expect(deck.remainingCards).toEqual(51);
  });

  test('reset method should reset the deck to 52 cards', () => {
    for (let i = 0; i < 5; i++) deck.dealCard();
    deck.reset();
    expect(deck.remainingCards).toEqual(52);
    expect(deck.deck).toHaveLength(13);
    for (let cardData of deck.deck) expect(cardData.suits).toHaveLength(4);
  })

  test('dealCard method should not be able to deal more than 52 cards', () => {
    for (let i = 0; i < 52; i++) {
      deck.dealCard();
    }
    expect(() => deck.dealCard()).toThrow();
  })
})