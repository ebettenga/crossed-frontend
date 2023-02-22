import { useAuth0 } from "@auth0/auth0-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import invariant from "tiny-invariant";
import "./App.css";
import {
  Guess,
  JoinRoomPayload,
  SessionData,
  Square,
  SquareType,
  useWebSocket,
} from "./hooks/useWebSocket";

enum PageState {
  LANDING,
  JOINING,
  PLAYING,
}

function App() {
  const [pageState, setPageState] = useState(PageState.LANDING);
  const { guess, board, clues, sessionData, joinRoom } = useWebSocket();

  switch (pageState) {
    case PageState.LANDING:
      return <LandingPage setPageState={setPageState} />;
    case PageState.JOINING:
      return <JoinRoom joinRoom={joinRoom} setPageState={setPageState} />;
    case PageState.PLAYING:
      invariant(board, "board must be present");
      invariant(sessionData, "sessionData must be present");
      return (
        <GamePage
          guess={guess}
          board={board}
          clues={clues}
          sessionData={sessionData}
        />
      );
    default:
      return <LandingPage setPageState={setPageState} />;
  }
}

export default App;

export const LandingPage: React.FC<{
  setPageState: Dispatch<SetStateAction<PageState>>;
}> = ({ setPageState }) => {
  const { user, loginWithPopup, getAccessTokenSilently } = useAuth0();

  const login = () => {
    loginWithPopup({
      authorizationParams: {
        audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE,
        redirect_uri: import.meta.env.VITE_APP_AUTH0_CALLBACK_URL,
      },
    }).then((data) => {
      setPageState(PageState.JOINING);
    });
  };

  const makeRequest = async (url: string) => {
    return getAccessTokenSilently().then((token) => {
      return fetch(url, {
        headers: [["Authorization", `Bearer ${token}`]],
      }).then((data) => {
        return data.json().then((data) => {
          return data;
        });
      });
    });
  };

  return (
    <div>
      <div>{user?.email}</div>
      <button onClick={login}>Login</button>
    </div>
  );
};

export const JoinRoom = ({
  setPageState,
  joinRoom,
}: {
  setPageState: Dispatch<SetStateAction<PageState>>;
  joinRoom: (joinRoomPayload: JoinRoomPayload) => void;
}) => {
  return (
    <div>
      <button onClick={() => joinRoom({ difficulty: "easy", user_id: 1 })}>
        Join Room
      </button>
      <button
        onClick={() => {
          setPageState(PageState.PLAYING);
        }}
      >
        Start Game
      </button>
    </div>
  );
};

// Game Stuff

interface LetterGuess {
  x: number;
  y: number;
  input: string;
}

export const GamePage = ({
  guess,
  board,
  clues,
  sessionData,
}: {
  guess: (guess: Guess) => void;
  board: Square[][];
  sessionData: SessionData;
  clues: { downClues: string[]; acrossClues: string[] };
}) => {

  const guessLetter = (guessData: LetterGuess) => {
    guess({
      x: guessData.x,
      y: guessData.y,
      room_id: sessionData.roomId,
      user_id: 1,
      guess: guessData.input,
    });

  };

  return (
    <Board>
      {board.map((squares) => (
        <Row key={squares[0].x} squares={squares} guessLetter={guessLetter} />
      ))}
    </Board>
  );
};

export const Board: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div>{children}</div>;

export const Row: React.FC<{ squares: Square[], guessLetter: (guessData: LetterGuess) => void }> = ({ squares, guessLetter }) => (
  <div style={{ display: "flex" }}>
    {squares.map((square) => (
      <SquareProvider key={square.id} square={square} guessLetter={guessLetter} />
    ))}
  </div>
);

export const SquareContainer: React.FC<{ children: React.ReactNode, size: string | number | string & {} }> = ({
  children, size
}) => (
  <div
    style={{
      margin: "-1px",
      padding: ".75vw",
      width: size,
      height: size,
      border: "2px solid black",
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

export const SquareProvider: React.FC<{ square: Square, guessLetter: (guessData: LetterGuess) => void }> = ({ square, guessLetter }) => {
  switch (square.squareType) {
    case SquareType.BLANK:
      return <BlankSquare square={square} guessLetter={guessLetter} />;
    case SquareType.BLACK:
      return <BlankSquare square={square} guessLetter={guessLetter} />;
    case SquareType.SOLVED:
      return <SolvedSquare square={square} />;
    case SquareType.CIRCLE_BLANK:
      return <BlankSquare square={square} guessLetter={guessLetter} />;
    case SquareType.CIRCLE_BLACK:
      return <BlankSquare square={square} guessLetter={guessLetter} />;
    case SquareType.CIRCLE_SOLVED:
      return <BlankSquare square={square} guessLetter={guessLetter} />;
  }
};

export const BlankSquare: React.FC<{ square: Square, guessLetter: (guessData: LetterGuess) => void }> = ({ square, guessLetter }) => {
  const size = '30px';

  return (
    <SquareContainer size={size}>
      <input onChange={(e) => guessLetter({x: square.x, y: square.y, input: e.target.value})} style={{border: 'none', height: size, width: size, textAlign: 'center'}} type="text" />
    </SquareContainer>
  );
};


export const SolvedSquare: React.FC<{square: Square}> = ({square}) => {
  const size = '30px';
  return (
    <SquareContainer size={size}>
      <div>{square.letter}</div>
    </SquareContainer>
  )
}
