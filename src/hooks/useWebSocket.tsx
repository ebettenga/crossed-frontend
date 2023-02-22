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
  first_name: string;
  id: number;
}

interface RoomResponse {
  message: Room;
}

export interface Room {
  created_at: string;
  crossword: CrossWord;
  difficulty: "easy" | "medium" | "hard";
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

export enum SquareType {
  SOLVED,
  BLANK,
  BLACK,
  CIRCLE_BLANK,
  CIRCLE_SOLVED,
  CIRCLE_BLACK
}

export interface Square {
  id: number;
  squareType: SquareType
  letter: string | null;
  gridnumber: number | null;
  x: number;
  y: number;
  isHilighted: boolean;
  // planting the seed for these down and across questions in here, but finding the right quesetion is hard
  downQuestion?: string;
  acrossQuestion?: string;
}

export interface SessionData {
  createdAt: string;
  roomId: number;
  difficulty: "easy" | "medium" | "hard";
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
  const [board, setBoard] = useState<Square[][] | null>(null);
  const [downClues, setDownClues] = useState<string[]>([]);
  const [acrossClues, setAcrossClues] = useState<string[]>([]);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // this is pretty gross to read
  const getSquareType = (letter_character: string, isCircled: boolean, isCircledShaded: boolean): SquareType => {
    const hasLetter = /[a-zA-z]/.test(letter_character);
    if (letter_character === ".") {
      return SquareType.BLACK
    }
    if (hasLetter) {
      return SquareType.SOLVED
    }
    if (isCircled) {
      if (isCircledShaded) {
        return SquareType.CIRCLE_BLACK
      }
      if (hasLetter) {
        return SquareType.CIRCLE_SOLVED
      }
      return SquareType.CIRCLE_BLANK
    }
    return SquareType.BLANK
  }

  const createSquares = (data: Room) => {
    return data.found_letters.map((item: string, index) => {
      const isCircled = data.crossword.circles ? data.crossword.circles[index] === 1 : false;
      const isCircledShaded = data.crossword.shadecircles;
      const x = Math.floor(index / data.crossword.row_size);
      return {
        id: index,
        x,
        y: index - (x * data.crossword.row_size),
        squareType: getSquareType(item, isCircled, isCircledShaded),
        gridnumber:
          data.crossword.gridnums[index] === 0
            ? data.crossword.gridnums[index]
            : null,
        letter: item !== "*" ? item : null,
        isHilighted: false,
      } as Square;
    });
  };

  const arrayToMatrix = <T,>(array: T[], row_length: number) =>
    Array(Math.ceil(array.length / row_length))
      .fill("")
      .reduce((acc, _, index) => {
        return [...acc, [...array].splice(index * row_length, row_length)];
      }, []);

  const createBoard = (squares: Square[], row_len: number) => {
    return arrayToMatrix(squares, row_len);
  };

  const formatRoom = (data: Room) => {
    setBoard(createBoard(createSquares(data), data.crossword.row_size));
    setDownClues(data.crossword.clues.down);
    setAcrossClues(data.crossword.clues.across);
    setSessionData({
      createdAt: data.created_at,
      difficulty: data.difficulty,
      roomId: data.id,
    });
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

      socket.on("room_joined", (data: Room) => {
        formatRoom(data);
      });

      socket.on("message", (data: RoomResponse) => {
        formatRoom(data.message);
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
    sessionData,
    clues: {
      downClues,
      acrossClues,
    },
  };
};
