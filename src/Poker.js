import React, { Component, Fragment } from 'react';
import styled from 'styled-components';

import { InfoMessagesQueue } from './util/infoMessagesQueue';
import engine from './util/engine/';
import {
  clonePlayerData,
  highlightSelectCards,
  addToTableCards,
  createHand,
  createBasePlayerData,
  sleep,
} from './util/helpers';
import { deck } from './util/deck.js'; // this is the initialized deck instance

import PlayerDashboard from './components/PlayerDashboard';
import Table from './components/Table.js';
import AI from './components/AI';
import InfoPanel from './components/InfoPanel';
import Balance from './components/Balance';
import PlayerHand from './components/PlayerHand';
import OptionsPanel from './components/OptionsPanel';
import { getDecision } from './util/engine/ai';

/* DEBUG STUFF */

// used to override hole cards
const debugHolePlayerData = newPlayerData => {
  newPlayerData.player.hand = createHand([11, 9], ['h', 'h']);
  newPlayerData.ai1.hand = createHand([9, 2], ['s', 's']);
  newPlayerData.ai2.hand = createHand([14, 12], ['c', 'd']);
  newPlayerData.ai3.hand = createHand([7, 6], ['s', 'h']);
};

// used to override table cards (pre-scoring)
const debugTableCards = () => createHand([10, 9, 10, 4, 11], ['d', 'c', 'c', 'd', 's']);

/* STYLED COMPONENTS */

const StyledPoker = styled.div`
  padding-top: 10px;
  margin: 0 auto;
  color: white;
  display: grid;
  width: 920px;
  grid-template-columns: 190px 330px 180px 190px;
  grid-template-rows: 80px 150px 130px 220px;
  grid-row-gap: 10px;
  grid-column-gap: 10px;
  grid-template-areas:
    'infopanel infopanel infopanel infopanel'
    'ai1 ai2 pot ai3'
    'ai1 table table ai3'
    'player player player player';
  background-color: rgb(0, 80, 0);
  border-radius: 20px;
`;

class Poker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playerData: createBasePlayerData(),
      tableCards: [],
      displayAICards: false,
      gameStage: 0,
      playerIsActive: true, // todo: refactor, unnecessary, keep track in playerData
      infoMessages: new InfoMessagesQueue(),
      debug: false,
      potAmt: 0,
      currentPlayerID: 'player',
      highBet: 0,
      sleepTime: 500,
      thresholds: { fold: 0.15, raise: 0.3 },
    };
    this.forceAI1 = React.createRef();
    this.forceAI2 = React.createRef();
    this.forceAI3 = React.createRef();
  }

  setStatePromise = state => new Promise(resolve => this.setState(state, resolve));

  /** Returns a string for the next active player in the turn order */
  getNextPlayer = currentPlayerID => {
    // todo: refac to linked list?
    const playerOrder = ['player', 'ai1', 'ai2', 'ai3', 'player', 'ai1', 'ai2', 'ai3'];
    let index = playerOrder.indexOf(currentPlayerID);
    while (!this.state.playerData[playerOrder[++index]].active) {}
    return playerOrder[index];
  };

  newGame = () => {
    deck.reset();
    console.clear();
    const playerData = createBasePlayerData();
    playerData.player.balance = this.state.playerData.player.balance;
    playerData.ai1.balance = this.state.playerData.ai1.balance;
    playerData.ai2.balance = this.state.playerData.ai2.balance;
    playerData.ai3.balance = this.state.playerData.ai3.balance;
    this.setState({
      playerData,
      tableCards: [],
      displayAICards: false,
      gameStage: 0,
      playerIsActive: true,
      infoMessages: new InfoMessagesQueue(),
      potAmt: 0,
      highBet: 0,
      currentPlayerID: 'player',
    });
  };

  deal = async () => {
    let playerData = clonePlayerData(this.state.playerData);
    let infoMessages = this.state.infoMessages.copy();
    let tableCards = this.state.tableCards;
    let { displayAICards, gameStage } = this.state;
    console.log('dealing, gamestage: ', gameStage);

    // reset players turns taken back to false
    Object.values(playerData).forEach(player => {
      player.hasPlayedThisRound = false;
    });

    if (gameStage === 0) {
      // deal players cards
      infoMessages.add('Hole cards dealt.');

      Object.values(playerData).forEach(playerObj => {
        playerObj.hand = [deck.dealCard(), deck.dealCard()];
      });
    } else if (gameStage === 1) {
      // deal the flop
      infoMessages.add('Flop dealt.');
      tableCards = addToTableCards(tableCards, 3);
    } else if (gameStage === 2 || gameStage === 3) {
      // deal the turn/river
      infoMessages.add(gameStage === 2 ? 'Turn dealt.' : 'River dealt.');
      tableCards = addToTableCards(this.state.tableCards, 1);
    } else if (gameStage === 4) {
      displayAICards = true;
      const gameResult = engine.score.getWinner(this.state.playerData, this.state.tableCards);
      infoMessages.add(gameResult.notify);

      // watch for that pesky error
      if (!gameResult.error) {
        console.log('gameResult: ', gameResult);
        if (gameResult.winners.length < 1) throw new Error('No winners in gameResult!');
        // highlight winning cards
        const highlights = this.getHighlightedWinningCards(gameResult);
        playerData = highlights.playerData;
        tableCards = highlights.tableCards;
        // todo: pot splitting and such
      } else infoMessages.add('Got that shitty error.');
    }

    // enable player options as currently the player begins each round
    if (playerData.player.active) playerData = this.enablePlayerOptions(playerData);

    await this.setStatePromise({
      playerData,
      tableCards,
      displayAICards,
      gameStage: gameStage + 1,
      infoMessages,
      currentPlayerID: 'player',
    });

    // begin ticking immediately if player has folded
    if (!playerData.player.active) this.tick();
  };

  // todo: this probably belongs in helpers
  getHighlightedWinningCards = gameResult => {
    // create helper objects of cards used to pass to highlightSelectCards
    const usedCards = new Set();
    const usedKickers = new Set();
    gameResult.winners.forEach(scoreObj => {
      scoreObj.cardsUsed.forEach(card => {
        usedCards.add(card.displayName);
      });
      if (scoreObj.validKickers && scoreObj.validKickers.length) {
        scoreObj.validKickers.forEach(card => {
          usedKickers.add(card.displayName);
        });
      }
    });

    const tableCards = this.state.tableCards.map(card =>
      highlightSelectCards(card, usedCards, 'skyblue')
    );

    // clone all player data, then run through each winner's hand and highlight cards used
    const playerData = clonePlayerData(this.state.playerData);
    gameResult.winners.forEach(scoreObj => {
      // one loop for hand cards
      playerData[scoreObj.owner].hand = playerData[scoreObj.owner].hand.map(card =>
        highlightSelectCards(card, usedCards, 'skyblue')
      );
      // and one for kickers
      if (scoreObj.validKickers && scoreObj.validKickers.length)
        playerData[scoreObj.owner].hand = playerData[scoreObj.owner].hand.map(card =>
          highlightSelectCards(card, usedKickers, 'khaki')
        );
    });
    return { tableCards, playerData };
  };

  // returns a modified playerData object with appropriate options enabled
  enablePlayerOptions = (playerData = clonePlayerData(this.state.playerData), force) => {
    playerData.player.options = {
      Fold: false,
      Call: false,
      Deal: false,
      'New Game': false,
      Raise: false,
    };
    // allow options to be forced for edge cases like last man standing
    if (force) {
      Object.keys(force).forEach(key => (playerData[key] = force[key]));
      return playerData;
    }
    const { options } = playerData.player;
    if (this.state.gameStage === 5) {
      options['New Game'] = true;
    } else {
      const { balance, currentBet, hasPlayedThisRound } = playerData.player;
      const { highBet } = this.state;
      let roundFinished = false;
      options.Call = options.Raise = options.Fold = this.state.playerIsActive;
      if (currentBet === highBet && hasPlayedThisRound) roundFinished = true;
      if (balance < highBet - currentBet || roundFinished) {
        options.Call = options.Raise = false;
      }
      // todo: change when betting increments are implemented
      if (balance < highBet + 10) options.Raise = false;
      if (roundFinished) {
        options.Deal = true;
        options.Fold = false;
      }
    }
    return playerData;
  };

  disablePlayerOptions = (playerData = clonePlayerData(this.state.playerData)) => {
    playerData.player.options = {
      Fold: false,
      Call: false,
      Deal: false,
      'New Game': false,
      Raise: false,
    };
    return playerData;
  };

  tick = async () => {
    await sleep(this.state.sleepTime);

    let playerData = clonePlayerData(this.state.playerData);

    // at gamestage 5 we must allow the player to start a new game
    if (this.state.gameStage >= 5) {
      playerData = this.enablePlayerOptions(playerData);
      return this.setState({ playerData });
    }

    // move to next player
    const currentPlayerID = this.getNextPlayer(this.state.currentPlayerID);

    // start new game and break ticking if all players but one have folded
    if (Object.values(playerData).filter(player => player.active).length < 2) {
      const infoMessages = this.state.infoMessages
        .copy()
        .add(`${playerData[currentPlayerID].fullName} wins since all other players folded.`);
      // todo: handle win
      playerData = this.enablePlayerOptions(playerData, { 'New Game': true });
      return this.setState({ infoMessages });
    }

    // check whether the round is over
    // i.e., this player has played a turn and there's no bet to them
    const { currentBet, hasPlayedThisRound } = playerData[currentPlayerID];
    const { highBet } = this.state;
    // console.log(
    //   `checking if round is over. player: ${currentPlayerID} currentBet: ${currentBet} highBet: ${highBet}, hasPlayedThisRound: ${hasPlayedThisRound}`
    // );
    if (currentBet === highBet && hasPlayedThisRound && currentPlayerID !== 'player')
      return this.deal();

    // enable player options and break ticking if it's the player's turn
    if (currentPlayerID === 'player') {
      playerData = this.enablePlayerOptions(playerData);
      return this.setState({ currentPlayerID, playerData });
    }

    // --- begin ai routine ---

    // is this ai allowed to raise?
    let canRaise = !(hasPlayedThisRound && highBet === currentBet);
    console.log(
      `${currentPlayerID} ${canRaise ? 'could raise' : 'could not raise'} if they wanted.`
    );

    // make their move (call, raise, fold)
    const { decision, totalAmt } = engine.ai.getDecision(
      playerData,
      currentPlayerID,
      canRaise,
      this.state.thresholds
    );

    // totalAmt only used in raise/call
    await this[decision](currentPlayerID)(totalAmt);

    // disable player options
    // *important* this will grab new state as changed by above decision function
    playerData = this.disablePlayerOptions();

    // the sleep should handle any setState lag
    this.setState({ currentPlayerID, playerData });

    await sleep(this.state.sleepTime);

    this.tick();
  };

  fold = playerID => async () => {
    const playerData = clonePlayerData(this.state.playerData);
    let playerIsActive = this.state.playerIsActive;
    playerData[playerID].active = false;
    playerData[playerID].hasPlayedThisRound = true;
    const infoMessages = this.state.infoMessages
      .copy()
      .add(`${playerData[playerID].fullName} folds.`);
    if (playerID === 'player') playerIsActive = false;
    // we use promises so that these actions can be awaited in tick
    const statePromise = await this.setStatePromise({ playerData, playerIsActive, infoMessages });
    if (playerID === 'player') return this.tick();
    return statePromise;
  };

  checkBalance = amountRequired => {
    const { balance } = this.state.playerData.player;
    if (balance < amountRequired) return false;
    return true;
  };

  makeBet = async (playerID, action, amount) => {
    const playerData = clonePlayerData(this.state.playerData);
    let { highBet, potAmt } = this.state;
    const amountRequired = highBet - playerData[playerID].currentBet;

    if (playerID === 'player') {
      if (!this.checkBalance(amountRequired)) {
        return window.alert('Sorry, you cannot afford to bet that much!');
      }
      // todo: a bunch of other verifications
      amount = amountRequired;
      // todo: even this out so that ai returns a raise amount (like player) instead of a total?
    }

    // mark player as having had a turn
    playerData[playerID].hasPlayedThisRound = true;

    // subtract from balance, add to pot, and set new high bet
    playerData[playerID].balance -= amount;
    playerData[playerID].currentBet += amount;
    potAmt += amount;
    highBet = Math.max(highBet, playerData[playerID].currentBet);

    const infoMessages = this.state.infoMessages
      .copy()
      .add(`${playerData[playerID].fullName} ${action}s. Total added: $${amount}.`);

    const statePromise = await this.setStatePromise({ playerData, potAmt, infoMessages, highBet });
    if (playerID === 'player') return this.tick();
    return statePromise;
  };

  raise = playerID => async amount => {
    console.log('raise! by ', playerID, amount);
    return this.makeBet(playerID, 'raise', amount);
  };

  call = playerID => async amount => {
    if (playerID === 'player') amount = 0;
    // for player, amount will be calculated in makeBet
    return this.makeBet(playerID, 'call', amount);
  };

  render() {
    const { playerData, tableCards, displayAICards, highBet } = this.state;
    return (
      <Fragment>
        <StyledPoker>
          <InfoPanel messages={this.state.infoMessages} />
          {Object.values(this.state.playerData)
            .filter(data => data.id !== 'player')
            .sort((data1, data2) => data1.id - data2.id)
            .map((data, i) => (
              <AI key={data.id} data={data} tableCards={tableCards} showCards={displayAICards} />
            ))}
          <Balance area="pot" amount={this.state.potAmt} />
          <Table cards={tableCards} />
          <PlayerDashboard
            data={playerData.player}
            render={() => (
              <Fragment>
                <PlayerHand hand={playerData.player.hand} />
                <OptionsPanel
                  options={playerData.player.options}
                  callbacks={{
                    Fold: this.fold('player'),
                    Call: this.call('player'),
                    Deal: this.deal,
                    'New Game': this.newGame,
                    Raise: this.raise('player'),
                  }}
                  requiredToCall={highBet - playerData.player.currentBet}
                />
              </Fragment>
            )}
          />
        </StyledPoker>
        <button
          onClick={() => {
            let { debug } = this.state;
            debug = !debug;
            this.setState({ debug });
          }}>{`Debug Mode (${this.state.debug ? 'ON' : 'OFF'})`}</button>
      </Fragment>
    );
  }
}

export default Poker;
