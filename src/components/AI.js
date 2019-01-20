import React from 'react';
import Card from './Card.js';

const AI = ({data, showCards}) => {
  
  const cardContainer = data.active ? data.hand.map(card => (
    <Card
      key={`${data.id + card.displayName}`}
      width={60}
      shown={showCards}
      card={card}
      location="ai"
    />
  )) : <p>Folded!</p>
  return (
    <div 
      className={`playerBox${data.id === 'ai2' ? ' playerBox-top' : ''}`}
      style={{gridArea: data.id}}
    >
      <h4 className="player-title">AI Opponent</h4>
      <div className="ai" >
        <div className="ai-card-container">
          {cardContainer}
        </div>
      </div>
    </div>
  )
}

export default AI;