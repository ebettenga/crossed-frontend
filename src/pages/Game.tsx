import { ReactNode, useState } from "react";
import { Spacer } from "../domains/components/spacing";
import {
  Guess,
  Orientation,
  Player,
  SessionData,
  Square,
  SquareType,
} from "../domains/socket/useWebSocket";

interface LetterGuess {
  x: number;
  y: number;
  input: string;
  squareId: number;
}

export const GamePage = ({
  guess,
  board,
  getSquareById,
  players,
  sessionData,
}: {
  guess: (guess: Guess) => void;
  board: Square[][];
  getSquareById: (squareId: number) => Square | undefined;
  players: Player[];
  sessionData: SessionData;
  clues: { downClues: string[]; acrossClues: string[] };
}) => {
  const [orientationDirection, setOrientationDirection] = useState<Orientation>(
    Orientation.ACROSS
  );
  const [selectedSquare, setSelectedSquare] = useState<Square>(board[0][0]);

  const handleSquareClick = (square: Square) => {
    if (square !== selectedSquare) {
      setSelectedSquare(square);
    } else {
      setOrientationDirection((currentDirection) =>
        currentDirection === Orientation.ACROSS
          ? Orientation.DOWN
          : Orientation.ACROSS
      );
    }
  };

  const guessLetter = (guessData: LetterGuess) => {
    guess({
      x: guessData.x,
      y: guessData.y,
      room_id: sessionData.roomId,
      user_id: 1,
      guess: guessData.input,
    });
    navigateCursor(orientationDirection, guessData.squareId);
  };

  const getNextSquareElement = (start: number, increment: number) => {
    let elementReference: HTMLElement | null = null;
    let counter = start + increment;
    while (elementReference === null) {
      elementReference = document.getElementById(`square-${counter}`);
      if (!elementReference) {
        counter += increment;
      }
      if (counter > 300) {
        break;
      }
    }
    return { elementReference, newSquareId: counter };
  };

  const getNextElementByOrientation = (
    orientation: Orientation,
    squareId: number
  ) => {
    let nextElementData;
    if (orientation === Orientation.ACROSS) {
      nextElementData = getNextSquareElement(squareId, 1);
    } else {
      nextElementData = getNextSquareElement(squareId, sessionData.rowSize);
    }
    return nextElementData;
  };

  const navigateCursor = (orientation: Orientation, squareId: number) => {
    const nextElementData = getNextElementByOrientation(orientation, squareId);

    nextElementData.elementReference?.focus();
    const newSquare = getSquareById(nextElementData.newSquareId);
    if (newSquare && selectedSquare.id !== newSquare?.id) {
      setSelectedSquare(newSquare);
    }
  };

  return (
    <GameContainer>
      {players.map((player) => {
        return (
          <Score
            key={`${player.first_name}${player.id}`}
            title={player.first_name}
            score={player.score}
          ></Score>
        );
      })}
      <Board>
        {board.map((squares) => (
          <Row
            key={squares[0].x}
            squares={squares}
            guessLetter={guessLetter}
            handleSquareClick={handleSquareClick}
          />
        ))}
      </Board>
      <Spacer margin={".3rem"} />
      <ClueView square={selectedSquare} direction={orientationDirection} />
    </GameContainer>
  );
};

const ClueViewContainer: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div
    style={{ display: "flex", alignItems: "center", flexDirection: "column" }}
  >
    {children}
  </div>
);

const ClueHeader: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

const ClueView: React.FC<{ square: Square; direction: Orientation }> = ({
  square,
  direction,
}) => {
  return (
    <ClueViewContainer>
      <ClueHeader>{direction.toUpperCase()}</ClueHeader>
      <Spacer margin={".3rem"} />
      {direction === Orientation.ACROSS
        ? square.acrossQuestion
        : square.downQuestion}
    </ClueViewContainer>
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
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

export const Board: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div style={{ padding: "5px" }}>{children}</div>;

export const Row: React.FC<{
  squares: Square[];
  guessLetter: (guessData: LetterGuess) => void;
  handleSquareClick: (square: Square) => void;
}> = ({ squares, guessLetter, handleSquareClick }) => (
  <div style={{ display: "flex" }}>
    {squares.map((square) => (
      <SquareProvider
        key={`${square.id}${square.x}${square.y}`}
        square={square}
        guessLetter={guessLetter}
        handleSquareClick={handleSquareClick}
      />
    ))}
  </div>
);

const GridNumberWrapper: React.FC<{
  gridNumber: number | null;
}> = ({ gridNumber }) =>
  gridNumber ? (
    <>
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: "4px",
          fontSize: ".6rem",
        }}
      >
        {gridNumber}
      </div>
    </>
  ) : null;

interface SquareContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  fillBlack?: boolean;
  gridNumber?: number | null;
}

export const SquareContainer: React.FC<SquareContainerProps> = ({
  children,
  fillBlack = false,
  gridNumber = null,
  ...rest
}) => (
  <div
    {...rest}
    style={{
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "6vw",
      height: "6vw",
      maxWidth: "40px",
      maxHeight: "40px",
      border: "1px solid black",
      marginRight: "-1px",
      marginBottom: "-1px",
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
  handleSquareClick: (square: Square) => void;
}> = ({ square, guessLetter, handleSquareClick }) => {
  switch (square.squareType) {
    case SquareType.BLANK:
      return (
        <BlankSquare
          square={square}
          guessLetter={guessLetter}
          handleSquareClick={handleSquareClick}
        />
      );
    case SquareType.BLACK:
      return <BlackSquare />;
    case SquareType.SOLVED:
      return <SolvedSquare square={square} />;
    case SquareType.CIRCLE_BLANK:
      return (
        <BlankSquare
          square={square}
          guessLetter={guessLetter}
          handleSquareClick={handleSquareClick}
        />
      );
    case SquareType.CIRCLE_BLACK:
      return <BlackSquare />;
    case SquareType.CIRCLE_SOLVED:
      return <SolvedSquare square={square} />;
  }
};

export const BlankSquare: React.FC<{
  square: Square;
  guessLetter: (guessData: LetterGuess) => void;
  handleSquareClick: (square: Square) => void;
}> = ({ square, guessLetter, handleSquareClick }) => {
  const [currentLetter, setCurrentLetter] = useState("");
  return (
    <SquareContainer
      onClick={() => handleSquareClick(square)}
      gridNumber={square.gridnumber}
    >
      <input
        value={currentLetter}
        id={`square-${square.id}`}
        onChange={(e) => {
          guessLetter({
            x: square.x,
            y: square.y,
            input: e.target.value,
            squareId: square.id,
          });
          setCurrentLetter("");
        }}
        style={{
          border: "none",
          height: "80%",
          width: "80%",
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
      <div style={{ paddingTop: "10%", fontWeight: "bolder" }}>
        {square.letter}
      </div>
    </SquareContainer>
  );
};

export const BlackSquare: React.FC = () => {
  return <SquareContainer fillBlack={true}></SquareContainer>;
};
