import React from 'react';
import Card from './Card.js';
import styled from 'styled-components';

const StyledAI = styled.div`
  grid-area: ${props => props.id};
  margin: 0 auto;
  width: 85%;
  height: 120px;
  border: 3px solid #411f18;
  background-color: rgb(0, 61, 0);
  border-radius: 5px;
  padding: 3px;
  max-width: ${props => (props.top ? '180px' : 'auto')};
  h4 {
    margin: 0px auto;
    text-align: center;
    font-family: Courgette;
  }
  .ai {
    .ai-card-container {
      display: flex;
      width: 100%;
      flex-direction: row;
      margin: 0 auto;
      justify-content: center;
    }
  }
`;

const AI = ({ data, showCards }) => {
  const cardContainer = data.active ? (
    data.hand.map(card => (
      <Card
        key={`${data.id + card.displayName}`}
        width={60}
        shown={showCards}
        card={card}
        location="ai"
      />
    ))
  ) : (
    <p>Folded!</p>
  );
  return (
    <StyledAI top={data.id === 'ai2'} id={data.id}>
      <h4>{`AI Opponent ${data.id.slice(-1)}`}</h4>
      <div className="ai">
        <div className="ai-card-container">{cardContainer}</div>
      </div>
    </StyledAI>
  );
};

export default AI;
