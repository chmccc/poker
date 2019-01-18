import React from 'react';
import PlayerHand from '../components/PlayerHand';
import OptionsPanel from '../components/OptionsPanel';

const PlayerDashboard = ({ data, options, callbacks }) => {

  return (
    <div className="PlayerDashboard">
      <h2 style={{gridArea: 'playerName'}}>{`player${ data.active ? '' : ' (folded)'}`}</h2>
      <PlayerHand hand={data.hand} />
      <OptionsPanel options={options} callbacks={callbacks} />
    </div>
  )
}

export default PlayerDashboard;