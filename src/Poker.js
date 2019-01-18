import React, { Component } from 'react';
import { Deck, Card } from './util/deck.js';
import Table from './components/Table.js';
import PlayerDashboard from './components/PlayerDashboard';
import AI from './components/AI';
import { InfoMessagesQueue } from './util/infoMessagesQueue';
import InfoPanel from './components/InfoPanel';
import { getWinner, getScore } from './util/engine.js';

const deck = new Deck();

const addToTableCards = (oldTableCards, numNewCards) => {

  return oldTableCards.concat(Array(numNewCards).fill(null).map(() => deck.dealCard()))
}

class Poker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playerData: {
        player: { id: 'player', active: true, hand: [] },
        ai1: { id: 'ai1', active: true, hand: [] },
        ai2: { id: 'ai2', active: true, hand: [] },
        ai3: { id: 'ai3', active: true, hand: [] },
      },
      tableCards: [],
      playerOptions: { fold: false, call: false, deal: true, newGame: false },
      displayAICards: false,
      gameStage: 0,
      playerIsActive: true,
      infoMessages: new InfoMessagesQueue(),
    }
  }

  deal = () => {
    const { gameStage, playerIsActive } = this.state;
    let infoMessages = this.state.infoMessages.copy();
    if (gameStage === 0) { // deal players cards
      infoMessages.add('Hole cards dealt.')
      this.setState({
        playerData: {
          player: {id: 'player', active: true, hand: [deck.dealCard(), deck.dealCard()]},
          ai1: {id: 'ai1', active: true, hand: [deck.dealCard(), deck.dealCard()]},
          ai2: {id: 'ai2', active: true, hand: [deck.dealCard(), deck.dealCard()]},
          ai3: {id: 'ai3', active: true, hand: [deck.dealCard(), deck.dealCard()]}
        },
        playerOptions: { deal: false, fold: playerIsActive, call: playerIsActive, newGame: false },
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 1) { // deal the flop
      infoMessages.add('Flop dealt.')
      const newTableCards = addToTableCards(this.state.tableCards, 3);
      this.setState({
        tableCards: newTableCards,
        playerOptions: { deal: false, fold: playerIsActive, call: playerIsActive, newGame: false },
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 2 || gameStage === 3) { // deal the turn/river
      infoMessages.add(gameStage === 2 ? 'Turn dealt.' : 'River dealt.');
      const newTableCards = addToTableCards(this.state.tableCards, 1);
      this.setState({
        tableCards: newTableCards,
        playerOptions: { deal: false, fold: playerIsActive, call: playerIsActive, newGame: false },
        gameStage: gameStage + 1,
        infoMessages,
      });
    }
    if (gameStage === 4) {
      const winnerObj = getWinner(this.state.playerData, this.state.tableCards);
      const playerScoreObj = playerIsActive ? getScore(this.state.playerData.player.hand, this.state.tableCards, 'player') : null;
      infoMessages.add(`Game over. ${winnerObj.owner} won with ${winnerObj.type}.`);
      if (winnerObj.owner !== 'player' && playerIsActive) {
        infoMessages.add(`You had ${playerScoreObj.type}`);
      }
      // highlight cards used in winning hand
      const {tableCards, playerData} = this.getHighlightedWinnerCards(winnerObj.owner, winnerObj.cardsUsed);
      this.setState({
        playerData,
        tableCards,
        displayAICards: true,
        gameStage: gameStage + 1,
        playerOptions: { fold: false, call: false, deal: false, newGame: true },
        infoMessages,
      });
    }
    if (!playerIsActive && gameStage < 4) setTimeout(this.deal, 2000);
  }

  getHighlightedWinnerCards = (winner, usedCards) => {

    // array -> obj
    const used = usedCards.reduce((acc, card) => {
      acc[card.displayName] = card;
      return acc;
    }, {});

    const shouldHighlight = (card) => {
      if (used[card.displayName]) {
        const newCard = new Card(card.value, card.suit);
        newCard.highlight = true;
        return newCard;
      } else return card;
    }

    const tableCards = this.state.tableCards.map(card => shouldHighlight(card));
    const newHandCards = this.state.playerData[winner].hand.map(card => shouldHighlight(card));

    // dupe all playerData except winner's
    const playerData = { ...this.state.playerData, [winner]: { ...this.state.playerData[winner], hand: newHandCards} };

    return { tableCards, playerData };

  }

  newGame = () => {
    deck.reset();
    this.setState({
      playerData: {
        player: { id: 'player', active: true, hand: [] },
        ai1: { id: 'ai1', active: true, hand: [] },
        ai2: { id: 'ai2', active: true, hand: [] },
        ai3: { id: 'ai3', active: true, hand: [] },
      },
      tableCards: [],
      playerOptions: { fold: false, call: false, deal: true, newGame: false },
      displayAICards: false,
      gameStage: 0,
      playerIsActive: true,
      infoMessages: new InfoMessagesQueue(),
    });
  }

  fold = (playerID) => {
    this.setState({
      playerIsActive: false,
      playerOptions: { fold: false, call: false, deal: false, newGame: false }
    }, this.deal);
  }

  raise = (playerID) => {}

  call = (playerID) => {
    this.deal();
  }

  render() {
    const { playerData, tableCards, displayAICards, playerOptions } = this.state;
    return (
      <div className="App">
        <InfoPanel
          messages={this.state.infoMessages}
        />
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
            fold: this.fold,
            raise: this.raise,
            call: this.call,
            deal: this.deal,
            newGame: this.newGame
          }}
          options={playerOptions}
        />
      </div>
    );
  }
}

export default Poker;
