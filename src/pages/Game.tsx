import { useState } from "react";
import {
  Guess,
  Player,
  SessionData,
  Square,
  SquareType,
} from "../hooks/useWebSocket";

interface LetterGuess {
  x: number;
  y: number;
  input: string;
}

export const GamePage = ({
  guess,
  board,
  players,
  clues,
  sessionData,
}: {
  guess: (guess: Guess) => void;
  board: Square[][];
  players: Player[];
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
    <GameContainer>
      <div>
        <Board>
          {board.map((squares) => (
            <Row
              key={squares[0].x}
              squares={squares}
              guessLetter={guessLetter}
            />
          ))}
        </Board>
        {players.map((player) => {
          return <Score title={player.first_name} score={player.score}></Score>;
        })}
      </div>
      <CluesList cluesList={clues.acrossClues} title={"Across"} />
      <CluesList cluesList={clues.downClues} title={"Down"} />
    </GameContainer>
  );
};

const Score: React.FC<{ title: string; score: number }> = ({
  title,
  score,
}) => {
  return (
    <div>
      <div>
        {title}: {score}
      </div>
    </div>
  );
};

const GameContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div style={{ display: "flex", flexDirection: "row" }}>{children}</div>;

export const CluesList: React.FC<{ title: string; cluesList: string[] }> = ({
  title,
  cluesList,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", margin: "0 20px" }}>
      <ClueTitle title={title} />
      {cluesList.map((clue) => (
        <Clue clue={clue} />
      ))}
    </div>
  );
};

export const Clue: React.FC<{ clue: string }> = ({ clue }) => <div>{clue}</div>;

export const ClueTitle: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ fontSize: "2rem" }}>{title}</div>
);

export const Board: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div>{children}</div>;

export const Row: React.FC<{
  squares: Square[];
  guessLetter: (guessData: LetterGuess) => void;
}> = ({ squares, guessLetter }) => (
  <div style={{ display: "flex" }}>
    {squares.map((square) => (
      <SquareProvider
        key={`${square.id}${square.x}${square.y}`}
        square={square}
        guessLetter={guessLetter}
      />
    ))}
  </div>
);

const GridNumberWrapper: React.FC<{
  gridNumber: number | null;
}> = ({ gridNumber }) =>
  gridNumber ? (
    <>
      <div style={{ position: "absolute", top: "2px", left: "4px" }}>
        {gridNumber}
      </div>
    </>
  ) : null;

export const SquareContainer: React.FC<{
  children?: React.ReactNode;
  fillBlack?: boolean;
  gridNumber?: number | null;
}> = ({ children, fillBlack = false, gridNumber = null }) => (
  <div
    style={{
      margin: "-1px",
      position: "relative",
      padding: ".75vw",
      width: "20px",
      height: "20px",
      border: "2px solid black",
      textAlign: "center",
      backgroundColor: fillBlack ? "#000000" : undefined,
    }}
  >
    <>
      <GridNumberWrapper gridNumber={gridNumber}></GridNumberWrapper>
      {children}
    </>
  </div>
);

export const SquareProvider: React.FC<{
  square: Square;
  guessLetter: (guessData: LetterGuess) => void;
}> = ({ square, guessLetter }) => {
  switch (square.squareType) {
    case SquareType.BLANK:
      return <BlankSquare square={square} guessLetter={guessLetter} />;
    case SquareType.BLACK:
      return <BlackSquare />;
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

export const BlankSquare: React.FC<{
  square: Square;
  guessLetter: (guessData: LetterGuess) => void;
}> = ({ square, guessLetter }) => {
  const [currentLetter, setCurrentLetter] = useState("");
  return (
    <SquareContainer gridNumber={square.gridnumber}>
      <input
        value={currentLetter}
        onChange={(e) => {
          guessLetter({ x: square.x, y: square.y, input: e.target.value });
          setCurrentLetter("");
        }}
        style={{
          border: "none",
          height: "25px",
          width: "25px",
          textAlign: "center",
        }}
        type="text"
      />
    </SquareContainer>
  );
};

export const SolvedSquare: React.FC<{ square: Square }> = ({ square }) => {
  return (
    <SquareContainer gridNumber={square.gridnumber}>
      <div>{square.letter}</div>
    </SquareContainer>
  );
};

export const BlackSquare: React.FC = () => {
  return <SquareContainer fillBlack={true}></SquareContainer>;
};