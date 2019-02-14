import React from 'react';
import Card from './Card.js';
import styled from 'styled-components';
import Balance from './Balance.js';

const StyledAI = styled.div`
  grid-area: ${props => props.id};
  align-self: center;
  justify-self: center;
  /* justify-self: ${props => (props.top ? 'start' : 'center')}; */
  width: ${props => (props.top ? '300px' : '160px')};
  height: ${props => (props.top ? 'auto' : '80%')};
  border: 3px solid #411f18;
  background-color: rgb(0, 61, 0);
  border-radius: 5px;
  padding: 3px;
  h4 {
    margin: 0px auto;
    text-align: center;
    font-family: Courgette;
  }
  .ai {
    display: flex;
    flex-direction: ${props => (props.top ? 'row' : 'column')};
    .ai-card-container {
      height: 100px;
      display: flex;
      width: 155px;
      flex-direction: row;
      justify-content: center;
    }
  }
`;

const AI = ({ data, showCards }) => {
  return (
    <StyledAI top={data.id === 'ai2'} id={data.id}>
      <h4>{`${data.fullName}${data.active ? '' : ' (folded)'}`}</h4>
      <div className="ai">
        <div className="ai-card-container">
          {data.hand.map(card => (
            <Card
              key={`${data.id + card.displayName}`}
              width={60}
              shown={showCards}
              card={card}
              location="ai"
            />
          ))}
        </div>
        <Balance area="ai" amount={data.balance} />
      </div>
    </StyledAI>
  );
};

export default AI;
