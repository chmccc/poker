import React from 'react';
import styled from 'styled-components';

const StyledOptionsPanel = styled.div`
  padding: 10px;
  font-family: Courgette;

  #PlayerOptions {
    display: grid;
    justify-items: center;
    align-items: center;
    height: 150px;
    margin-top: 10px;
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
  font-family: 'Contrail One';
  -webkit-transition-duration: 0.4s;
  transition-duration: 0.4s;
  color: ${props => (props.disabled ? 'grey' : 'black')};
  background-color: ${props => (props.disabled ? 'lightgrey' : 'white')};

  :hover {
    background-color: ${props => (props.disabled ? 'lightgrey' : 'lightgreen')};
  }
`;

const StyledInput = styled.input`
  height: 25px;
  width: 80%;
  border-radius: 4px;
  box-shadow: 0 4px 8px 0 #1c3814, 0 6px 20px 0 #1c3814;
  font-size: 1em;
  font-family: 'Contrail One';
  outline: none;
`;

class OptionsPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bet: 0,
    };
  }

  onInputChange = e => {
    let bet = e.target.value;
    // validate input
    if (e.target.value === '') bet = 0;
    else if (/[^0-9]/g.test(bet)) bet = this.state.bet;
    else bet = parseInt(bet, 10);
    this.setState({ bet });
  };

  render() {
    const { options, requiredToCall } = this.props;
    let { callbacks } = this.props;
    let callText = requiredToCall === 0 ? 'Check' : `Call ($${requiredToCall})`;
    return (
      <StyledOptionsPanel>
        <h4>Options</h4>
        <div id="PlayerOptions">
          <StyledButton onClick={callbacks.Deal} disabled={!options.Deal}>
            Deal
          </StyledButton>
          <StyledButton onClick={callbacks['New Game']} disabled={!options['New Game']}>
            New Game
          </StyledButton>
          <StyledButton onClick={callbacks.Call} disabled={!options.Call}>
            {callText}
          </StyledButton>
          <StyledButton onClick={callbacks.Fold} disabled={!options.Fold}>
            Fold
          </StyledButton>
          <StyledButton onClick={() => callbacks.Raise(this.state.bet)} disabled={!options.Raise}>
            Bet/Raise:
          </StyledButton>
          <StyledInput onChange={this.onInputChange} value={this.state.bet} />
        </div>
      </StyledOptionsPanel>
    );
  }
}

export default OptionsPanel;
