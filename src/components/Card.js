import React from 'react';
import CardBack from '../assets/images/cardback.jpg';
import styled from 'styled-components';

const StyledCard = styled.div`
  width: 100%;
  width: ${props => props.width}px;
  color: ${props => props.card.color};
  height: ${props => props.width * 1.4}px;
  background-color: ${props => (props.card.highlight ? 'skyblue' : 'white')};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-shadow: 3px 4px rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  margin: 8px;
  img {
    width: 100%;
    height: 100%;
  }
  .card-title {
    font-family: Pokerface;
    font-size: ${props => props.width * 0.3}px;
    margin: 10% auto 20% auto;
    align-self: flex-start;
  }
  .card-suit {
    font-size: ${props => props.width * 0.4}px;
    display: flex;
    justify-content: center;
  }
`;

const Card = ({ shown, card, width }) => {
  if (!shown) {
    return (
      <StyledCard card={card} width={width}>
        <img src={CardBack} alt="Cardback" />
      </StyledCard>
    );
  }
  return (
    <StyledCard card={card} width={width}>
      <h1 className="card-title">{card.short}</h1>
      <div className="card-suit">{card.suitEmoji}</div>
    </StyledCard>
  );
};

export default Card;
