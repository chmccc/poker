import React from 'react';

const InfoPanel = ({messages}) => {
  // remember - messages is NOT an array it's an InfoMessagesQueue, use toArray to convert to array
  return (
    <div id="infopanel">
      {messages.toArray().map(str => (
        <p
          key={`infomsg${str.slice(0, 40)}`}
          className="info-message">{str}</p>
      ))}
    </div>
  )
}

export default InfoPanel;