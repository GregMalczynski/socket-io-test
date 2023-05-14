import { useState } from "react";
import io from "socket.io-client";

const App = () => {

  const [ text, setText ] = useState('');

  const sendMessage = () => {

  }

  return(
    <div>
      <input type="text" onChange={e => setText(e.target.value)}/>
      <button onClick={sendMessage}>Send Message</button>
      <p>{text}</p>

    </div>
  )
}

export default App;