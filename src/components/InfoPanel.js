import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const StyledInfoPanel = styled.div`
  width: 99%;
  height: 100%;
  grid-area: infopanel;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: scroll;
  p {
    font-size: 12px;
    margin: 1px 20px;
  }
  .blink {
    animation-name: blinker;
    animation-duration: 500ms;
    animation-timing-function: linear;
    animation-iteration-count: 2;
  }
  @keyframes blinker {
    50% {
      opacity: 0;
    }
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
      {messages.toArray().map((str, i, arr) => (
        <p
          key={`${str.slice(0, 20)}_${i}`}
          // className={`${i === arr.length - 1 ? 'blink' : ''}`}
        >
          {str}
        </p>
      ))}
    </StyledInfoPanel>
  );
};

export default InfoPanel;
