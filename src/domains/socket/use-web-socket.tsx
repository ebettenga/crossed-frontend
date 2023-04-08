import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { PageState } from "../../App";
import { StorageKeys, useSession } from "../../hooks/use-session";
import { BASE_URL } from "../user/use-current-user";

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

export interface Player {
  profile_image: string;
  email: string;
  created_at: string;
  first_name: string;
  id: number;
  score: number;
  isUser: boolean;
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
  CIRCLE_BLACK,
}

export interface Square {
  id: number;
  squareType: SquareType;
  letter?: string;
  gridnumber: number | null;
  x: number;
  y: number;
  isHilighted: boolean;
  downQuestion?: string;
  acrossQuestion?: string;
}

export interface SessionData {
  createdAt: string;
  roomId: number;
  difficulty: "easy" | "medium" | "hard";
  colSize: number;
  rowSize: number;
}

export enum Orientation {
  ACROSS = "ACROSS",
  DOWN = "DOWN",
}

export interface Guess {
  x: number;
  y: number;
  room_id: number;
  guess: string;
  user_id: number;
}

export const useGame = () => {
  const { getAccessTokenSilently } = useAuth0();
  const { set, clear: clearRoomId } = useSession(StorageKeys.ROOM_ID);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [board, setBoard] = useState<Square[][] | null>(null);
  const [downClues, setDownClues] = useState<string[]>([]);
  const [acrossClues, setAcrossClues] = useState<string[]>([]);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  // this is pretty gross to read
  const getSquareType = (
    letter_character: string,
    isCircled: boolean,
    isCircledShaded: boolean
  ): SquareType => {
    const hasLetter = /[a-zA-z]/.test(letter_character);
    if (letter_character === ".") {
      return SquareType.BLACK;
    }
    if (hasLetter) {
      return SquareType.SOLVED;
    }
    if (isCircled) {
      if (isCircledShaded) {
        return SquareType.CIRCLE_BLACK;
      }
      if (hasLetter) {
        return SquareType.CIRCLE_SOLVED;
      }
      return SquareType.CIRCLE_BLANK;
    }
    return SquareType.BLANK;
  };

  const createSquares = (data: Room) => {
    return data.found_letters.map((item: string, index) => {
      const isCircled = data.crossword.circles
        ? data.crossword.circles[index] === 1
        : false;
      const isCircledShaded = data.crossword.shadecircles;
      const x = Math.floor(index / data.crossword.row_size);
      return {
        id: index,
        x,
        y: index - x * data.crossword.row_size,
        squareType: getSquareType(item, isCircled, isCircledShaded),
        gridnumber:
          data.crossword.gridnums[index] !== 0
            ? data.crossword.gridnums[index]
            : null,
        letter: item !== "*" ? item : undefined,
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

  const createClueArray = (
    clues: string[]
  ): { number: number; hint: string }[] => {
    return clues.map((clue) => {
      const clueArray = clue.split(".");
      const clueNumber = parseInt(clueArray[0]);
      const hint = clue;
      return { number: clueNumber, hint };
    });
  };

  const addCluesToSquares = (
    board: Square[][],
    { across, down }: { across: string[]; down: string[] }
  ) => {
    populateAcrossClues(board, across);
    populateDownClues(board, down);
  };

  const shouldIncrementAcross = (
    currentIndex: number,
    square: Square,
    previousSquare: Square | undefined
  ): number => {
    if (previousSquare?.squareType === SquareType.BLACK) return currentIndex;
    if (previousSquare && square.x !== previousSquare?.x)
      return currentIndex + 1;
    if (square.squareType === SquareType.BLACK) return currentIndex + 1;
    return currentIndex;
  };

  const populateAcrossClues = (board: Square[][], clues: string[]) => {
    const acrossClues = createClueArray(clues);
    let currentClue = 0;
    let prevSquare: Square | undefined;
    board.forEach((row, _) => {
      row.forEach((square, _) => {
        currentClue = shouldIncrementAcross(currentClue, square, prevSquare);
        if (square.squareType !== SquareType.BLACK)
          square.acrossQuestion = acrossClues[currentClue].hint;
        prevSquare = square;
      });
    });
  };

  const populateDownClues = (board: Square[][], clues: string[]) => {
    const downClues = createClueArray(clues);
    let currentClue = 0;
    board.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const square = board[colIndex][rowIndex];
        if (colIndex === 0) {
          currentClue = square.gridnumber ?? -1;
          square.downQuestion = downClues.find(
            (clue) => clue.number == currentClue
          )?.hint;
        } else if (square.squareType === SquareType.BLACK) {
          try {
            currentClue = board[colIndex + 1][rowIndex].gridnumber!;
          } catch (error) {
            currentClue = board[0][rowIndex + 1].gridnumber!;
          }
        } else {
          square.downQuestion = downClues.find(
            (clue) => clue.number == currentClue
          )?.hint;
        }
      });
    });
    // there's some bug where the first down clue doesn't populate, so sorta hacking this in
    board[0][0].downQuestion = downClues[0].hint;
  };

  const formatRoom = (data: Room) => {
    const squares = createSquares(data);
    const board = createBoard(squares, data.crossword.row_size);
    addCluesToSquares(board, data.crossword.clues);
    setAcrossClues(data.crossword.clues.across);
    setDownClues(data.crossword.clues.down);
    setBoard(board);
    setSessionData({
      createdAt: data.created_at,
      difficulty: data.difficulty,
      roomId: data.id,
      colSize: data.crossword.col_size,
      rowSize: data.crossword.row_size,
    });
    const players = [{ ...data.player_1, score: data.player_1_score }];
    if (data.player_2)
      players.push({ ...data.player_2, score: data.player_2_score });
    setPlayers(players);
  };

  const getSquareById = (squareId: number): Square | undefined => {
    return board?.flat(1).find((square) => square.id === squareId);
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

  const loadRoom = (
    roomId: number,
    setPageState: React.Dispatch<React.SetStateAction<PageState>>
  ) => {
    if (!board) {
      getAccessTokenSilently().then((token) => {
        fetch(`${BASE_URL}/api/v1/room/${roomId}`, {
          method: "GET",
          headers: [
            ["Authorization", `Bearer ${token}`],
            ["Content-Type", "application/json"],
          ],
        })
          .then((data) => data.json() as Promise<Room>)
          .then((roomData) => {
            formatRoom(roomData);
            socketInstance?.emit("load_room", roomId)
            setPageState(PageState.PLAYING);
          });
      });
    }
  };

  useEffect(() => {
    if (!socketInstance) {
      const socket = io(BASE_URL, {
        transports: ["websocket"],
      });

      setSocketInstance(socket);
    }
    if (socketInstance) {
      socketInstance.on("room_joined", (data: Room) => {
        formatRoom(data);
        set(data.id.toString());
      });

      socketInstance.on("message", (data: RoomResponse) => {
        formatRoom(data.message);
        !data.message.found_letters.includes("*") && clearRoomId();
      });
    }

    return function cleanup() {
      socketInstance?.disconnect();
    };
  }, [socketInstance]);

  return {
    joinRoom,
    getSquareById,
    guess,
    loadRoom,
    board,
    sessionData,
    players,
    clues: {
      downClues,
      acrossClues,
    },
  };
};
