import React from 'react';
import Card from './Card';

const Table = ({cards, fold}) => {

  return (
    <div id="Table">
      {cards.map(card => (
        <Card
          key={`table${card.displayName}`}
          width={80}
          shown
          card={card}
          location="table"
        />
      ))}
    </div>
  )
}

export default Table;