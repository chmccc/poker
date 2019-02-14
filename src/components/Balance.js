import React from 'react';
import styled from 'styled-components';

const StyledBalance = styled.div`
  grid-area: ${props => props.area};
  align-self: center;
  justify-self: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 140px;
  height: 100px;
  padding: 3px;
  border: ${props => (props.area === 'pot' ? '3px solid #411f18' : 'none')};
  background-color: ${props => (props.area === 'pot' ? 'rgb(0, 61, 0)' : 'inherit')};
  border-radius: 5px;
  .balance-title {
    font-size: ${props => (props.area === 'pot' ? '1.1em' : '0.9em')};
    font-weight: 600;
    font-family: Courgette;
    margin: ${props => (props.area === 'pot' ? '0 0 15px 0' : '15px 0')};
  }
`;

const Balance = ({ amount, area }) => {
  const text = area === 'pot' ? 'Pot:' : 'Balance:';
  return (
    <StyledBalance area={area}>
      <div className="balance-title">{text}</div>
      <div>{`$${amount}`}</div>
    </StyledBalance>
  );
};

export default Balance;
