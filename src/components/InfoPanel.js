import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const StyledInfoPanel = styled.div`
  width: 100%;
  height: 100%;
  grid-area: infopanel;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: scroll;
  p {
    font-size: 12px;
    margin: 1px 20px;
  }
`;

const InfoPanel = ({ messages }) => {
  let div = useRef(null);

  useEffect(() => {
    div.scrollTop = div.scrollHeight;
  }); // keep content scrolled to bottom

  return (
    <StyledInfoPanel
      ref={el => {
        div = el;
      }}>
      {messages.toArray().map((str, i) => (
        <p key={`${str.slice(0, 20)}_${i}`}>{str}</p>
      ))}
    </StyledInfoPanel>
  );
};

export default InfoPanel;
