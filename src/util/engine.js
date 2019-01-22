/**
 * @module engine
 * @description Contains functions related to deck management
 */

// TODO: add JSDoc annotations

/* --- DEBUG IMPORT --- 
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

/* --- END DEBUG IMPORT --- */

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
      return [this.cache[string], string];
    }
    return [null, string];
  }

  addToCache(string, scoreObject) {
    this.cache[string] = scoreObject;
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

const compareByHighHandCards = (oldScoreObject, newScoreObject) => {
  for (let i = 0; i < newScoreObject.highHandCards.length; i++) {
    if (newScoreObject.highHandCards[i].value > oldScoreObject.highHandCards[i].value) {
      return { draw: false, bestScoreObject: newScoreObject, newScoreObject: null };
    }
    if (newScoreObject.highHandCards[i].value < oldScoreObject.highHandCards[i].value) {
      return {draw: false, bestScoreObject: oldScoreObject, newScoreObject: null };
    }
  }
  return { draw: true, bestScoreObject: oldScoreObject, newScoreObject };
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
        const { bestScoreObject: bestScoreObjectByComparison } = compareByHighHandCards(bestScoreObject, newScoreObject);
        bestScoreObject = bestScoreObjectByComparison;
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
  return bestScoreObject;
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

  // for each active player, compare against the next player in the array, carrying the best one for next comparison, then return the best score object
  return playerHandsArray.reduce((best, currPlayerData) => {

    const curr = getScore(currPlayerData.hand, tableCards, currPlayerData.id);
    if (!best) best = curr;
    else {
      if (curr.score === best.score) {
        // same type of hand, is there a winner between the high *hand* cards?
        const { bestScoreObject: tieBreaker, draw: handCardTie, newScoreObject } = compareByHighHandCards(best, curr);
        if (handCardTie) {

          // TODO: implement kicker cards
          const error = new Error("getWinner: Kicker card tiebreaker error");
          error.dump = {firstScoreObject: tieBreaker, secondScoreObject: newScoreObject};
          throw error;

        } else best = tieBreaker;
      }
      else if (curr.score > best.score) best = curr;
    }

    return best;

  }, null);

};

// const scoreObj = getScoreObject(createHand([2,3,4,14,14], ['h', 'c', 'd', 'h', 'c']));
// console.log(scoreObj.score)

export { getScore, getScoreObject, ScoreCache, getWinner };