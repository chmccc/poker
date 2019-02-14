import React, { Component } from 'react';
import styled from 'styled-components';

import { InfoMessagesQueue } from './util/infoMessagesQueue';
import { getWinner } from './util/engine.js';
import {
  clonePlayerData,
  highlightSelectCards,
  addToTableCards,
  createHand,
  createBasePlayerData,
} from './util/helpers';
import { deck } from './util/deck.js'; // this is the initialized deck instance

import PlayerDashboard from './components/PlayerDashboard';
import Table from './components/Table.js';
import AI from './components/AI';
import InfoPanel from './components/InfoPanel';
import Balance from './components/Balance';

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

// todo: merge into playerData
const fullNames = {
  ai1: 'AI Opponent 1',
  ai2: 'AI Opponent 2',
  ai3: 'AI Opponent 3',
  player: 'Player',
};

class Poker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playerData: createBasePlayerData(),
      tableCards: [],
      displayAICards: false,
      gameStage: 0,
      playerIsActive: true,
      infoMessages: new InfoMessagesQueue(),
      debug: false,
      potAmt: 0,
      currentPlayerID: 'player',
      fullRotation: false,
      highBet: 0,
    };
  }

  /** Returns a string for the next active player in the turn order */
  getNextPlayer = currentPlayerID => {
    // todo: refac to linked list?
    const playerOrder = ['player', 'ai1', 'ai2', 'ai3', 'player', 'ai1', 'ai2', 'ai3'];
    let index = playerOrder.indexOf(currentPlayerID);
    while (!this.state.playerData[playerOrder[++index]].active) {}
    return playerOrder[index];
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

  fold = async playerID => {
    const newPlayerData = clonePlayerData(this.state.playerData);
    newPlayerData[playerID].active = false;
    const playerIsActive = playerID === 'player' ? false : this.state.playerIsActive;
    if (playerID === 'player') {
      newPlayerData.player.options = {
        Fold: false,
        Call: false,
        Deal: false,
        'New Game': false,
        Raise: false,
      };
    }
    const infoMessages = this.state.infoMessages.copy().add(`${fullNames[playerID]} folds.`);
    await this.setState(
      {
        playerData: newPlayerData,
        playerIsActive,
        infoMessages,
      },
      this.deal
    );
  };

  next = () => {
    // who's move is it next?
    const nextPlayer = this.getNextPlayer(this.state.currentPlayerID);
    // is this person allowed to bet?
    // refer to ai engine
  };

  raise = async (playerID, amount) => {
    const infoMessages = this.state.infoMessages.copy();
    const playerData = clonePlayerData(this.state.playerData);
    // verify the player has that much money
    if (playerData[playerID].balance < amount)
      return window.alert('Sorry, you cannot raise more than you have!');
    // verify that the raise exceeds the call
    // if so, subtract from player and add to pot
    playerData[playerID].balance -= amount;
    playerData[playerID].currentBet += amount;
    const potAmt = this.state.potAmt + amount;
    infoMessages.add(`${playerID} raises $${amount}.`);
    await this.setState({
      playerData,
      potAmt,
      infoMessages,
    });
    this.deal();
  };

  call = async playerID => {
    // check the required amount
    const amountRequired = Math.max(
      ...Object.values(this.state.playerData).map(playerObj => playerObj.currentBet)
    );
    // if not, amount is all in
    // add that amount to the pot
    const infoMessages = this.state.infoMessages.copy();
    infoMessages.add(`${playerID} calls.`);
    await this.setState({ infoMessages });
    // next action... ?
    this.deal();
  };

  render() {
    const { playerData, tableCards, displayAICards, playerOptions } = this.state;
    return (
      <React.Fragment>
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
            callbacks={{
              Fold: this.fold,
              Call: this.call,
              Deal: this.deal,
              'New Game': this.newGame,
              Raise: this.raise,
            }}
            options={playerData.player.options}
          />
        </StyledPoker>
        <button
          onClick={() => {
            let { debug } = this.state;
            debug = !debug;
            this.setState({ debug });
          }}>{`Debug Mode (${this.state.debug ? 'ON' : 'OFF'})`}</button>
      </React.Fragment>
    );
  }
}

export default Poker;
