import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface CrossWord {
  author: string;
  circles: number[];
  clues: { across: string[]; down: string[] };
  col_size: number;
  date: string;
  dow: string;
  gridnums: number[];
  id: number;
  jnote: string;
  notepad: string;
  row_size: number;
  shadecircles: boolean;
}

interface Player {
  profile_image: string;
   email: string;
   created_at: string; 
   first_name: string
   id: number;

}

interface RoomResponse {
  message: Room;
}

export interface Room {
created_at: string;
crossword: CrossWord;
difficulty: "easy" | "medium" | "hard"
found_letters: string[];
id: number;
player_1: Player;
player_1_score: number;
player_2: Player;
player_2_score: number;
}


export interface JoinRoomPayload {
  difficulty: "easy" | "medium" | "hard";
  user_id: number;
}

export interface Square {
  isBlackCircle?: boolean;
  isCircled?: boolean;
  isBlack?: boolean;
  letter?: string;
  gridnumber?: number;
}

export interface Guess {
  x: number;
  y: number;
  room_id: number;
  guess: string;
  user_id: number;
}


export const useWebSocket = () => {
  const { user } = useAuth0();
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [board, setBoard] = useState<Room | null>(null);
  const [downClues, setDownClues] = useState<string[]>([])

  const createSquares = (data: Room) => {
    return data.found_letters.map((item: string, index) => {
      return {
        gridnumber: data.crossword.gridnums[index] === 0 ? data.crossword.gridnums[index] : null,
        isBlack: item === ".",
        isBlackCircle: data.crossword.shadecircles,
        isCircled: data.crossword.circles ? data.crossword.circles[index] === 1 : null,
        letter: item !== "*" ? item : null
      } as Square
    })
  }

  const formatBoard = (data: Room) => {
    setBoard(data);
    setDownClues(data.crossword.clues.down)  
    console.log(createSquares(data))  
  }

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

      socket.on("room_joined", (data: Room) => {
        // TODO: marshall this data into something that looks like and actual board
        // Two things
        // A: we want a set of objects that make sense from this
        formatBoard(data)
      });

      socket.on("message", (data: RoomResponse) => {
        formatBoard(data.message)
      });

      return function cleanup() {
        socket.disconnect();
      };
    }
  }, [user]);

  return {
    joinRoom,
    guess,
    board,
    state: {
      downClues: downClues
    }
  };
};
