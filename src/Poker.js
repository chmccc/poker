import React, { Component, useState, useEffect } from 'react';
import { Deck } from './util/deck.js';
import Table from './components/Table.js';
import PlayerDashboard from './components/PlayerDashboard';

const deck = new Deck();

const Poker = () => {
  const [playerData, setplayerData] = useState({name: 'player', active: true, hand: []});
  const [tableCards, setTableCards] = useState([deck.dealCard()]);

  return (
    <div className="App">
      {/* {[AI1Data, AI2Data, AI3Data].map(data => (
        <AI 
          data={data}
          tableCards={tableCards}
          gameStage={gameStage} 
          key={data.name} 
          id={data.name}
          showCards={displayAICards}
        />
      ))} */}
      <Table cards={tableCards} />
      <PlayerDashboard 
        data={playerData}
      />
    </div>
  );
}

export default Poker;
