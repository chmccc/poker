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

// helper function which clones a hand and all cards therein, applying an optional callback to each card
const cloneHand = (hand, callback) => {
  return hand.map(card => {
    const newCard = new Card(card.value, card.suit);
    if (card.highlight) newCard.highlight = true;
    return callback ? callback(newCard) : newCard;
  });
}

// helper function which deep clones a playerData object
const clonePlayerData = (oldPlayerData) => {
  return Object.values(oldPlayerData).reduce((playerData, playerObj) => {
    playerData[playerObj.id] = { ...playerObj, hand: cloneHand(playerObj.hand) };
    return playerData;
  }, {});

}


const fullNames = {
  ai1: "AI Opponent 1",
  ai2: "AI Opponent 2",
  ai3: "AI Opponent 3",
  player: "Player",
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
      playerOptions: { Fold: false, Call: false, Deal: true, "New Game": false },
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
      const newPlayerData = clonePlayerData(this.state.playerData);
      Object.values(newPlayerData).forEach(playerObj => {
        playerObj.hand = [deck.dealCard(), deck.dealCard()];
      });
      this.setState({
        playerData: newPlayerData,
        playerOptions: { Deal: false, Fold: playerIsActive, Call: playerIsActive, "New Game": false },
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 1) { // deal the flop
      infoMessages.add('Flop dealt.')
      const newTableCards = addToTableCards(this.state.tableCards, 3);
      this.setState({
        tableCards: newTableCards,
        playerOptions: { Deal: false, Fold: playerIsActive, Call: playerIsActive, "New Game": false },
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 2 || gameStage === 3) { // deal the turn/river
      infoMessages.add(gameStage === 2 ? 'Turn dealt.' : 'River dealt.');
      const newTableCards = addToTableCards(this.state.tableCards, 1);
      this.setState({
        tableCards: newTableCards,
        playerOptions: { Deal: false, Fold: playerIsActive, Call: playerIsActive, "New Game": false },
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 4) {
      const winnerObj = getWinner(this.state.playerData, this.state.tableCards);
      const playerScoreObj = playerIsActive ? getScore(this.state.playerData.player.hand, this.state.tableCards, 'player') : null;
      infoMessages.add(`Game over. ${fullNames[winnerObj.owner]} won with ${winnerObj.type}.`);
      if (winnerObj.owner !== 'player' && playerIsActive) {
        infoMessages.add(`You had ${playerScoreObj.type}`);
      }
      // highlight cards used in winning hand
      const {newTableCards, newPlayerData} = this.getHighlightedWinnerCards(winnerObj.owner, winnerObj.cardsUsed);
      this.setState({
        playerData: newPlayerData,
        tableCards: newTableCards,
        displayAICards: true,
        gameStage: gameStage + 1,
        playerOptions: { Fold: false, Call: false, Deal: false, "New Game": true },
        infoMessages,
      });
    }
    if (!playerIsActive && gameStage < 4) setTimeout(this.deal, 2000);
  }

  getHighlightedWinnerCards = (winner, usedCards) => {
    // create helper object of cards used for faster lookup
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

    const newTableCards = this.state.tableCards.map(card => shouldHighlight(card));
    const newHandCards = cloneHand(this.state.playerData[winner].hand, shouldHighlight);

    // dupe all playerData then replace only winner's
    const newPlayerData = clonePlayerData(this.state.playerData);
    newPlayerData[winner] = { ...newPlayerData[winner], hand: newHandCards };
    return { newTableCards, newPlayerData };

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
      playerOptions: { Fold: false, Call: false, Deal: true, "New Game": false },
      displayAICards: false,
      gameStage: 0,
      playerIsActive: true,
      infoMessages: new InfoMessagesQueue(),
    });
  }

  fold = (playerID) => {
    const newPlayerData = clonePlayerData(this.state.playerData);
    newPlayerData[playerID].active = false;
    const playerIsActive = playerID === 'player' ? false : this.state.playerIsActive;
    const infoMessages = this.state.infoMessages.copy().add(`${fullNames[playerID]} folds.`);
    this.setState({
      playerData: newPlayerData,
      playerIsActive,
      playerOptions: { Fold: false, Call: false, Deal: false, "New Game": false },
      infoMessages,
    }, this.deal);
  }

  raise = (playerID) => {}

  call = (playerID) => {
    this.deal();
  }

  render() {
    const { playerData, tableCards, displayAICards, playerOptions } = this.state;
    return (
      <div id="Poker">
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
            Fold: this.fold,
            Call: this.call,
            Deal: this.deal,
            "New Game": this.newGame
          }}
          options={playerOptions}
        />
      </div>
    );
  }
}

export default Poker;
