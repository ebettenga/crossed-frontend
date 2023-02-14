import "./App.css";
import WebSocketCall from "./components/WebSocketCall";
import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import HttpCall from "./components/HttpCall";

function App() {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [buttonStatus, setButtonStatus] = useState(false);

  const handleClick = () => {
    if (buttonStatus === false) {
      setButtonStatus(true);
    } else {
      setButtonStatus(false);
    }
  };

  useEffect(() => {
    if (buttonStatus === true) {
      const socket = io("localhost:5000/", {
        transports: ["websocket"],
      });

      setSocketInstance(socket);

      // @ts-ignore
      socket.on("connect", (data: any) => {
        console.log(data);
      });

      setLoading(false);

      // @ts-ignore
      socket.on("disconnect", (data: AsyncGeneratorFunctionConstructor) => {
        console.log(data);
      });

      return function cleanup() {
        socket.disconnect();
      };
    }
  }, [buttonStatus]);

  return (
    <div className="App">
      <h1>React/Flask App + socket.io</h1>
      <div className="line">
        <HttpCall />
      </div>
      {!buttonStatus ? (
        <button onClick={handleClick}>turn chat on</button>
      ) : (
        <>
          <button onClick={handleClick}>turn chat off</button>
          <div className="line">
            {!loading && <WebSocketCall socket={socketInstance} />}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
