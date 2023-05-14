import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3001")

const App = () => {

  const [ text, setText ] = useState('');
  const [ data, setData ] = useState('');
  
  const sendMessage = () => {
    socket.emit("send_message", {message: text})
    setText("");
  }

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setData(data.message)
    })
  }, [socket])

  return(
    <div>
      <input type="text" onChange={e => setText(e.target.value)}/>
      <button onClick={sendMessage}>Send Message</button>
      <p>{data}</p>

    </div>
  )
}

export default App;