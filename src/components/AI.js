import React from 'react';
import Card from './Card.js';

const AI = ({data, showCards}) => {
  
  const cardContainer = data.active ? data.hand.map(card => (
    <Card
      key={`${data.id + card.displayName}`}
      width={100}
      shown={showCards}
      card={card}
      location="ai"
    />
  )) : <p>Folded!</p>
  return (
    <div className={`${data.id === 'ai2' ? 'ai-top' : 'ai'}`}>
      <div className="ai-card-container">
        {cardContainer}
      </div>
    </div>
  )
}

export default AI;