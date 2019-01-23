/**
 * @module engine
 * @description Contains functions related to deck management
 */

// TODO: add JSDoc annotations

// caches all hands passed in regardless of size -- should improve performance in any function that looks for a best score from given cards
class ScoreCache {
  constructor() {
    this.cache = {};
    this.hits = 0;
  }

  checkCache(hand) {
    const string = JSON.stringify(hand);
    if (this.cache[string]) {
      this.hits++;
      return [JSON.parse(this.cache[string]), string];
    }
    return [null, string];
  }

  addToCache(string, scoreObject) {
    this.cache[string] = JSON.stringify(scoreObject);
    return true;
  }

  clearCache() { this.cache = {}; this.hits = 0; }

}

let cache = new ScoreCache();

// primary function to build a score object from a hand
const getScoreObject = (hand) => {
  const [cached, cacheString] = cache.checkCache(hand);
  if (cached) return cached;
  hand = hand.sort((a, b) => a.value - b.value);
  if (hand.length !== 5) throw new Error('getScoreObject: hand size must be 5!');
  
  // we'll detect straight and flush during loop 
  let hasStraight = true;
  let hasFlush = true;
  let aceLowStraight = false;
  let scoreObject = { score: 0, type: 'a high card' }; // base score object
  const cardsByValue = {};

  // build an object to store how many of each card the hand has, and update hasStraight/hasFlush
  for (let i = 0; i < hand.length; i += 1) {
    const card = hand[i];
    if (i !== 0 && card.value !== hand[i - 1].value + 1) {
      if (hasStraight && card.isAce && hand[0].value === 2 && !aceLowStraight) {
        aceLowStraight = true; // this prevents counting a ace-low "straight" with more than 1 ace as a real straight
        hasStraight = true; // back to true if hand is 2 3 4 5 A
      }
      else hasStraight = false;
    }
    if (i !== 0 && card.suit !== hand[i - 1].suit && hasFlush) hasFlush = false;
    if (!cardsByValue[card.value]) cardsByValue[card.value] = [];
    cardsByValue[card.value].push(card);
  }

  // swap out of place ace in an ace-low straight
  if (hasStraight && hand[4].isAce && hand[0].value === 2) {
    hand.unshift(hand[4]);
    hand.splice(5, 1);
  }

  if (hasStraight && hasFlush) scoreObject = { score: 8, type: 'a straight flush', cardsUsed: hand, highHandCards: [hand[4]] };
  else if (hasStraight) scoreObject = { score: 5, type: 'a straight', cardsUsed: hand, highHandCards: [hand[4]] };
  else if (hasFlush) scoreObject = { score: 4, type: 'a flush', cardsUsed: hand, highHandCards: hand.sort((a, b) => b.value - a.value) };

  // no straight, flush, or straight flush, now we dig through cardsByValue for pairs/triplets
  // breaks when no better hand is possible
  else {
    let firstPair, threeOfAKind;
    for (const cardValue in cardsByValue) {
      const cardSet = cardsByValue[cardValue];
      if (cardSet.length === 4) {
        scoreObject = { score: 7, type: 'four of a kind', cardsUsed: cardSet, highHandCards: [cardSet[0]] };
        break;
      }
      if (cardSet.length === 3) { // check for 3 of a kind/full house
        if (firstPair) {
          scoreObject = { score: 6, type: 'a full house', cardsUsed: hand, highHandCards: [cardSet[0], firstPair[0]]};
          break;
        }
        else {
          threeOfAKind = cardSet;
          scoreObject = { score: 3, type: 'three of a kind', cardsUsed: cardSet, highHandCards: [cardSet[0]]};
        }
      }
      if (cardSet.length === 2) { // check for pair/full house
        if (threeOfAKind) {
          scoreObject = { score: 6, type: 'a full house', cardsUsed: hand, highHandCards: [threeOfAKind[0], cardSet[0]]};
          break;
        }
        else if (firstPair) {
          const sorted = [...firstPair, ...cardSet].sort((a, b) => b.value - a.value); // will also serve as cardsUsed
          scoreObject = { score: 2, type: 'two pair', cardsUsed: sorted, highHandCards: [sorted[0], sorted[2]] };
          break;
        }
        else {
          firstPair = cardSet;
          scoreObject = { score: 1, type: 'a pair', cardsUsed: cardSet, highHandCards: [cardSet[0]] };
        }
      }
    }
  }
  // high card only
  if (scoreObject.score === 0) {
    scoreObject.highHandCards = hand.sort((a, b) => b.value - a.value);
    scoreObject.cardsUsed = [hand[0]];
  }
  cache.addToCache(cacheString, scoreObject);
  return scoreObject;
};

const compareByHighHandCards = (firstScoreObject, secondScoreObject) => {
  const output = { draw: false, bestScoreObject: null }
  for (let i = 0; i < secondScoreObject.highHandCards.length; i++) {
    if (secondScoreObject.highHandCards[i].value > firstScoreObject.highHandCards[i].value) {
      output.bestScoreObject = secondScoreObject;
      break;
    }
    else if (secondScoreObject.highHandCards[i].value < firstScoreObject.highHandCards[i].value) {
      output.bestScoreObject = firstScoreObject;
      break;
    }
  }

  if (!output.bestScoreObject) output.draw = true;
  return output;
}

const getScoreRecursively = (hand) => {
  const [cached, cacheString] = cache.checkCache(hand);
  if (cached) return cached;
  if (hand.length === 5) return getScoreObject(hand);
  let bestScoreObject = null;
  if (hand.length > 5) {
    for (let i = 0; i < hand.length; i++) {
      let newScoreObject;
      if (hand.length === 7) {
        newScoreObject = getScoreRecursively([...hand.slice(0, i), ...hand.slice(i + 1)])
      } else newScoreObject = getScoreObject([...hand.slice(0, i), ...hand.slice(i + 1)]);
      if (!bestScoreObject) bestScoreObject = newScoreObject;
      else if (newScoreObject.score > bestScoreObject.score) bestScoreObject = newScoreObject;
      else if (newScoreObject.score === bestScoreObject.score) {
        const { bestScoreObject: bestScoreObjectByHighHandCards } = compareByHighHandCards(bestScoreObject, newScoreObject);
        bestScoreObject = bestScoreObjectByHighHandCards || newScoreObject;
      }
    }
  }
  cache.addToCache(cacheString, bestScoreObject);
  return bestScoreObject;
}

const getScore = (holeCards, tableCards, owner) => {
  const fullHand = [...holeCards, ...tableCards].sort((a, b) => a.value - b.value);
  const bestScoreObject = getScoreRecursively(fullHand);
  bestScoreObject.owner = owner;
  // sort and store the hole cards separately on the score object
  bestScoreObject.holeCards = holeCards.sort((a, b) => b.value - a.value);
  return bestScoreObject;
};


// TODO: rename me
const compareByHoleCards = (firstScoreObject, secondScoreObject, firstArray, secondArray) => {
  const output = { draw: false }

  for (let i = 0; i < firstArray.length; i++) {
    if (!firstArray[i] && !secondArray[i]) break;
    if (!secondArray[i] || firstArray[i].value > secondArray[i].value) {
      output.bestScoreObject = firstScoreObject;
      break;
    }
    else if (!firstArray[i] || secondArray[i].value > firstArray[i].value) {
      output.bestScoreObject = secondScoreObject;
      break;
    }
  }
  if (!output.bestScoreObject) {
    // no winner found
    output.bestScoreObject = secondScoreObject;
    output.draw = true;
  }
  return output;
}

const kickerTable4 = (firstScoreObject, secondScoreObject, tableCards) => {
  const tableKickerVal = tableCards.reduce((output, card, i) => {
    if (typeof output === 'number') return output;
    if (!output[card.value]) output[card.value] = 1;
    else output[card.value]++;
    // once a duplicate val is found, we can stop building the counter object and return a number
    if (output[card.value] > 1) {
      for (let key in output) {
        if (output[key] === 1) return Number(key);
      }
      throw new Error('kickerTable4: Could not determine table kicker card.');
    }
    return output;
  }, {});
  
  // they only get one kicker in this case, so slice off the other one
  let result = compareByHoleCards(firstScoreObject, secondScoreObject, firstScoreObject.validKickers, secondScoreObject.validKickers);

  // check if the table's kicker card is higher
  if (tableKickerVal > firstScoreObject.validKickers[0].value && tableKickerVal > secondScoreObject.validKickers[0].value) {
    // this will spit out a "winner" - whoever has the higher hole card, if any
    // but we set tableWins to true as that's what really matters
      return { ...result, tableWins: true };
  }
  return { ...result, tableWins: false };
};

const kicker3OAK = (firstScoreObject, secondScoreObject, tableCards) => {
  const tripVal = firstScoreObject.highHandCards[0].value;
  let tableWins = false;

  // get 2 highest cards on table that are not part of the trip
  const tableKickers = tableCards
  .filter(card => card.value !== tripVal)
  .sort((a, b) => b.value - a.value)
  .slice(0, 2)
  .sort((a, b) => a.value - b.value);
  
  // filter player kicker cards - a trip card in the hole is not a valid kicker
  // AND player kicker cards invalid if beaten by table kicker cards
  const filterKickers = (card, index) => {
    if (card.value === tripVal) return false;
    if (tableKickers[index].value > card.value) return false;
    return true;
  };
  firstScoreObject.validKickers = firstScoreObject.validKickers.filter(filterKickers);
  secondScoreObject.validKickers = secondScoreObject.validKickers.filter(filterKickers);

  if (firstScoreObject.validKickers.length === 0 && secondScoreObject.validKickers.length === 0) {
    tableWins = true;
  }

  let result = compareByHoleCards(firstScoreObject, secondScoreObject, firstScoreObject.validKickers, secondScoreObject.validKickers);

  // if there's a hole cards tie and a table card that beats ONE of the 2 hole cards, we must remove the beaten card from the player objects' validKickers array (as it's not a valid kicker anymore) 

  return { ...result, tableWins };

}

const handleKickerLogic = (best, curr, tableCards) => {

  switch(best.score) {
    case 7:
      best.validKickers = best.validKickers || best.holeCards.slice(0, 1);
      curr.validKickers = curr.validKickers || curr.holeCards.slice(0, 1);
      return kickerTable4(best, curr, tableCards);
    case 3:
      best.validKickers = best.validKickers || best.holeCards;
      curr.validKickers = curr.validKickers || curr.holeCards;
      return kicker3OAK(best, curr, tableCards);
    // 2 identical pairs by value

    // the same pair by value
    
    // the same high card by value
    default:
      throw new Error('handleKickerLogic: No valid score prop on given score object.');
  }

}

const getWinner = (playerData, tableCards) => {

  // create an array of all active player's hole cards
  const playerHandsArray = Object.values(playerData).reduce((arr, data) => {
    if (data.active) arr.push(data);
    return arr;
  }, []);

  if (playerHandsArray.length < 1) {
    throw new Error('getWinner: Unable to compute winner. Ensure at least one player is marked "active"');
  }

  let byKickerCard = false;
  let kickerCardTie = false;
  let tableWinning = false;
  let tiesByKicker = {};

  // for each active player, compare against the best score object so far in the array, updating as necessary
  let best = getScore(playerHandsArray[0].hand, tableCards, playerHandsArray[0].id);

  if (playerHandsArray.length === 1) return best;
  
  for (let index = 1; index < playerHandsArray.length; index++) {

    const currPlayerData = playerHandsArray[index];
    const curr = getScore(currPlayerData.hand, tableCards, currPlayerData.id);

    if (curr.score === best.score) {
      // same type of hand, is there a winner between the high *hand* cards?
      const { bestScoreObject: bestScoreObjectByHandCards, draw: handCardTie } = compareByHighHandCards(best, curr);
      if (handCardTie) {
        byKickerCard = true;

        // console.log(`hand card tie!: ${best.owner} vs. ${curr.owner} with score ${best.score} - ${best.type}`)

        // BEGIN KICKER LOGIC

        let { draw, tableWins, bestScoreObject } = handleKickerLogic(best, curr, tableCards);

        // handle kicker card draw
        if (draw) {
          // update outer (function-level) state
          kickerCardTie = true;

          // put both players into the kickerTies object (for pot splitting)
          const { validKickers } = bestScoreObject;
          // generate key string from kicker values (e.g. "5_3" or just "5" if table beat the 3)
          if (validKickers.length) {
            let key = validKickers.reduce((str, card, i) => {
              if (i === 0) return card.value.toString();
              return str + `_${card.value.toString()}`;
            }, '');
            if (!tiesByKicker[key]) tiesByKicker[key] = {};
            tiesByKicker[key][curr.owner] = curr;
            tiesByKicker[key][best.owner] = best;
          }
        }

        // update table winning boolean
        if (tableWins) tableWinning = true;
        else tableWinning = false;

        // update best
        best = bestScoreObject;
        
        // END KICKER LOGIC SERIES

      } else best = bestScoreObjectByHandCards;
      
    // scores not equal, easy
    } else {
      byKickerCard = false;
      if (curr.score > best.score) best = curr;
    }

  }

  // FINAL DRAW LOGIC:
  if (tableWinning) return 'table_win_placeholder';

  if (kickerCardTie) {
    // todo: pot splitting logic
    const winnerMaxKicker = best.validKickers[0].value;
    if (tiesByKicker[winnerMaxKicker] && Object.keys(tiesByKicker[`${winnerMaxKicker}`]).length > 1) {
      console.log(`true draw! pot split between ${Object.keys(tiesByKicker[winnerMaxKicker]).join(' and ')}, both having ${best.type}`);
      return 'true_draw_placeholder';
    }
  }

  // console.log('best.owner: ', best.owner, 'best.type: ', best.type);
  return best;
};

/* --- DEBUG SCRIPTS --- 

const suitEmojis = {
  'Clubs': '♣️',
  'Hearts': '♥️',
  'Diamonds': '♦️',
  'Spades': '♠️',
}

const cardNames = ['', 'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace'];

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

const createHand = (vals, suits) => {
  suits.forEach((char, i) => suits[i] = char.toUpperCase());
  const suitNames = { S: 'Spades', D: 'Diamonds', C: 'Clubs', H: 'Hearts' };
  const output = [];
  for (let i = 0; i < vals.length; i += 1) {
    output.push(new Card(vals[i], suitNames[suits[i]]));
  }
  return output;
}

const playerData = {
  player: { id: 'player', active: true, hand: [] },
  ai1: { id: 'ai1', active: true, hand: [] },
  ai2: { id: 'ai2', active: true, hand: [] },
  ai3: { id: 'ai3', active: true, hand: [] },
};

playerData.player.hand = createHand([9, 2], ['h', 's']); // 3 oak, kicker 10
playerData.ai1.hand = createHand([2, 8], ['d', 'c']);
playerData.ai2.hand = createHand([9, 2], ['d', 'c']); // a pair
playerData.ai3.hand = createHand([8, 3], ['h', 's']); // a pair
let tableCards = createHand([7, 2, 2, 5, 14], ['d','c','s','h','d']);
let testScoreObj = getWinner(playerData, tableCards);

console.log('getWinner result: ', typeof testScoreObj === 'object' ? testScoreObj.owner : testScoreObj);

console.log('done');

/* --- END DEBUG SCRIPTS --- */

export { getScore, getScoreObject, ScoreCache, getWinner };