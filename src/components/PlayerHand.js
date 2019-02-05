import React from 'react';
import Card from './Card.js';
import styled from 'styled-components';

const StyledPlayerHand = styled.div`
  margin: 0 auto;
  border: 3px solid #411f18;
  border-radius: 5px;
  height: 93%;
  display: flex;
  justify-content: center;
  min-width: 350px;
  background-color: rgb(0, 61, 0);
`;

const PlayerHand = ({ hand }) => {
  return (
    <StyledPlayerHand>
      {hand.map(card => (
        <Card
          key={`player${card.displayName}`}
          width={120}
          shown
          card={card}
          location="player"
        />
      ))}
    </StyledPlayerHand>
  );
};

export default PlayerHand;
