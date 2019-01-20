import React from 'react';
import PlayerHand from '../components/PlayerHand';
import OptionsPanel from '../components/OptionsPanel';

const PlayerDashboard = ({ data, options, callbacks }) => {

  return (
    <div className="PlayerDashboard">
      <h2 
        className="player-title"
        style={{gridArea: 'playerName'}}>{`Player${ data.active ? '' : ' (folded)'}`}
      </h2>
      <PlayerHand hand={data.hand} />
      <OptionsPanel options={options} callbacks={callbacks} />
    </div>
  )
}

export default PlayerDashboard;