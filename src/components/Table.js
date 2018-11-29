import React from 'react';
import Card from './Card';

const Table = ({cards}) => {

  return (
    <div className="Table">
      {cards.map(card => (
        <Card
          key={`table${card.displayName}`}
          width={120}
          shown
          card={card}
          location="table"
        />
      ))}
    </div>
  )
}

export default Table;