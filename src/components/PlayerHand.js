import React from 'react';
import Card from './Card.js';

const PlayerHand = ({hand}) => {
  return (
    <div id="PlayerHand">
      {hand.map(card => (
        <Card
          key={`player${card.displayName}`}
          width={120}
          shown
          card={card}
          location="player"
        />
      ))}
    </div>
  )
}

export default PlayerHand;