import React from 'react';
import CardBack from '../assets/images/cardback.jpg';

const Card = ({shown, card, width, location}) => {

  if (!shown) return (
    <div className="Card" style={{ width: `${width}px`, height: `${width * 1.4}px` }}>
      <img src={CardBack} alt="Cardback" width="100%" height="100%"/>
    </div>
  );
  
  const symbolFontSize = `${width * .4}px`;
  const titleFontSize = `${width * .3}px`;

  const cardStyle = {
    width: `${width}px`,
    color: card.color,
    height: `${width * 1.4}px`,
    backgroundColor: card.highlight ? 'skyblue' : 'white',
  }

  return (
    <div className="Card" style={cardStyle}>
      <h1 className="card-title" style={{ fontSize: titleFontSize }}>{card.short}</h1>
      <div className="card-suit" style={{ fontSize: symbolFontSize }}>{card.suitEmoji}</div>
    </div>
  )
}

export default Card;