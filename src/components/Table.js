import React from 'react';
import Card from './Card';
import styled from 'styled-components';

const StyledTable = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  grid-area: table;
  padding-left: 0px;
`;

const Table = ({ cards, fold }) => {
  return (
    <StyledTable>
      {cards.map(card => (
        <Card key={`table${card.displayName}`} width={80} shown card={card} />
      ))}
    </StyledTable>
  );
};

export default Table;
