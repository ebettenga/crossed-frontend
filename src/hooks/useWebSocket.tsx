import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useWebSocket = (
  recieveMessage: (message: string) => void
) => {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  const sendMessage = (message: unknown) => {
    if (socketInstance) {
      socketInstance.send(message);
    }
  };

  const getGameState = () => {
    if (socketInstance) {
      socketInstance.emit("game_state", "test");
    }
  };

  const joinRoom = (roomId: number) => {
    if (socketInstance) {
      socketInstance.emit("join", { room: roomId });
    }
  };

  useEffect(() => {
    const socket = io("localhost:5000/", {
      transports: ["websocket"],
    });

    setSocketInstance(socket);

    // @ts-ignore
    socket.on("connect", (data: any) => {
        console.log(data)
    });

    // @ts-ignore
    socket.on("disconnect", (data: AsyncGeneratorFunctionConstructor) => {
      console.log(data);
    });

    socket.on("state", (state: any) => {
      console.log(state);
    });

    socket.on("message", (data: any) => {
      recieveMessage(data.message);
    });

    return function cleanup() {
      socket.disconnect();
    };
  }, []);

  return {
    joinRoom,
    sendMessage,
    getGameState,
  };
};
