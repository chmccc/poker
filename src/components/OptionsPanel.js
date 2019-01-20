import React from 'react';

const OptionsPanel = ({ options, callbacks }) => {

  return (
    <div id="options-wrapper">
      <h4>Options</h4>
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