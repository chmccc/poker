import React from 'react';

const OptionsPanel = ({ options, callbacks }) => {
  return (
    <div id="options-wrapper">
      <h4>Options</h4>
      <div id="PlayerOptions">
        <button
          className={`playerOption-button${options.Deal ? '' : ' button-disabled'}`}
          onClick={() => callbacks.Deal('player')}
          disabled={!options.Deal}
        >Deal</button>
        <button
          className={`playerOption-button${options["New Game"] ? '' : ' button-disabled'}`}
          onClick={() => callbacks["New Game"]('player')}
          disabled={!options["New Game"]}
        >New Game</button>
        <button
          className={`playerOption-button${options.Call ? '' : ' button-disabled'}`}
          onClick={() => callbacks.Call('player')}
          disabled={!options.Call}
        >Call</button>
        <button
          className={`playerOption-button${options.Fold ? '' : ' button-disabled'}`}
          onClick={() => callbacks.Fold('player')}
          disabled={!options.Fold}
        >Fold</button>
      </div>
    </div>
  )
}

export default OptionsPanel;