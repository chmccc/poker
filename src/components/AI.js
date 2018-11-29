import React from 'react';
import Card from './Card.js';

const AI = ({data, showCards}) => {
  return (
    <div className={`${data.id === 'ai2' ? 'ai-top' : 'ai'}`} style={{gridArea: `${data.id}`}}>
      <h2>{data.id}</h2>
      <div className="ai-card-container">
        {data.cards.map(card => (
          <Card
            key={`${data.id + card.displayName}`}
            width={100}
            shown={showCards}
            card={card}
            location="ai"
          />
        ))}
      </div>
    </div>
  )
}

export default AI;