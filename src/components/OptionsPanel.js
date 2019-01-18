import React from 'react';

const OptionsPanel = ({ options, callbacks }) => {

  const validOptions = Object.keys(options).filter(option => options[option]);

  return (
    <div className="PlayerOptions">
    {validOptions.map(option => <button
        key={`option-${option}`}
        className="playerOption-button" 
        onClick={() => callbacks[option]('player')}>{`${option}`}
      </button>
    )}
    </div>
  )
}

export default OptionsPanel;