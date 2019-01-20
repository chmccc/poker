import React from 'react';

const OptionsPanel = ({ options, callbacks }) => {

  return (
    <div style={{padding: '10px'}}>
      <h3>Options</h3>
      <div id="PlayerOptions">
      {Object.keys(options).map(optionName => <button
          key={`option-${optionName}`}
          className={`playerOption-button${options[optionName] ? '' : ' button-disabled'}`}
          onClick={() => callbacks[optionName]('player')}
          disabled={!options[optionName]}>
            {`${optionName}`}
          </button>
      )}
      </div>
    </div>
  )
}

export default OptionsPanel;