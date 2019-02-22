import { Card, Deck } from '../../util/deck';
import { createHand } from '../../util/helpers';
import { getWinner } from '../../util/engine/score';
require('dotenv').config();

const stressMultiplier = process.env.STRESS_TEST_MULT; // determines loop size for stress tests

const deck = new Deck();

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
  });

  test("should return active player's score object when only one player is active (not folded)", () => {
    playerData.ai1.active = playerData.ai2.active = playerData.ai3.active = false;
    playerData.player.hand = createHand([2, 2], ['h', 's']);
    tableCards = createHand([3, 4, 6, 8, 8], ['h', 'c', 's', 's', 'd']);
    const gameResult = getWinner(playerData, tableCards);
    expect(gameResult).toMatchObject({
      error: expect.any(Boolean),
      kickerCardTie: expect.any(Boolean),
      notify: expect.any(String),
      potSplit: expect.any(Boolean),
      winners: expect.any(Array),
    });
    expect(gameResult.winners[0]).toMatchObject({
      type: expect.any(String),
      score: expect.any(Number),
      cardsUsed: expect.any(Array),
      highHandCards: expect.any(Array),
      owner: expect.any(String),
    });
    expect(gameResult.winners[0].owner).toEqual('player');
  });

  test('should determine a winner between 2 players with very different hands', () => {
    playerData.ai1.active = playerData.ai2.active = false;

    playerData.player.hand = createHand([2, 2], ['h', 's']); // full house 2s over 8s
    playerData.ai3.hand = createHand([8, 6], ['h', 'c']); // 3 of a kind
    tableCards = createHand([2, 3, 5, 8, 8], ['d', 'c', 's', 's', 'd']);
    let gameResult = getWinner(playerData, tableCards);
    expect(gameResult.winners[0].owner).toEqual('player');

    playerData.player.hand = createHand([2, 2], ['h', 's']); // 4 of a kind
    playerData.ai3.hand = createHand([8, 6], ['h', 'c']); // 2 pair
    tableCards = createHand([2, 2, 10, 8, 10], ['d', 'c', 's', 's', 'd']);
    gameResult = getWinner(playerData, tableCards);
    expect(gameResult.winners[0].owner).toEqual('player');
  });

  test('should determine a winner between 2 players with similar hands', () => {
    playerData.ai1.active = playerData.ai2.active = false;

    playerData.player.hand = createHand([4, 2], ['h', 's']); // 9-high straight
    playerData.ai3.hand = createHand([8, 10], ['h', 'c']); // 10-high straight
    tableCards = createHand([5, 6, 7, 8, 9], ['d', 'c', 's', 's', 'd']);
    let gameResult = getWinner(playerData, tableCards);
    expect(gameResult.winners[0].owner).toEqual('ai3');

    playerData.player.hand = createHand([13, 12], ['h', 's']); // full house Aces over Kings
    playerData.ai3.hand = createHand([12, 12], ['h', 'c']); // full house Aces over Queens
    tableCards = createHand([14, 14, 14, 13, 4], ['d', 'c', 's', 's', 'd']);
    gameResult = getWinner(playerData, tableCards);
    expect(gameResult.winners[0].owner).toEqual('player');

    playerData.player.hand = createHand([8, 7], ['h', 's']); // 2 pair 8s over 7s
    playerData.ai3.hand = createHand([8, 5], ['c', 'c']); // 2 pair 8s over 5s
    tableCards = createHand([8, 7, 5, 13, 4], ['d', 'c', 's', 's', 'd']);
    gameResult = getWinner(playerData, tableCards);
    expect(gameResult.winners[0].owner).toEqual('player');

    playerData.player.hand = createHand([9, 2], ['c', 'c']); // flush king-high (high 9 in hole)
    playerData.ai3.hand = createHand([12, 5], ['c', 'c']); // flush king-high (high queen in hole)
    tableCards = createHand([3, 7, 13, 13, 4], ['c', 'c', 'c', 's', 'd']);
    gameResult = getWinner(playerData, tableCards);
    expect(gameResult.winners[0].owner).toEqual('ai3');
  });

  test('should determine a winner between 3 players', () => {
    playerData.ai1.active = false;

    // far off
    playerData.player.hand = createHand([8, 8], ['h', 's']); // 4 of a kind
    playerData.ai2.hand = createHand([4, 13], ['h', 'c']); // high card
    playerData.ai3.hand = createHand([6, 6], ['h', 'c']); // 3 of a kind
    tableCards = createHand([2, 3, 6, 8, 8], ['d', 'c', 's', 'c', 'd']);
    let gameResult = getWinner(playerData, tableCards);
    expect(gameResult.winners[0].owner).toEqual('player');

    // close
    playerData.player.hand = createHand([11, 11], ['h', 'c']); // 2 pair Queens over Jacks
    playerData.ai2.hand = createHand([10, 5], ['h', 'c']); // 2 pair Queens over 10s
    playerData.ai3.hand = createHand([13, 4], ['h', 's']); // 2 pair Kings over Queens
    tableCards = createHand([2, 10, 13, 12, 12], ['d', 'c', 's', 's', 'd']);
    gameResult = getWinner(playerData, tableCards);
    expect(gameResult.winners[0].owner).toEqual('ai3');
  });

  test('should determine a winner between 4 players', () => {
    playerData.player.hand = createHand([9, 9], ['h', 'c']); // 2 pair Queens over 9s
    playerData.ai1.hand = createHand([11, 11], ['h', 'c']); // 2 pair Queens over Jacks
    playerData.ai2.hand = createHand([10, 5], ['h', 'c']); // 2 pair Queens over 10s
    playerData.ai3.hand = createHand([13, 4], ['h', 's']); // 2 pair Kings over Queens
    tableCards = createHand([2, 10, 13, 12, 12], ['d', 'c', 's', 's', 'd']);
    const gameResult = getWinner(playerData, tableCards);
    expect(gameResult.winners[0].owner).toEqual('ai3');
  });
});

describe('kicker card tiebreaker tests', () => {
  beforeEach(() => {
    deck.reset();
    playerData = {
      player: { id: 'player', active: true, hand: [] },
      ai1: { id: 'ai1', active: true, hand: [] },
      ai2: { id: 'ai2', active: true, hand: [] },
      ai3: { id: 'ai3', active: true, hand: [] },
    };
  });

  describe('four of a kind tiebreaker tests', () => {
    test('should determine a winner by kicker when 4 of a kind is on the table', () => {
      playerData.player.hand = createHand([10, 9], ['h', 'c']); // beats table
      playerData.ai1.hand = createHand([6, 11], ['h', 'c']); // loses to player
      playerData.ai2.hand = createHand([11, 5], ['d', 'c']); // beats player
      playerData.ai3.hand = createHand([12, 3], ['h', 's']); // beats table & ai2
      let tableCards = createHand([7, 4, 4, 4, 4], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners[0].owner).toEqual('ai3');
      expect(gameResult.winners[0].score).toEqual(7);
    });

    test('should call a draw when 4 of a kind is on the table and the high card is on the table', () => {
      playerData.player.hand = createHand([9, 9], ['h', 'c']);
      playerData.ai1.hand = createHand([10, 11], ['h', 'c']);
      playerData.ai2.hand = createHand([9, 5], ['d', 'c']);
      playerData.ai3.hand = createHand([12, 3], ['h', 's']);
      let tableCards = createHand([13, 14, 14, 14, 14], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners).toHaveLength(4);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });

    test('should call a draw when 4 of a kind is on the table and 2 players had the same high kicker in the hole', () => {
      playerData.player.hand = createHand([9, 9], ['h', 'c']); // pair doesn't mean squat here
      playerData.ai1.hand = createHand([8, 2], ['h', 'c']);
      playerData.ai2.hand = createHand([9, 5], ['d', 'c']);
      playerData.ai3.hand = createHand([4, 3], ['h', 's']);
      let tableCards = createHand([3, 14, 14, 14, 14], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
      expect(gameResult.winners).toHaveLength(2);
    });
  });

  describe('three of a kind tiebreaker tests', () => {
    test('should determine a winner when 3 of a kind is on the table', () => {
      playerData.player.hand = createHand([9, 4], ['h', 'c']);
      playerData.ai1.hand = createHand([8, 2], ['h', 'c']);
      playerData.ai2.hand = createHand([11, 5], ['d', 'c']);
      playerData.ai3.hand = createHand([4, 3], ['h', 's']);
      let tableCards = createHand([7, 14, 14, 14, 10], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners[0].owner).toEqual('ai2');
      playerData.player.hand = createHand([11, 4], ['h', 'c']);
      playerData.ai1.hand = createHand([8, 2], ['h', 'c']);
      playerData.ai2.hand = createHand([4, 5], ['d', 'c']);
      playerData.ai3.hand = createHand([4, 7], ['h', 's']);
      tableCards = createHand([13, 3, 3, 3, 10], ['d', 'c', 's', 'h', 'd']);
      gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners[0].owner).toEqual('player');
      expect(gameResult.winners[0].score).toEqual(3);
    });

    test('should call a draw when 3 of a kind is on the table and the 2 high kickers are on the table', () => {
      playerData.player.hand = createHand([9, 4], ['h', 'c']);
      playerData.ai1.hand = createHand([8, 2], ['h', 'c']);
      playerData.ai2.hand = createHand([11, 5], ['d', 'c']);
      playerData.ai3.hand = createHand([4, 3], ['h', 's']);
      let tableCards = createHand([12, 14, 14, 14, 13], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
      playerData.player.hand = createHand([9, 4], ['h', 'c']);
      playerData.ai1.hand = createHand([8, 2], ['h', 'c']);
      playerData.ai2.hand = createHand([11, 5], ['d', 'c']);
      playerData.ai3.hand = createHand([4, 3], ['h', 's']);
      tableCards = createHand([12, 14, 14, 14, 13], ['d', 'c', 's', 'h', 'd']);
      gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });

    test('should call a draw when 2 players have the same three of a kind', () => {
      playerData.player.hand = createHand([14, 8], ['h', 'd']); // 3 oak, kicker 10
      playerData.ai1.hand = createHand([14, 8], ['d', 'c']);
      playerData.ai2.hand = createHand([11, 5], ['d', 'c']); // a pair
      playerData.ai3.hand = createHand([4, 3], ['h', 's']); // a pair
      let tableCards = createHand([7, 14, 14, 5, 3], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
      playerData.player.hand = createHand([9, 2], ['h', 's']); // 3 oak, kicker 10
      playerData.ai1.hand = createHand([7, 8], ['d', 'c']);
      playerData.ai2.hand = createHand([9, 2], ['d', 'c']); // a pair
      playerData.ai3.hand = createHand([8, 3], ['h', 's']); // a pair
      tableCards = createHand([7, 2, 2, 5, 14], ['d', 'c', 's', 'h', 'd']);
      gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });
  });

  describe('two pair tiebreaker tests', () => {
    test('should determine a winner by kicker when two pair is on the table and a player has the high kicker', () => {
      playerData.player.hand = createHand([8, 9], ['h', 'c']); // beats table
      playerData.ai1.hand = createHand([9, 3], ['h', 'c']); // loses to player & table
      playerData.ai2.hand = createHand([11, 5], ['d', 'c']); // loses (one pair)
      playerData.ai3.hand = createHand([12, 3], ['h', 's']); // loses (one pair)
      let tableCards = createHand([7, 10, 10, 4, 9], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners[0].owner).toEqual('player');
      expect(gameResult.winners[0].score).toEqual(2);
    });

    test('should call a draw when 2 pair is on the table and the high kicker is on the table', () => {
      playerData.player.hand = createHand([10, 4], ['h', 'c']);
      playerData.ai1.hand = createHand([2, 5], ['h', 'c']);
      playerData.ai2.hand = createHand([6, 5], ['d', 'c']);
      playerData.ai3.hand = createHand([4, 3], ['h', 's']);
      let tableCards = createHand([11, 13, 13, 14, 14], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });

    test('should call a draw when 2 pair is on the table and 2 players have the same high kicker in the hole', () => {
      playerData.player.hand = createHand([9, 4], ['h', 'c']);
      playerData.ai1.hand = createHand([9, 8], ['h', 'c']);
      playerData.ai2.hand = createHand([5, 4], ['d', 'c']);
      playerData.ai3.hand = createHand([9, 3], ['d', 's']);
      let tableCards = createHand([3, 13, 13, 7, 7], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });

    test('should determine a winner by high kicker when 2 pair is on the table and a player has a low pair in the hole', () => {
      playerData.player.hand = createHand([9, 9], ['h', 'c']); // pair in the hole should only count as high
      playerData.ai1.hand = createHand([11, 3], ['h', 'c']); // winner jack high
      playerData.ai2.hand = createHand([2, 2], ['d', 'c']); // pair in the hole should mean nothing
      playerData.ai3.hand = createHand([4, 3], ['h', 's']);
      let tableCards = createHand([10, 14, 14, 12, 12], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners[0].owner).toEqual('ai1');
      expect(gameResult.winners[0].score).toEqual(2);
      playerData.player.hand = createHand([9, 9], ['h', 'c']);
      playerData.ai1.hand = createHand([11, 3], ['h', 'c']); // jack high
      playerData.ai2.hand = createHand([2, 2], ['d', 'c']);
      playerData.ai3.hand = createHand([12, 3], ['h', 's']); // queen high
      tableCards = createHand([10, 14, 14, 13, 13], ['d', 'c', 's', 'h', 'd']);
      gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners[0].owner).toEqual('ai3');
      expect(gameResult.winners[0].score).toEqual(2);
    });

    test('should call a draw when 2 players have the same 2 pair and the high kicker is on the table', () => {
      playerData.player.hand = createHand([9, 8], ['h', 'd']);
      playerData.ai1.hand = createHand([9, 8], ['d', 'c']);
      playerData.ai2.hand = createHand([8, 4], ['d', 'c']); // pair of 4s should lose
      playerData.ai3.hand = createHand([4, 3], ['h', 's']); // pair of 4s should lose
      let tableCards = createHand([4, 13, 9, 5, 5], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));

      playerData.player.hand = createHand([9, 5], ['h', 'd']); // 2p 9s and 5s
      playerData.ai1.hand = createHand([9, 5], ['d', 'c']); // 2p 9s and 5s
      playerData.ai2.hand = createHand([8, 4], ['d', 'c']); // 8 high
      playerData.ai3.hand = createHand([4, 3], ['h', 's']); // 4 high
      tableCards = createHand([7, 13, 9, 5, 2], ['d', 'c', 's', 'h', 'd']);
      gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });

    test('should call a draw when 2 players have the same 2 pair and the same high kicker', () => {
      playerData.player.hand = createHand([9, 8], ['h', 'd']);
      playerData.ai1.hand = createHand([9, 8], ['d', 'c']);
      playerData.ai2.hand = createHand([8, 4], ['d', 'c']);
      playerData.ai3.hand = createHand([4, 3], ['h', 's']);
      let tableCards = createHand([4, 7, 9, 5, 5], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });
  });

  describe('one pair tiebreaker tests', () => {
    test('should determine a winner by kicker when one pair is on the table and a player has the high kicker', () => {
      playerData.player.hand = createHand([13, 2], ['h', 'c']); // beats table
      playerData.ai1.hand = createHand([8, 3], ['h', 'c']); // loses to player & table
      playerData.ai2.hand = createHand([11, 5], ['d', 'c']); // loses to player & table
      playerData.ai3.hand = createHand([14, 3], ['h', 's']); // beats player & table
      let tableCards = createHand([7, 12, 12, 4, 9], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners[0].owner).toEqual('ai3');
      expect(gameResult.winners[0].score).toEqual(1);
    });

    test('should determine a winner by high kicker when a pair is on the table and 2 players share only the same first 2 high kickers (3rd kicker beats table)', () => {
      playerData.player.hand = createHand([9, 8], ['h', 'c']); // winner by highest kicker 8 (3 levels deep)
      playerData.ai1.hand = createHand([9, 6], ['s', 'c']);
      playerData.ai2.hand = createHand([5, 4], ['d', 'c']);
      playerData.ai3.hand = createHand([9, 2], ['d', 's']);
      let tableCards = createHand([3, 13, 13, 10, 7], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners[0].owner).toEqual('player');
      expect(gameResult.winners[0].score).toEqual(1);
    });

    test('should call a draw when 2 pair is on the table and the high kickers are on the table', () => {
      playerData.player.hand = createHand([8, 4], ['h', 'c']);
      playerData.ai1.hand = createHand([2, 5], ['h', 'c']);
      playerData.ai2.hand = createHand([6, 5], ['d', 'c']);
      playerData.ai3.hand = createHand([4, 3], ['h', 's']);
      let tableCards = createHand([10, 13, 13, 12, 11], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });

    test('should call a draw when a pair is on the table and 2 players have the same high kickers in the hole', () => {
      playerData.player.hand = createHand([9, 8], ['d', 'c']);
      playerData.ai1.hand = createHand([9, 8], ['h', 'c']);
      playerData.ai2.hand = createHand([6, 8], ['d', 'c']);
      playerData.ai3.hand = createHand([9, 2], ['d', 's']); // close but not the same as player & ai1
      let tableCards = createHand([3, 13, 13, 5, 7], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });

    test('should determine a winner by high kicker when 2 players have the same pair', () => {
      playerData.player.hand = createHand([14, 9], ['h', 'c']); // winner by highest kicker 9 (2 levels deep)
      playerData.ai1.hand = createHand([10, 10], ['s', 'c']);
      playerData.ai2.hand = createHand([14, 8], ['d', 'c']); // close, but kicker was 8
      playerData.ai3.hand = createHand([9, 2], ['d', 's']);
      let tableCards = createHand([3, 14, 13, 6, 4], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners[0].owner).toEqual('player');
      expect(gameResult.winners[0].score).toEqual(1);
    });

    test('should call a draw when 2 players have the same pair and some of the high kicker(s) are on the table', () => {
      playerData.player.hand = createHand([11, 8], ['h', 'd']);
      playerData.ai1.hand = createHand([11, 8], ['d', 'c']);
      playerData.ai2.hand = createHand([8, 4], ['d', 'c']); // pair of 4s should lose
      playerData.ai3.hand = createHand([4, 3], ['h', 's']); // pair of 4s should lose
      let tableCards = createHand([9, 13, 11, 3, 7], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));

      playerData.player.hand = createHand([7, 5], ['h', 'd']);
      playerData.ai1.hand = createHand([10, 5], ['d', 'c']); // pair of 5s, kickers: 13(t), 11(t), 10(hole)
      playerData.ai2.hand = createHand([10, 5], ['d', 'c']); // same, ties with above
      playerData.ai3.hand = createHand([7, 3], ['h', 's']);
      tableCards = createHand([11, 13, 9, 5, 2], ['d', 'c', 's', 'h', 'd']);
      gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });

    test('should call a draw when 2 players have the same pair and the same high kickers', () => {
      playerData.player.hand = createHand([12, 12], ['h', 'd']); // pair Qs, kickers: 9, 7, 5 (table)
      playerData.ai1.hand = createHand([12, 12], ['d', 'c']);
      playerData.ai2.hand = createHand([8, 4], ['d', 'c']);
      playerData.ai3.hand = createHand([4, 2], ['h', 's']);
      let tableCards = createHand([4, 7, 9, 5, 3], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));

      playerData.player.hand = createHand([12, 11], ['h', 'd']); // pair Qs, kickers: 11(h), 7, 5 (table)
      playerData.ai1.hand = createHand([12, 11], ['d', 'c']);
      playerData.ai2.hand = createHand([9, 9], ['d', 'c']); // hole pair shouldn't matter
      playerData.ai3.hand = createHand([8, 14], ['h', 's']);
      tableCards = createHand([2, 7, 12, 5, 3], ['d', 'c', 's', 'h', 'd']);
      gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });
  });

  describe('high card tiebreaker tests', () => {
    test('should call a draw when all high cards are on the table', () => {
      playerData.player.hand = createHand([3, 2], ['h', 'd']);
      playerData.ai1.hand = createHand([4, 2], ['d', 'c']);
      playerData.ai2.hand = createHand([3, 2], ['d', 'h']);
      playerData.ai3.hand = createHand([5, 2], ['h', 's']);
      let tableCards = createHand([6, 7, 9, 10, 11], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });

    test('should call a draw when 2 players have the exact same kickers', () => {
      playerData.player.hand = createHand([8, 2], ['h', 'd']); // pair Qs, kickers: 9, 7, 5 (table)
      playerData.ai1.hand = createHand([4, 2], ['d', 'c']);
      playerData.ai2.hand = createHand([8, 2], ['d', 'h']);
      playerData.ai3.hand = createHand([5, 2], ['h', 's']);
      let tableCards = createHand([3, 7, 9, 10, 13], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.notify).toEqual(expect.stringContaining('Draw'));
    });

    test('should return a winner when some players have some of the same kickers but not all', () => {
      playerData.player.hand = createHand([12, 14], ['h', 'd']); // pair Qs, kickers: 9, 7, 5 (table)
      playerData.ai1.hand = createHand([4, 2], ['d', 'c']);
      playerData.ai2.hand = createHand([11, 14], ['d', 'h']);
      playerData.ai3.hand = createHand([5, 2], ['h', 's']);
      let tableCards = createHand([6, 7, 8, 10, 13], ['d', 'c', 's', 'h', 'd']);
      let gameResult = getWinner(playerData, tableCards);
      expect(gameResult.winners[0].owner).toEqual('player');
      expect(gameResult.winners[0].score).toEqual(0);
    });
  });

  xdescribe('getWinner stress test', () => {
    // will not work until kicker logic is in place
    test(`should always pick a winner (${stressMultiplier}x stress test)`, () => {
      for (let i = 0; i < stressMultiplier; i++) {
        deck.reset();
        playerData.player.hand = [deck.dealCard(), deck.dealCard()];
        playerData.ai1.hand = [deck.dealCard(), deck.dealCard()];
        playerData.ai2.hand = [deck.dealCard(), deck.dealCard()];
        playerData.ai3.hand = [deck.dealCard(), deck.dealCard()];
        const tableCards = new Array(5).fill(null).map(e => deck.dealCard());
        expect(() => getWinner(playerData, tableCards)).not.toThrow();
      }
    });
  });
});
