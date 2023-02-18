import "./App.css";
import { useWebSocket } from "./hooks/useWebSocket";

function App() {
  const {sendMessage, joinRoom} = useWebSocket()



  return (
    <div className="App">
      <h1>React/Flask App + socket.io</h1>
      <button onClick={() => {sendMessage({data: "Test Message", room: 1})}}>Send Message</button>
      <button onClick={() => {joinRoom(1)}}>Join Room</button>
    </div>
  );
}

export default App;
