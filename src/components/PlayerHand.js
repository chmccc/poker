import React from 'react';
import Card from './Card.js';

const PlayerHand = ({hand}) => {
  return (
    <div className="PlayerHand">
      {hand.map(card => (
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