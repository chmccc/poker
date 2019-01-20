import React from 'react';
import PlayerHand from '../components/PlayerHand';
import OptionsPanel from '../components/OptionsPanel';

const PlayerDashboard = ({ data, options, callbacks }) => {

  return (
    <div id="PlayerDashboard">
      <div id="status-wrapper">
        <h4 
          className="player-title"
          style={{gridArea: 'playerName'}}
          >
          {`Player${ data.active ? '' : ' (folded)'}`}
        </h4>
      </div>
      <PlayerHand hand={data.hand} />
      <OptionsPanel options={options} callbacks={callbacks} />
    </div>
  )
}

export default PlayerDashboard;