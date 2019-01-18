import { Card, Deck } from '../util/deck';
import { getScore, getScoreObject, getWinner } from '../util/engine.js';

const stressMultiplier = 500; // determines loop size for stress tests

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

describe('getScoreObject tests', () => {
  let testScoreObj = getScoreObject(createHand([14,12,13,11,10],['s','s','s','s','s']));

  test('should throw error if not provided an array of correct size', () => {
    expect(() => getScoreObject(createHand([2,3,4,5,6,7,8], ['c','c','c','c','c','c','c']))).toThrow();
  }) 
  
  test('should return a score object from a valid hand', () => {
    expect(testScoreObj).toMatchObject({
      score: expect.any(Number),
      type: expect.any(String),
      highHandCards: expect.any(Array),
      cardsUsed: expect.any(Array)
    });
  });

  test('score object should contain array of cards used', () => {
    expect(testScoreObj.cardsUsed).toEqual(expect.arrayContaining([new Card(10, 'Spades')]));
    expect(testScoreObj.cardsUsed.length).toEqual(5);
  });

  test('should properly analyze a straight flush', () => {
    let sFTestScoreObj = getScoreObject(createHand([14,12,13,11,10],['s','s','s','s','s']));
    expect(sFTestScoreObj.score).toEqual(8);
    expect(sFTestScoreObj.highHandCards).toEqual(expect.arrayContaining([new Card(14, 'Spades')]));
    expect(sFTestScoreObj.highHandCards).toHaveLength(1);
    expect(sFTestScoreObj.type).toEqual('a straight flush');
    expect(sFTestScoreObj.cardsUsed).toHaveLength(5);
    sFTestScoreObj = getScoreObject(createHand([3,4,5,6,7], ['h','h','h','h','h']));
    expect(sFTestScoreObj.score).toEqual(8);
    // ensure low ace is not counted as the high card in a straight
    sFTestScoreObj = getScoreObject(createHand([2,3,4,5,14], ['h','h','h','h','h']));
    expect(sFTestScoreObj.highHandCards).toEqual(expect.arrayContaining([new Card(5, 'Hearts')]));
    expect(sFTestScoreObj.highHandCards).toHaveLength(1);
    expect(sFTestScoreObj.highHandCards[0].value).toEqual(5);
  });

  test('should recognize an ace has value 1 or 14', () => {
    let aceTestScoreObj = getScoreObject(createHand([14,2,3,4,5],['s','s','s','s','s']));
    expect(aceTestScoreObj.score).toEqual(8);
    aceTestScoreObj = getScoreObject(createHand([14,12,13,11,10],['s','s','s','s','s']));
    expect(aceTestScoreObj.score).toEqual(8);
  });

  test('should properly analyze four of a kind', () => {
    const fourTestScoreObj = getScoreObject(createHand([4,4,4,4,1], ['h','d','c','s','h']));
    expect(fourTestScoreObj.score).toEqual(7);
    expect(fourTestScoreObj.highHandCards).toEqual(expect.arrayContaining([new Card(4, 'Hearts')]));
    expect(fourTestScoreObj.highHandCards).toHaveLength(1);
    expect(fourTestScoreObj.type).toEqual('four of a kind');
    expect(fourTestScoreObj.cardsUsed).not.toEqual(expect.arrayContaining([new Card(1, 'Hearts')])); // the unused card should not be in cardsUsed
  });

  test('should properly analyze a full house', () => {
    let fullTestScoreObj = getScoreObject(createHand([12,13,12,13,12], ['s','c','d','h','s']));
    expect(fullTestScoreObj.score).toEqual(6);
    expect(fullTestScoreObj.highHandCards[0].value).toEqual(12);
    expect(fullTestScoreObj.highHandCards).toHaveLength(2);
    expect(fullTestScoreObj.type).toEqual('a full house');
    expect(fullTestScoreObj.cardsUsed).toHaveLength(5);
    fullTestScoreObj = getScoreObject(createHand([3,3,3,2,2], ['s','c','d','h','s']));
    expect(fullTestScoreObj.score).toEqual(6);
  });

  test('should properly analyze a straight', () => {
    let straightTestScoreObj = getScoreObject(createHand([9,8,7,6,5], ['s','c','d','h','s']));
    expect(straightTestScoreObj.score).toEqual(5);
    expect(straightTestScoreObj.highHandCards).toEqual(expect.arrayContaining([new Card(9, 'Spades')]));
    expect(straightTestScoreObj.highHandCards).toHaveLength(1);
    expect(straightTestScoreObj.type).toEqual('a straight');
    expect(straightTestScoreObj.cardsUsed).toHaveLength(5);
    straightTestScoreObj = getScoreObject(createHand([2,3,4,5,14], ['s','c','d','h','s']));
    expect(straightTestScoreObj.score).toEqual(5);
  });

  test('should properly analyze a flush', () => {
    let flushTestScoreObj = getScoreObject(createHand([9,10,7,4,5], ['c','c','c','c','c']));
    expect(flushTestScoreObj.score).toEqual(4);
    expect(flushTestScoreObj.highHandCards).toEqual(expect.arrayContaining([new Card(9, 'Clubs')]));
    expect(flushTestScoreObj.highHandCards).toHaveLength(5);
    expect(flushTestScoreObj.highHandCards[0]).toEqual(new Card(10, 'Clubs'));
    expect(flushTestScoreObj.highHandCards[4]).toEqual(new Card(4, 'Clubs'));
    expect(flushTestScoreObj.type).toEqual('a flush');
    expect(flushTestScoreObj.cardsUsed).toHaveLength(5);
    flushTestScoreObj = getScoreObject(createHand([11,12,13,14,4], ['h','h','h','h','h']));
    expect(flushTestScoreObj.score).toEqual(4);
  });

  test('should properly analyze three of a kind', () => {
    let threeTestScoreObj = getScoreObject(createHand([9,9,9,4,5], ['c','h','s','c','c']));
    expect(threeTestScoreObj.score).toEqual(3);
    expect(threeTestScoreObj.highHandCards).toEqual(expect.arrayContaining([new Card(9, 'Clubs')]));
    expect(threeTestScoreObj.highHandCards).toHaveLength(1);
    expect(threeTestScoreObj.type).toEqual('three of a kind');
    expect(threeTestScoreObj.cardsUsed).toHaveLength(3);
    expect(threeTestScoreObj.cardsUsed).not.toEqual(expect.arrayContaining([new Card(4, 'Clubs'), new Card(5, 'Clubs')])); // the unused cards should not be in cardsUsed
    threeTestScoreObj = getScoreObject(createHand([4,2,12,12,12], ['h','c','s','d','c']));
    expect(threeTestScoreObj.score).toEqual(3);
  });

  test('should properly analyze two pair', () => {
    let twoPairTestScoreObj = getScoreObject(createHand([8,8,4,4,5], ['c','h','s','c','c']));
    expect(twoPairTestScoreObj.score).toEqual(2);
    expect(twoPairTestScoreObj.highHandCards[0].value).toEqual(8);
    expect(twoPairTestScoreObj.highHandCards[1].value).toEqual(4);
    expect(twoPairTestScoreObj.highHandCards).toHaveLength(2);
    expect(twoPairTestScoreObj.type).toEqual('two pair');
    expect(twoPairTestScoreObj.cardsUsed).toHaveLength(4);
    expect(twoPairTestScoreObj.cardsUsed).not.toEqual(expect.arrayContaining([new Card(5, 'Clubs')])); // the unused card should not be in cardsUsed
    twoPairTestScoreObj = getScoreObject(createHand([3,2,11,11,3], ['h','c','s','d','c']));
    expect(twoPairTestScoreObj.score).toEqual(2);
  });

  test('should properly analyze a pair', () => {
    let pairTestScoreObj = getScoreObject(createHand([6,6,3,4,5], ['c','h','s','c','c']));
    expect(pairTestScoreObj.score).toEqual(1);
    expect(pairTestScoreObj.highHandCards[0].value).toEqual(6);
    expect(pairTestScoreObj.highHandCards).toHaveLength(1);
    expect(pairTestScoreObj.type).toEqual('a pair');
    expect(pairTestScoreObj.cardsUsed).toHaveLength(2);
    expect(pairTestScoreObj.cardsUsed).not.toEqual(expect.arrayContaining([new Card(3, 'Spades'), new Card(4, 'Clubs'), new Card(5, 'Clubs')])); // the unused card should not be in cardsUsed
    pairTestScoreObj = getScoreObject(createHand([11,14,2,7,14], ['h','c','s','d','c']));
    expect(pairTestScoreObj.score).toEqual(1);
  });

  test('should return a 0-score object on a hand with high card only', () => {
    let highCardTestScoreObj = getScoreObject(createHand([6,9,3,4,5], ['c','h','s','c','c']));
    expect(highCardTestScoreObj.score).toEqual(0)
    expect(highCardTestScoreObj.highHandCards[0].value).toEqual(9);
    expect(highCardTestScoreObj.highHandCards).toHaveLength(5);
    expect(highCardTestScoreObj.type).toEqual('a high card');
    expect(highCardTestScoreObj.cardsUsed).toHaveLength(1);
    highCardTestScoreObj = getScoreObject(createHand([11,14,3,7,12], ['h','c','s','d','c']));
    expect(highCardTestScoreObj.score).toEqual(0);
  });

});

const deck = new Deck();

describe('getScore basic tests: ', () => {
  let testScoreObj = getScore(createHand([11,2], ['h','d']), createHand([3,4,5,6,9], ['d','d','s','c','d']), 'test');

  test(`should return a score object with correct keys and value types (${stressMultiplier}x stress test)`, () => {
    for (let i = 0; i < 500; i++) {
      deck.reset();
      const holeCards = [deck.dealCard(), deck.dealCard()];
      const tableCards = new Array(5).fill(null).map(e => deck.dealCard());
      const stressScoreObject = getScore(holeCards, tableCards, 'player');
      expect(stressScoreObject).toMatchObject({
        type: expect.any(String),
        score: expect.any(Number),
        cardsUsed: expect.any(Array),
        highHandCards: expect.any(Array),
        owner: expect.any(String),
      });
    }
  })
  
  test('should return a score object from an array of 2 cards and an array of 5 cards', () => {
    expect(testScoreObj.score).toEqual(5);
    expect(testScoreObj.highHandCards[0].value).toEqual(6);
    expect(testScoreObj.cardsUsed).toEqual(expect.arrayContaining([new Card(6, 'Clubs'), new Card(5, 'Spades'), new Card(4, 'Diamonds'), new Card(3, 'Diamonds'), new Card(2, 'Diamonds')]));
  });
  
  
});

describe('getScore kicker tests', () => {
  let testScoreObj;

});

describe('comprehensive scoring tests for getScore:', () => {
  let testScoreObj = getScore(createHand([4,4], ['s','s']), createHand([4,4,3,3,3], ['s','c','s','c','d']), 'test');
  
  test('should choose 4 of a kind over 3 of a kind or full house', () => {
    expect(testScoreObj.score).toEqual(7);
  });

  test('should choose the best 2 of 3 pairs', () => {
    testScoreObj = getScore(createHand([12,12], ['s','d']), createHand([2,11,2,7,7], ['s','c','h','c','d']), 'test');
    expect(testScoreObj.score).toEqual(2);
    expect(testScoreObj.highHandCards).toHaveLength(2);
    expect(testScoreObj.highHandCards[0].value).toEqual(12);
    expect(testScoreObj.highHandCards[1].value).toEqual(7);
  });

  test('should choose the highest straight', () => {
    testScoreObj = getScore(createHand([2,3], ['s','d']), createHand([4,5,6,7,8], ['s','c','h','c','d']), 'test');
    expect(testScoreObj.score).toEqual(5);
    expect(testScoreObj.highHandCards).toHaveLength(1);
    expect(testScoreObj.highHandCards[0].value).toEqual(8);

  });

  test('should choose a straight over a flush', () => {
    testScoreObj = getScore(createHand([14,3], ['s','s']), createHand([4,5,6,7,9], ['s','d','s','s','s']), 'test');
    expect(testScoreObj.score).toEqual(5);
    expect(testScoreObj.highHandCards).toHaveLength(1);
    expect(testScoreObj.highHandCards[0].value).toEqual(7);
  });

  test('should choose a flush over 3 of a kind', () => {
    testScoreObj = getScore(createHand([11,3], ['s','d']), createHand([3,3,12,7,4], ['s','h','s','s','s']), 'test');
    expect(testScoreObj.score).toEqual(4);
    expect(testScoreObj.highHandCards).toHaveLength(5);
    expect(testScoreObj.highHandCards[0].value).toEqual(12);
  });
  
  test('should choose a straight flush over a higher-number straight', () => {
    testScoreObj = getScore(createHand([13,8], ['s','d']), createHand([13,12,11,10,9], ['h','d','d','d','d']), 'test');
    expect(testScoreObj.score).toEqual(8);
    expect(testScoreObj.highHandCards).toHaveLength(1);
    expect(testScoreObj.highHandCards[0].value).toEqual(12);
  });

});

let playerData, tableCards;

describe('getWinner tests', () => {

  beforeEach(() => {
    deck.reset();
    playerData = {
      player: { id: 'player', active: true, hand: [] },
      ai1: { id: 'ai1', active: true, hand: [] },
      ai2: { id: 'ai2', active: true, hand: [] },
      ai3: { id: 'ai3', active: true, hand: [] },
    };
    tableCards = [];
  })

  test("should return active player's score object when only one player is active (not folded)", () => {
    playerData.ai1.active = playerData.ai2.active = playerData.ai3.active = false;
    playerData.player.hand = createHand([2, 2], ['h', 's']);
    tableCards = createHand([3, 4, 6, 8, 8], ['h','c','s','s','d']);
    const testScoreObj = getWinner(playerData, tableCards);
    expect(testScoreObj).toMatchObject({
      type: expect.any(String),
      score: expect.any(Number),
      cardsUsed: expect.any(Array),
      highHandCards: expect.any(Array),
      owner: expect.any(String),
    });
    expect(testScoreObj.owner).toEqual('player');
  });

  test("should determine a winner between 2 players with very different hands", () => {
    playerData.ai1.active = playerData.ai2.active = false;

    playerData.player.hand = createHand([2, 2], ['h', 's']); // full house 2s over 8s
    playerData.ai3.hand = createHand([8, 6], ['h', 'c']); // 3 of a kind
    tableCards = createHand([2, 3, 5, 8, 8], ['d','c','s','s','d']);
    let testScoreObj = getWinner(playerData, tableCards);
    expect(testScoreObj.owner).toEqual('player');

    playerData.player.hand = createHand([2, 2], ['h', 's']); // 4 of a kind
    playerData.ai3.hand = createHand([8, 6], ['h', 'c']); // 2 pair
    tableCards = createHand([2, 2, 10, 8, 10], ['d','c','s','s','d']);
    testScoreObj = getWinner(playerData, tableCards);
    expect(testScoreObj.owner).toEqual('player');
  });

  test("should determine a winner between 2 players with similar hands", () => {
    playerData.ai1.active = playerData.ai2.active = false;

    playerData.player.hand = createHand([4, 2], ['h', 's']); // 9-high straight
    playerData.ai3.hand = createHand([8, 10], ['h', 'c']); // 10-high straight
    tableCards = createHand([5, 6, 7, 8, 9], ['d','c','s','s','d']);
    let testScoreObj = getWinner(playerData, tableCards);
    expect(testScoreObj.owner).toEqual('ai3');

    playerData.player.hand = createHand([13, 12], ['h', 's']); // full house Aces over Kings
    playerData.ai3.hand = createHand([12, 12], ['h', 'c']); // full house Aces over Queens
    tableCards = createHand([14, 14, 14, 13, 4], ['d','c','s','s','d']);
    testScoreObj = getWinner(playerData, tableCards);
    expect(testScoreObj.owner).toEqual('player');

    playerData.player.hand = createHand([8, 7], ['h', 's']); // 2 pair 8s over 7s
    playerData.ai3.hand = createHand([8, 5], ['c', 'c']); // 2 pair 8s over 5s
    tableCards = createHand([8, 7, 5, 13, 4], ['d','c','s','s','d']);
    testScoreObj = getWinner(playerData, tableCards);
    expect(testScoreObj.owner).toEqual('player');

    playerData.player.hand = createHand([9, 2], ['c', 'c']); // flush king-high (high 9 in hole)
    playerData.ai3.hand = createHand([12, 5], ['c', 'c']); // flush king-high (high queen in hole)
    tableCards = createHand([3, 7, 13, 13, 4], ['c','c','c','s','d']);
    testScoreObj = getWinner(playerData, tableCards);
    expect(testScoreObj.owner).toEqual('ai3');
  });

  test("should determine a winner between 3 players", () => {
    playerData.ai1.active = false;

    // far off
    playerData.player.hand = createHand([8, 8], ['h', 's']); // 4 of a kind
    playerData.ai2.hand = createHand([4, 13], ['h', 'c']); // high card
    playerData.ai3.hand = createHand([6, 6], ['h', 'c']); // 3 of a kind
    tableCards = createHand([2, 3, 6, 8, 8], ['d','c','s','c','d']);
    let testScoreObj = getWinner(playerData, tableCards);
    expect(testScoreObj.owner).toEqual('player');

    // close
    playerData.player.hand = createHand([11, 11], ['h', 'c']); // 2 pair Queens over Jacks
    playerData.ai2.hand = createHand([10, 5], ['h', 'c']); // 2 pair Queens over 10s
    playerData.ai3.hand = createHand([13, 4], ['h', 's']); // 2 pair Kings over Queens
    tableCards = createHand([2, 10, 13, 12, 12], ['d','c','s','s','d']);
    testScoreObj = getWinner(playerData, tableCards);
    expect(testScoreObj.owner).toEqual('ai3');
  })

  test("should determine a winner between 4 players", () => {
    
    playerData.player.hand = createHand([9, 9], ['h', 'c']); // 2 pair Queens over 9s
    playerData.ai1.hand = createHand([11, 11], ['h', 'c']); // 2 pair Queens over Jacks
    playerData.ai2.hand = createHand([10, 5], ['h', 'c']); // 2 pair Queens over 10s
    playerData.ai3.hand = createHand([13, 4], ['h', 's']); // 2 pair Kings over Queens
    tableCards = createHand([2, 10, 13, 12, 12], ['d','c','s','s','d']);
    const testScoreObj = getWinner(playerData, tableCards);
    expect(testScoreObj.owner).toEqual('ai3');
  })

  // will not work until kicker logic is in place
  xtest(`should always pick a winner (${stressMultiplier}x stress test)`, () => {
    for (let i = 0; i < stressMultiplier; i++) {
      deck.reset();
      playerData.player.hand = [deck.dealCard(), deck.dealCard()];
      playerData.ai1.hand = [deck.dealCard(), deck.dealCard()];
      playerData.ai2.hand = [deck.dealCard(), deck.dealCard()];
      playerData.ai3.hand = [deck.dealCard(), deck.dealCard()];
      const tableCards = new Array(5).fill(null).map(e => deck.dealCard());
      const stressScoreObject = getWinner(playerData, tableCards);
      expect(stressScoreObject).toMatchObject({
        type: expect.any(String),
        score: expect.any(Number),
        cardsUsed: expect.any(Array),
        highHandCards: expect.any(Array),
        owner: expect.any(String),
      });
    }
  })

});