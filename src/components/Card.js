import React from 'react';
import CardBack from '../images/cardback.jpg';

const Card = ({shown, card, width, location}) => {

  if (!shown) return <img src={CardBack} width={`${width}px`} height={`${width * 1.4}px`} alt="Cardback"/>
  
  let symbolFontSize;
  let titleFontSize;
  if (location === 'player') {
    symbolFontSize = '6em';
    titleFontSize = '3em';
  } else {
    titleFontSize = '2em';
    if (location === 'ai') symbolFontSize = '2em';
    else symbolFontSize = '3em'
  }

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