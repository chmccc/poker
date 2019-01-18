import React from 'react';
import CardBack from '../images/cardback.jpg';

const Card = ({shown, card, width, location}) => {
  
  if (!shown) return <img src={CardBack} width={`${width}px`} height={`${width * 1.4}px`} alt="Cardback"/>
  const symbolFontSize = location === 'player' ? '6em' : '3em';
  const titleFontSize = location === 'player' ? '3em' : '2em';

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