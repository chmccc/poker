/**
 * @module ai
 * @description AI engine to make betting decisions for computer players
 * @version 0.1alpha
 * Prototype: Raises (random - 10%), folds (random - 20%), and calls (random - 70%)
 * MVP: bets sensible amounts based on strength/potential of own cards
 * Fully featured: considers other players' cards, has bluff logic, uses FSM for varied play strategy (big blind, dealer, SB, losing, winning, etc)
 */

const getDecision = (playerData, player, canRaise = true, thresholds) => {
  const decisionObj = { decision: '', raiseAmt: 0, totalAmt: 0 };
  const { currentBet } = playerData[player];
  let { balance } = playerData[player];
  // can the player call?
  const requiredToCall =
    Math.max(
      ...Object.values(playerData)
        .filter(p => p.active)
        .map(p => p.currentBet) // makes an array of all current bets from active players
    ) - currentBet;
  if (balance < requiredToCall) decisionObj.decision = 'fold';
  else {
    thresholds = {
      fold: requiredToCall === 0 ? 0 : 0.15,
      raise: requiredToCall === 0 ? 0.15 : 0.3,
    };
    console.log(`${player} required to call: ${requiredToCall} thresholds: `, thresholds);
    let bettingBalance = balance - requiredToCall;
    if (bettingBalance > 200) bettingBalance = 200; // never more than 200
    const randInt = Math.random();
    if (randInt < thresholds.fold) decisionObj.decision = 'fold';
    else if (canRaise && randInt < thresholds.raise && bettingBalance >= 10) {
      decisionObj.decision = 'raise';
      decisionObj.raiseAmt =
        Math.ceil(Math.random() * ((bettingBalance - requiredToCall) / 10)) * 10;
      if (decisionObj.raiseAmt > 50 && Math.random() < 0.8) {
        // divide large bets by 2 most of the time
        decisionObj.raiseAmt = Math.round(decisionObj.raiseAmt / 10 / 2) * 10;
      }
      // add the raiseAmt to the required call for the totalAmt bet
      decisionObj.totalAmt += requiredToCall + decisionObj.raiseAmt;
    } else {
      decisionObj.decision = 'call';
      decisionObj.totalAmt = requiredToCall;
    }
  }
  return decisionObj;
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
