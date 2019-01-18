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
      return [this.cache[string], string];
    }
    // console.log('cache hits: ', this.hits);
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
  let scoreObject = { score: 0, type: 'a high card' }; // base score object
  const cardsByValue = {};

  // build an object to store how many of each card the hand has, and update hasStraight/hasFlush
  for (let i = 0; i < hand.length; i += 1) {
    const card = hand[i];
    if (i !== 0 && card.value !== hand[i - 1].value + 1) {
      if (hasStraight && card.isAce && hand[0].value === 2) hasStraight = true; // back to true if hand is 2 3 4 5 A
      else hasStraight = false;
    }
    if (i !== 0 && card.suit !== hand[i - 1].suit) hasFlush = false;
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
          scoreObject = { score: 6, type: 'a full house', cardsUsed: hand, highHandCards: [cardSet[0]]};
          break;
        }
        else {
          threeOfAKind = cardSet;
          scoreObject = { score: 3, type: 'three of a kind', cardsUsed: cardSet, highHandCards: [cardSet[0]]};
        }
      }
      if (cardSet.length === 2) { // check for pair/full house
        if (threeOfAKind) {// will also serve as cardsUsed
          scoreObject = { score: 6, type: 'a full house', cardsUsed: hand, highHandCards: [threeOfAKind[0]]};
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
  // console.log('both had type ' + oldScoreObject.type + ', must compare by hand cards');
  // console.log('old best object: ', JSON.stringify(oldScoreObject.highHandCards.map(e => e.displayName)));
  // console.log('new object: ', JSON.stringify(newScoreObject.highHandCards.map(e => e.displayName)));
  for (let i = 0; i < newScoreObject.highHandCards.length; i++) {
    if (newScoreObject.highHandCards[i].value > oldScoreObject.highHandCards[i].value) {
      return { draw: false, bestScoreObject: newScoreObject };
    }
    if (newScoreObject.highHandCards[i].value < oldScoreObject.highHandCards[i].value) {
      return {draw: false, bestScoreObject: oldScoreObject };
    }
  }
  return { draw: true, bestScoreObject: oldScoreObject };
}

const scoreHoleCards = (hand) => {
  if (hand.length !== 2) throw new Error(`scoreHoleCards requires array of length 2 and got length ${hand.length}`);
  if (hand[0].value === hand[1].value) return { score: hand[0].value / 100, cards: hand }
  const cards = hand.sort((a, b) => b.value - a.value);
  return { score: cards[0].value / 1000, cards }
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
        // will use draw boolean later...
        const { bestScoreObject: bestScoreObjectByComparison, draw } = compareByHighHandCards(bestScoreObject, newScoreObject);
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
  if (owner) bestScoreObject.owner = owner;
  const { score, cards } = scoreHoleCards(holeCards);
  bestScoreObject.holeCardsScore = score;
  bestScoreObject.highHoleCards = cards;
  // console.log('cache hits so far: ', cache.hits)
  return bestScoreObject;
}

const getWinner = () => {};

export { getScore, getScoreObject, scoreHoleCards, ScoreCache, getWinner };