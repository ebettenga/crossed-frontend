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

interface Clue {
  number: number;
  hint: string;
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

enum PopulationState {
  READING,
  WRITING,
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

  const getSquareType = (
    hasLetter: boolean,
    isCircled: boolean,
    black: boolean
  ): SquareType => {
    if (black) return SquareType.BLACK;
    if (hasLetter) {
      return isCircled ? SquareType.CIRCLE_SOLVED : SquareType.SOLVED;
    } else {
      return isCircled ? SquareType.CIRCLE_BLANK : SquareType.BLANK;
    }
  };

  const createSquares = (data: Room) => {
    return data.found_letters.map((letterCharacter: string, index) => {
      const x = Math.floor(index / data.crossword.row_size);
      return {
        id: index,
        x,
        y: index - x * data.crossword.row_size,
        squareType: getSquareType(
          /[a-zA-z]/.test(letterCharacter),
          data.crossword.circles ? data.crossword.circles[index] === 1 : false,
          letterCharacter === "."
        ),
        gridnumber:
          data.crossword.gridnums[index] !== 0
            ? data.crossword.gridnums[index]
            : null,
        letter: letterCharacter !== "*" ? letterCharacter : undefined,
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

  const createClueArray = (clues: string[]): Clue[] => {
    return clues.map((clue) => {
      const clueArray = clue.split(".");
      const clueNumber = parseInt(clueArray[0]);
      return { number: clueNumber, hint: clue };
    });
  };
  const addCluesToSquares = (
    board: Square[][],
    { across, down }: { across: string[]; down: string[] }
  ) => {
    populateAcrossClues(board, createClueArray(across));
    populateDownClues(board, createClueArray(down));
  };

  const populateAcrossClues = (board: Square[][], acrossClues: Clue[]) => {
    let currentClue = getClueByQuestionNumber(
      acrossClues,
      board[0][0].gridnumber
    );
    let currentState = PopulationState.WRITING;
    board.forEach((row, rowIndex) => {
      row.forEach((square) => {
        if (square.squareType === SquareType.BLACK) {
          currentState = PopulationState.READING;
        } else if (rowIndex === 0) {
          currentState = PopulationState.WRITING;
          currentClue = getClueByQuestionNumber(acrossClues, square.gridnumber);
        } else if (currentState === PopulationState.READING) {
          currentState = PopulationState.WRITING;
          currentClue = getClueByQuestionNumber(acrossClues, square.gridnumber);
        }

        if (currentState === PopulationState.WRITING) {
          square.acrossQuestion = currentClue?.hint;
        }
      });
    });
  };

  function getClueByQuestionNumber(
    clueList: Clue[],
    questionNumber: number | null
  ) {
    return clueList.find((clue) => clue.number == questionNumber);
  }

  const populateDownClues = (board: Square[][], downClues: Clue[]) => {
    let currentClue = getClueByQuestionNumber(
      downClues,
      board[0][0].gridnumber
    );
    let currentState = PopulationState.WRITING;
    board.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const square = board[colIndex][rowIndex];

        if (square.squareType === SquareType.BLACK) {
          currentState = PopulationState.READING;
        } else if (colIndex === 0) {
          currentState = PopulationState.WRITING;
          currentClue = getClueByQuestionNumber(downClues, square.gridnumber);
        } else if (currentState === PopulationState.READING) {
          currentState = PopulationState.WRITING;
          currentClue = getClueByQuestionNumber(downClues, square.gridnumber);
        }

        if (currentState === PopulationState.WRITING) {
          square.downQuestion = currentClue?.hint;
        }
      });
    });
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
            socketInstance?.emit("load_room", roomId);
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
