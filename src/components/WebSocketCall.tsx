import { useEffect, useState } from "react";

export default function WebSocketCall({ socket }: {socket: any}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomNum, setRoomNum] = useState(1);

  const handleText = (e: any) => {
    const inputMessage = e.target.value;
    setMessage(inputMessage);
  };

  const handleRoom = (e: any) => {
    const roomNumber = e.target.value;
    setRoomNum(roomNumber)
  }

  const handleSubmit = () => {
    if (!message) {
      return;
    }
    const payload = {
      message,
      "room": roomNum
    }
    socket.emit("game", payload);
    setMessage("");
  };

  useEffect(() => {
    socket.on("data", (data: any) => {
      setMessages([...messages, data.data] as any);
    });
  }, [socket, messages]);

  return (
    <div>
      <h2>WebSocket Communication</h2>
      <label>
        message
      </label>
      <input type="text" value={message} onChange={handleText} />
      <label>
        room number
      </label>
      <input type="number" value={roomNum} onChange={handleRoom} />
      <button onClick={handleSubmit}>submit</button>
      <ul>
        {messages.map((message, ind) => {
          return <li key={ind}>{message}</li>;
        })}
      </ul>
    </div>
  );
}
