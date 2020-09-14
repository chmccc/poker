import React, { Component } from "react";
import styled from "styled-components";

import { InfoMessagesQueue } from "./util/infoMessagesQueue";
import { getWinner } from "./util/engine.js";
import {
  clonePlayerData,
  shouldHighlight,
  addToTableCards,
} from "./util/helpers";
import { deck } from "./util/deck.js"; // this is the initialized deck instance

import PlayerDashboard from "./components/PlayerDashboard";
import Table from "./components/Table.js";
import AI from "./components/AI";
import InfoPanel from "./components/InfoPanel";

/* STYLED COMPONENTS */

const StyledPoker = styled.div`
  padding-top: 10px;
  margin: 0 auto;
  max-width: 1000px;
  color: white;
  display: grid;
  width: 950px;
  grid-template-columns: 20% 60% 20%;
  grid-template-rows: 68px 130px 150px 200px;
  grid-row-gap: 10px;
  grid-template-areas:
    'infopanel infopanel infopanel'
    '. ai2 .'
    'ai1 table ai3'
    'player player player';
  background-color: rgb(0, 80, 0);
  border-radius: 20px;
`;

// todo: merge into playerData
const fullNames = {
  ai1: "AI Opponent 1",
  ai2: "AI Opponent 2",
  ai3: "AI Opponent 3",
  player: "Player",
};

class Poker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playerData: {
        player: { id: "player", active: true, hand: [] },
        ai1: { id: "ai1", active: true, hand: [] },
        ai2: { id: "ai2", active: true, hand: [] },
        ai3: { id: "ai3", active: true, hand: [] },
      },
      tableCards: [],
      playerOptions: {
        Fold: false,
        Call: false,
        Deal: true,
        "New Game": false,
      },
      displayAICards: false,
      gameStage: 0,
      playerIsActive: true,
      infoMessages: new InfoMessagesQueue(),
    };
  }

  deal = () => {
    const { gameStage, playerIsActive } = this.state;
    let infoMessages = this.state.infoMessages.copy();

    if (gameStage === 0) {
      // deal players cards
      infoMessages.add("Hole cards dealt.");
      const newPlayerData = clonePlayerData(this.state.playerData);
      Object.values(newPlayerData).forEach((playerObj) => {
        playerObj.hand = [deck.dealCard(), deck.dealCard()];
      });
      this.setState({
        playerData: newPlayerData,
        playerOptions: {
          Deal: false,
          Fold: playerIsActive,
          Call: playerIsActive,
          "New Game": false,
        },
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 1) {
      // deal the flop
      infoMessages.add("Flop dealt.");
      const newTableCards = addToTableCards(this.state.tableCards, 3);
      this.setState({
        tableCards: newTableCards,
        playerOptions: {
          Deal: false,
          Fold: playerIsActive,
          Call: playerIsActive,
          "New Game": false,
        },
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 2 || gameStage === 3) {
      // deal the turn/river
      infoMessages.add(gameStage === 2 ? "Turn dealt." : "River dealt.");
      const newTableCards = addToTableCards(this.state.tableCards, 1);
      this.setState({
        tableCards: newTableCards,
        playerOptions: {
          Deal: false,
          Fold: playerIsActive,
          Call: playerIsActive,
          "New Game": false,
        },
        gameStage: gameStage + 1,
        infoMessages,
      });
    }

    if (gameStage === 4) {
      let gameResult;
      let displayAICards = true;
      let playerData = this.state.playerData;
      let tableCards = this.state.tableCards;
      gameResult = getWinner(this.state.playerData, this.state.tableCards);
      infoMessages.add(gameResult.notify);
      // watch for error
      if (!gameResult.error) {
        console.log("gameResult: ", gameResult);
        if (gameResult.winners.length < 1)
          throw new Error("No winners in gameResult!");
        // highlight winning cards
        const highlights = this.getHighlightedWinningCards(gameResult);
        playerData = highlights.playerData;
        tableCards = highlights.tableCards;
        // todo: pot splitting and such
      }
      this.setState({
        playerData,
        tableCards,
        displayAICards,
        gameStage: gameStage + 1,
        playerOptions: {
          Fold: false,
          Call: false,
          Deal: false,
          "New Game": true,
        },
        infoMessages,
      });
    }
    if (!playerIsActive && gameStage < 4) setTimeout(this.deal, 1000);
  };

  getHighlightedWinningCards = (gameResult) => {
    // create helper object of cards used to pass to shouldHighlight
    const usedCards = new Set();
    gameResult.winners.forEach((scoreObj) => {
      scoreObj.cardsUsed.forEach((card) => {
        usedCards.add(card.displayName);
      });
    });

    const tableCards = this.state.tableCards.map((card) =>
      shouldHighlight(card, usedCards)
    );

    // clone all player data, then run through each winner's hand and highlight cards used
    const playerData = clonePlayerData(this.state.playerData);
    gameResult.winners.forEach((scoreObj) => {
      playerData[scoreObj.owner].hand = playerData[scoreObj.owner].hand.map(
        (card) => shouldHighlight(card, usedCards)
      );
    });
    return { tableCards, playerData };
  };

  newGame = () => {
    deck.reset();
    console.clear();
    this.setState({
      playerData: {
        player: { id: "player", active: true, hand: [] },
        ai1: { id: "ai1", active: true, hand: [] },
        ai2: { id: "ai2", active: true, hand: [] },
        ai3: { id: "ai3", active: true, hand: [] },
      },
      tableCards: [],
      playerOptions: {
        Fold: false,
        Call: false,
        Deal: true,
        "New Game": false,
      },
      displayAICards: false,
      gameStage: 0,
      playerIsActive: true,
      infoMessages: new InfoMessagesQueue(),
    });
  };

  fold = (playerID) => {
    const newPlayerData = clonePlayerData(this.state.playerData);
    newPlayerData[playerID].active = false;
    const playerIsActive =
      playerID === "player" ? false : this.state.playerIsActive;
    const infoMessages = this.state.infoMessages
      .copy()
      .add(`${fullNames[playerID]} folds.`);
    this.setState(
      {
        playerData: newPlayerData,
        playerIsActive,
        playerOptions: {
          Fold: false,
          Call: false,
          Deal: false,
          "New Game": false,
        },
        infoMessages,
      },
      this.deal
    );
  };

  raise = (playerID) => {};

  call = (playerID) => {
    this.deal();
  };

  render() {
    const {
      playerData,
      tableCards,
      displayAICards,
      playerOptions,
    } = this.state;
    return (
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
            "New Game": this.newGame,
          }}
          options={playerOptions}
        />
      </StyledPoker>
    );
  }
}

export default Poker;
