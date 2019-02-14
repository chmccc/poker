/**
 * @module ai
 * @description AI engine to make betting decisions for computer players
 * @version 0.1alpha
 * Prototype: Raises between 10 and 30 (random - 20%), folds (random - 10%), and calls (random - 70%)
 * MVP: bets sensible amounts based on strength/potential of own cards
 * Fully featured: considers other players' cards, has bluff logic, uses FSM for varied play strategy (big blind, dealer, SB, losing, winning, etc)
 */

const getDecision = (playerData, player) => {
  const choiceObject = { choice: '', raise: 0 };
  const { currentBet } = playerData[player];
  let { balance: bettingBalance } = playerData[player];
  if (bettingBalance > 100) bettingBalance = 200; // never more than 200
  // can the player call?
  const requiredToCall =
    Math.max(
      ...Object.values(playerData)
        .filter(p => p.active)
        .map(p => p.currentBet) // makes an array of all current bets from active players
    ) - currentBet;
  if (bettingBalance < requiredToCall) choiceObject.choice = 'fold';
  else {
    const randInt = Math.random();
    if (randInt < 0.1) choiceObject.choice = 'fold';
    else if (randInt < 0.3 && bettingBalance - requiredToCall >= 10) {
      choiceObject.choice = 'raise';
      choiceObject.raise = Math.ceil(Math.random() * ((bettingBalance - requiredToCall) / 10)) * 10;
      if (choiceObject.raise > 10)
        choiceObject.raise = Math.round(choiceObject.raise / 10 / 2) * 10;
    } else choiceObject.choice = 'call';
  }
  return choiceObject;
};

/* DEBUG ---

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

const dummyPlayerData = createBasePlayerData();
dummyPlayerData.player.currentBet = 30;
dummyPlayerData.ai1.currentBet = 10;
dummyPlayerData.ai1.balance = 100;
dummyPlayerData.ai2.currentBet = 10;
dummyPlayerData.ai3.currentBet = 30;

console.log(getNextMove(dummyPlayerData, 'ai1'));

/* --- DEBUG */

export { getDecision };
