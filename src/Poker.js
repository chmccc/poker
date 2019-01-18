import React, { Component } from 'react';
import { Deck } from './util/deck.js';
import Table from './components/Table.js';
import PlayerDashboard from './components/PlayerDashboard';
import AI from './components/AI';

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
    }
  }

  deal = () => {
    const { gameStage, playerIsActive } = this.state;
    console.log('deal! gamestage: ', gameStage);
    console.log('player is still playing: ', playerIsActive);
    if (gameStage === 0) { // deal players cards
      this.setState({
        playerData: {
          player: {id: 'player', active: true, hand: [deck.dealCard(), deck.dealCard()]},
          ai1: {id: 'ai1', active: true, hand: [deck.dealCard(), deck.dealCard()]},
          ai2: {id: 'ai2', active: true, hand: [deck.dealCard(), deck.dealCard()]},
          ai3: {id: 'ai3', active: true, hand: [deck.dealCard(), deck.dealCard()]}
        },
        playerOptions: { deal: false, fold: playerIsActive, call: playerIsActive, newGame: false },
        gameStage: gameStage + 1
      });
    }
    if (gameStage === 1) { // deal the flop
      const newTableCards = addToTableCards(this.state.tableCards, 3);
      this.setState({
        tableCards: newTableCards,
        playerOptions: { deal: false, fold: playerIsActive, call: playerIsActive, newGame: false },
        gameStage: gameStage + 1
      });
    }
    if (gameStage === 2 || gameStage === 3) { // deal the turn/river
      const newTableCards = addToTableCards(this.state.tableCards, 1);
      this.setState({
        tableCards: newTableCards,
        playerOptions: { deal: false, fold: playerIsActive, call: playerIsActive, newGame: false },
        gameStage: gameStage + 1
      });
    }
    if (gameStage === 4) this.gameOver();
    if (!playerIsActive && gameStage < 4) setTimeout(this.deal, 2000);
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
    });
  }

  fold = (playerID) => {
    this.setState({
      playerIsActive: false,
      playerOptions: { fold: false, call: false, deal: false, newGame: false }
    }, this.deal);
  }

  gameOver = () => {
    // const winnerData = getWinner()
    const { gameStage } = this.state;
    this.setState({
      displayAICards: true,
      gameStage: gameStage + 1,
      playerOptions: { fold: false, call: false, deal: false, newGame: true }
    });
  }

  raise = (playerID) => {}

  call = (playerID) => {
    this.deal();
  }

  render() {
    const { playerData, tableCards, displayAICards, playerOptions } = this.state;
    return (
      <div className="App">
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
