import React from 'react';
import PlayerHand from '../components/PlayerHand';
// import OptionsPanel from '../components/OptionsPanel';

const PlayerDashboard = ({ data }) => {

  return (
    <div className="PlayerDashboard">
      <h2 style={{gridArea: 'playerName'}}>player</h2>
      <PlayerHand cards={data.hand} />
    </div>
  )
}

export default PlayerDashboard;