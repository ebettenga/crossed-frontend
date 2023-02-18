import { useState } from "react";
import "./App.css";
import { useWebSocket } from "./hooks/useWebSocket";

function App() {
  const recieveMessage = (message: string) => {
    setMessages((oldMessages) => [...oldMessages, message])
  }

  const {sendMessage, joinRoom, getGameState } = useWebSocket(recieveMessage)
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<string[]>([])
  

  const updateMessage = (e: any) => {
    setMessage(e.target.value)
  }

  const send = () => {
    sendMessage({message, room: '1'});
    setMessage("")
  }

  
  const endNumber = parseInt(window.location.pathname?.split("/").at(-1) ?? "");
  if (endNumber) {
    joinRoom(endNumber)
  }

  return (
    <div className="App">
      <h1>React/Flask App + socket.io</h1>
      <input type="text" value={message} onChange={updateMessage} />
      <button onClick={send}>Send Message</button>
      <button onClick={() => {getGameState()}}>Send Message</button>
      { messages?.map((item, key) => {
        return <div key={key}>{item}</div>
      })}
    </div>
  );
}

export default App;
