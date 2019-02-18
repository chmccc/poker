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
      fullRotation: false,
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
    });
  };

  deal = () => {
    const { gameStage, playerIsActive } = this.state;
    let infoMessages = this.state.infoMessages.copy();

    if (gameStage === 0) {
      // deal players cards
      infoMessages.add('Hole cards dealt.');
      const newPlayerData = clonePlayerData(this.state.playerData);

      // DEBUG STUFF
      if (this.state.debug) {
        infoMessages.add('<<DEBUG MODE: Hole cards overridden. >>');
        debugHolePlayerData(newPlayerData);
      } else {
        Object.values(newPlayerData).forEach(playerObj => {
          playerObj.hand = [deck.dealCard(), deck.dealCard()];
        });
      }
      newPlayerData.player.options = {
        Deal: false,
        Fold: playerIsActive,
        Call: playerIsActive,
        'New Game': false,
        Raise: playerIsActive,
      };
      this.setState({
        playerData: newPlayerData,
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 1) {
      // deal the flop
      infoMessages.add('Flop dealt.');
      const newTableCards = addToTableCards(this.state.tableCards, 3);
      const newPlayerData = clonePlayerData(this.state.playerData);
      newPlayerData.player.options = {
        Deal: false,
        Fold: playerIsActive,
        Call: playerIsActive,
        'New Game': false,
        Raise: playerIsActive,
      };
      this.setState({
        playerData: newPlayerData,
        tableCards: newTableCards,
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 2 || gameStage === 3) {
      // deal the turn/river
      infoMessages.add(gameStage === 2 ? 'Turn dealt.' : 'River dealt.');
      let newTableCards = addToTableCards(this.state.tableCards, 1);
      const newPlayerData = clonePlayerData(this.state.playerData);
      // DEBUG RIVER OVERRIDE:
      if (gameStage === 3 && this.state.debug) {
        infoMessages.add('<< DEBUG MODE: River overridden. >>');
        newTableCards = debugTableCards();
      }

      newPlayerData.player.options = {
        Deal: false,
        Fold: playerIsActive,
        Call: playerIsActive,
        'New Game': false,
        Raise: playerIsActive,
      };

      this.setState({
        playerData: newPlayerData,
        tableCards: newTableCards,
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 4) {
      let gameResult;
      let displayAICards = true;
      let newPlayerData = this.state.playerData;
      let newTableCards = this.state.tableCards;
      gameResult = getWinner(this.state.playerData, this.state.tableCards);
      infoMessages.add(gameResult.notify);

      // watch for that pesky error
      if (!gameResult.error) {
        console.log('gameResult: ', gameResult);
        if (gameResult.winners.length < 1) throw new Error('No winners in gameResult!');

        // highlight winning cards
        const highlights = this.getHighlightedWinningCards(gameResult);
        newPlayerData = highlights.playerData;
        newTableCards = highlights.tableCards;
        // todo: pot splitting and such
      }

      newPlayerData.player.options = {
        Fold: false,
        Call: false,
        Deal: false,
        'New Game': true,
        Raise: false,
      };

      this.setState({
        playerData: newPlayerData,
        tableCards: newTableCards,
        displayAICards,
        gameStage: gameStage + 1,
        infoMessages,
      });
    }
    if (!playerIsActive && gameStage < 4) setTimeout(this.deal, 1000);
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

  enablePlayerOptions = () => {
    const playerData = clonePlayerData(this.state.playerData);
    playerData.player.options = {
      Fold: false,
      Call: false,
      Deal: false,
      'New Game': false,
      Raise: false,
    };
    if (this.state.gameStage === 4) playerData.player.options.NewGame = true;
    else {
      const { balance, currentBet } = playerData.player;
      const { highBet } = this.state;
      playerData.player.options.Call = this.playerIsActive && balance >= highBet - currentBet;
      // todo: change when betting increments are implemented
      playerData.player.options.Raise = this.playerIsActive && balance >= highBet - currentBet + 10;
      playerData.player.options.Fold = true;
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
    const currentPlayerID = this.getNextPlayer(this.state.currentPlayerID);
    await this.setState({ currentPlayerID });
    if (currentPlayerID === 'player') {
      // if player, set the player options and stop tick cycle
      return this.enablePlayerOptions();
    }
    await this.disablePlayerOptions();

    // begin ai-only behavior
    const playerData = clonePlayerData(this.state.playerData);
    const { [currentPlayerID]: currPlayerData, highBet } = playerData;
    // is this person allowed to raise? if not, deal
    let canRaise = highBet > currPlayerData.currentBet;

    await sleep(1000);

    // make their move (call, raise, fold)
    const { decision, totalAmt } = getDecision(playerData, currentPlayerID, canRaise);
    await this[decision](currentPlayerID)(totalAmt);

    // determine whether the round is over or we need to keep ticking
    const nextPlayer = this.getNextPlayer(currentPlayerID);
    const { currentBet, hasPlayedThisRound } = playerData[nextPlayer];
    if (currentBet === highBet && hasPlayedThisRound) {
      // the next guy is already called and has already had a turn
      // then the round is over and we deal
      return this.deal();
    } else this.tick();
  };

  fold = playerID => async () => {
    const playerData = clonePlayerData(this.state.playerData);
    let playerIsActive = this.state.playerIsActive;
    playerData[playerID].active = false;
    const infoMessages = this.state.infoMessages
      .copy()
      .add(`${playerData[playerID].fullName} folds.`);
    if (playerID === 'player') {
      playerIsActive = false;
      await this.disablePlayerOptions();
      // todo: a bunch of other validations
      // start ticking
      return this.tick();
    }
    return this.setStatePromise({ playerData, playerIsActive, infoMessages });
  };

  raise = playerID => async amount => {
    const playerData = clonePlayerData(this.state.playerData);
    if (playerID === 'player') {
      // verify the player has that much money
      const { balance } = playerData.player;
      if (balance < amount) {
        return window.alert('Sorry, you cannot bet more than you have!');
      }
      // todo: a bunch of other verifications
    }
    // subtract from balance and add to pot
    playerData[playerID].balance -= amount;
    playerData[playerID].currentBet += amount;
    const potAmt = this.state.potAmt + amount;
    const infoMessages = this.state.infoMessages.copy().add(`${playerID} raises $${amount}.`);
    return this.setStatePromise({ playerData, potAmt, infoMessages, highBet: amount });
  };

  call = playerID => async amount => {
    const playerData = clonePlayerData(this.state.playerData);
    if (playerID === 'player') {
      // check the player has the required amount
      const { balance } = playerData.player;
      const amountRequired =
        Math.max(...Object.values(this.state.playerData).map(playerObj => playerObj.currentBet)) -
        playerData.player.currentBet;
      if (balance < amountRequired) {
        return window.alert(
          'Sorry, you cannot afford to call, and there is no "all in" feature yet!'
        );
      } else amount = amountRequired;
    }
    // subtract from balance and add to pot
    playerData[playerID].balance -= amount;
    playerData[playerID].currentBet += amount;
    const potAmt = this.state.potAmt + amount;
    const infoMessages = this.state.infoMessages.copy().add(`${playerID} calls.`);
    return this.setStatePromise({ playerData, potAmt, infoMessages });
  };

  render() {
    const { playerData, tableCards, displayAICards, highBet } = this.state;
    return (
      <Fragment>
        <StyledPoker>
          <InfoPanel messages={this.state.infoMessages} />
          <AI
            data={playerData.ai1}
            tableCards={tableCards}
            key={playerData.ai1.id}
            showCards={displayAICards}
          />
          <AI
            data={playerData.ai2}
            tableCards={tableCards}
            key={playerData.ai2}
            showCards={displayAICards}
          />
          <Balance area="pot" amount={this.state.potAmt} />
          <AI
            data={playerData.ai3}
            tableCards={tableCards}
            key={playerData.ai3.id}
            showCards={displayAICards}
          />
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
                  requiredToCall={this.state.highBet - playerData.player.currentBet}
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
