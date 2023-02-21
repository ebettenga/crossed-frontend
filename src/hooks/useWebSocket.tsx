import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface JoinRoomPayload {
  difficulty: "easy" | "medium" | "hard";
  user_id: number;
}

interface Guess {
  x: number;
  y: number;
  room_id: number;
  guess: string;
  user_id: number;
}

export const useWebSocket = (recieveMessage: (message: string) => void) => {
  const { user } = useAuth0();
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  const sendMessage = (message: unknown) => {
    if (socketInstance) {
      socketInstance.send(message);
    }
  };

  const joinRoom = (joinRoomObject: JoinRoomPayload) => {
    if (socketInstance) {
      socketInstance.emit("join", joinRoomObject);
    }
  };

  const guess = (guess: Guess) => {
    if (socketInstance) {
      socketInstance.emit("message", guess);
    }
  };

  useEffect(() => {
    if (user) {
      const socket = io("localhost:5000/", {
        transports: ["websocket"],
      });

      setSocketInstance(socket);

      socket.on("room_joined", (data: any) => {
        console.log(data);
      });

      socket.on("message", (data: any) => {
        recieveMessage(data.message);
      });

      return function cleanup() {
        socket.disconnect();
      };
    }
  }, [user]);

  return {
    joinRoom,
    sendMessage,
    guess,
  };
};
