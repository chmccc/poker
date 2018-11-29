import React from 'react';
import Card from './Card.js';

const PlayerHand = ({cards}) => {
  return (
    <div className="PlayerHand">
      {cards.map(card => (
        <Card
          key={`player${card.displayName}`}
          width={200}
          shown
          card={card}
          location="player"
        />
      ))}
    </div>
  )
}

export default PlayerHand;