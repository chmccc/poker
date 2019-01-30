import React from 'react';
import styled from 'styled-components';

const StyledOptionsPanel = styled.div`
  padding: 10px;
  font-family: Courgette;

  #PlayerOptions {
    display: grid;
    justify-items: center;
    align-items: center;
    height: 75%;
    grid-template-columns: 50% 50%;
  }
  
`;

const StyledButton = styled.button`
  outline: none;
  width: 90%;
  height: 40px;
  border-radius: 4px;
  box-shadow: 0 4px 8px 0 #1c3814, 0 6px 20px 0 #1c3814;
  font-size: 1em;
  font-family: "Contrail One";
  -webkit-transition-duration: 0.4s;
  transition-duration: 0.4s;
  color: ${props => props.disabled ? 'grey' : 'black'};
  background-color: ${props => props.disabled ? 'lightgrey' : 'white'};
  
  :hover {
    background-color: ${props => props.disabled ? 'lightgrey' : 'lightgreen'}
  }
`;

const OptionsPanel = ({ options, callbacks }) => {
  return (
    <StyledOptionsPanel>
      <h4>Options</h4>
      <div id="PlayerOptions">
        <StyledButton
          callback={`${options.Deal}`}
          onClick={() => callbacks.Deal('player')}
          disabled={!options.Deal}
        >Deal</StyledButton>
        <StyledButton
          callback={`${options["New Game"]}`}
          onClick={() => callbacks["New Game"]('player')}
          disabled={!options["New Game"]}
        >New Game</StyledButton>
        <StyledButton
          callback={`${options.Call}`}
          onClick={() => callbacks.Call('player')}
          disabled={!options.Call}
        >Call</StyledButton>
        <StyledButton
          callback={`${options.Fold}`}
          onClick={() => callbacks.Fold('player')}
          disabled={!options.Fold}
        >Fold</StyledButton>
      </div>
    </StyledOptionsPanel>
  )
}

export default OptionsPanel;