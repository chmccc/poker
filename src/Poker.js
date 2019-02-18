import React, { Component, Fragment } from 'react';
import styled from 'styled-components';

import { InfoMessagesQueue } from './util/infoMessagesQueue';
import { getWinner } from './util/engine.js';
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
import { getDecision } from './util/ai';

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
  grid-template-rows: 70px 150px 130px 220px;
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
    };
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
      currPlayerID: 'player',
    });
  };

  deal = async () => {
    let playerData = clonePlayerData(this.state.playerData);
    let infoMessages = this.state.infoMessages.copy();
    let tableCards = this.state.tableCards;
    let { displayAICards, gameStage } = this.state;
    const { playerIsActive } = this.state;
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
      const gameResult = getWinner(this.state.playerData, this.state.tableCards);
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

    await this.setState({
      playerData,
      tableCards,
      displayAICards,
      gameStage: gameStage + 1,
      infoMessages,
    });

    if (!playerIsActive) return this.tick();
    return this.enablePlayerOptions();
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

  enablePlayerOptions = async () => {
    const playerData = clonePlayerData(this.state.playerData);
    playerData.player.options = {
      Fold: false,
      Call: false,
      Deal: false,
      'New Game': false,
      Raise: false,
    };
    const { options } = playerData.player;
    if (this.state.gameStage === 5) {
      options['New Game'] = true;
      return this.setState({ playerData });
    } else {
      const { balance, currentBet, hasPlayedThisRound } = playerData.player;
      const { highBet } = this.state;
      let roundFinished = false;
      options.Call = options.Raise = options.Fold = this.state.playerIsActive;
      if (currentBet === highBet && hasPlayedThisRound) roundFinished = true;
      if (balance < highBet - currentBet || roundFinished) {
        options.Call = options.Raise = false;
      }
      if (balance < highBet + 10) options.Raise = false;
      if (roundFinished) {
        options.Deal = true;
        options.Fold = false;
      }
      // todo: change when betting increments are implemented
    }
    return this.setStatePromise({ playerData });
  };

  disablePlayerOptions = () => {
    const playerData = clonePlayerData(this.state.playerData);
    playerData.player.options = {
      Fold: false,
      Call: false,
      Deal: false,
      'New Game': false,
      Raise: false,
    };
    return this.setStatePromise({ playerData });
  };

  tick = async () => {
    // whose move is it next?
    if (Object.values(this.state.playerData).filter(player => player.active).length < 2) {
      window.alert('Errbody folded');
      return this.newGame();
    }
    const currentPlayerID = this.getNextPlayer(this.state.currentPlayerID);
    await this.setState({ currentPlayerID });

    const playerData = clonePlayerData(this.state.playerData);
    const { [currentPlayerID]: currPlayerData } = playerData;
    const { currentBet, hasPlayedThisRound } = currPlayerData;
    const { highBet } = this.state;

    if (this.state.gameStage >= 5) return this.enablePlayerOptions();
    // check whether the round is over
    // i.e., this player has played a turn and there's no bet to them
    // console.log(
    //   `checking if round is over. currentBet: ${currentBet} highBet: ${highBet}, hasPlayedThisRound: ${hasPlayedThisRound}`
    // );
    if (currentBet === highBet && hasPlayedThisRound) return this.deal();

    if (currentPlayerID === 'player') {
      // if player, set the player options and stop tick cycle
      return this.enablePlayerOptions();
    }
    await this.disablePlayerOptions();

    // begin ai-only behavior

    // is this ai allowed to raise?
    let canRaise = !currPlayerData.hasPlayedThisRound || highBet > currPlayerData.currentBet;

    await sleep(500);

    // make their move (call, raise, fold)
    const { decision, totalAmt } = getDecision(playerData, currentPlayerID, canRaise);
    await this[decision](currentPlayerID)(totalAmt);

    await sleep(500);
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
    if (playerID === 'player') {
      playerIsActive = false;
      await this.disablePlayerOptions();
      // todo: a bunch of other validations
      // start ticking
      await this.setState({ playerData, playerIsActive, infoMessages });
      return this.tick();
    }
    return this.setStatePromise({ playerData, playerIsActive, infoMessages });
  };

  raise = playerID => async amount => {
    const playerData = clonePlayerData(this.state.playerData);
    let { highBet } = this.state;
    if (playerID === 'player') {
      // verify the player has that much money
      const { balance } = playerData.player;
      const amountRequired = highBet - playerData.player.currentBet;
      if (balance < amountRequired) {
        return window.alert('Sorry, you cannot afford to raise that much!');
      } else amount += amountRequired; // add the raise to the call
      // todo: a bunch of other verifications
    }
    playerData[playerID].hasPlayedThisRound = true;
    // subtract from balance and add to pot
    playerData[playerID].balance -= amount;
    playerData[playerID].currentBet += amount;
    const potAmt = this.state.potAmt + amount;
    const infoMessages = this.state.infoMessages
      .copy()
      .add(`${playerData[playerID].fullName} raises ($${amount}).`);
    highBet += amount;
    if (playerID === 'player') {
      await this.setState({ playerData, potAmt, infoMessages, highBet });
      return this.tick();
    }
    return this.setStatePromise({ playerData, potAmt, infoMessages, highBet });
  };

  call = playerID => async amount => {
    const playerData = clonePlayerData(this.state.playerData);
    const { highBet } = this.state;
    if (playerID === 'player') {
      // check the player has the required amount
      const { balance } = playerData.player;
      const amountRequired = highBet - playerData.player.currentBet;
      if (balance < amountRequired) {
        return window.alert(
          'Sorry, you cannot afford to call, and there is no "all in" feature yet!'
        );
      } else amount = amountRequired;
    }
    playerData[playerID].hasPlayedThisRound = true;
    // subtract from balance and add to pot
    playerData[playerID].balance -= amount;
    playerData[playerID].currentBet += amount;
    const potAmt = this.state.potAmt + amount;
    const infoMessages = this.state.infoMessages
      .copy()
      .add(`${playerData[playerID].fullName} calls. ($${amount})`);
    if (playerID === 'player') {
      await this.setState({ playerData, potAmt, infoMessages });
      return this.tick();
    }
    return this.setStatePromise({ playerData, potAmt, infoMessages });
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
            .map(data => (
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
