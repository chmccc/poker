import React, { useRef, useEffect } from 'react';

const InfoPanel = ({ messages }) => {

  let div = useRef(null);

  useEffect(() => { div.scrollTop = div.scrollHeight; }); // keep content scrolled to bottom

  return (
    <div id="InfoPanel" ref={(el) => { div = el; }}>
      {messages.toArray().map(str => (
        <p
          key={`infomsg${str.slice(0, 40)}`}
          className="info-message">{str}
        </p>
      ))}
    </div>
  )
}

export default InfoPanel;