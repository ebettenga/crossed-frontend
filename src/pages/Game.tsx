import { ReactNode, useState } from "react";
import invariant from "tiny-invariant";
import { Spacer } from "../domains/components/spacing";
import {
  Guess,
  Orientation,
  Player,
  SessionData,
  Square,
  SquareType,
} from "../domains/socket/use-web-socket";
import { useCurrentUser } from "../domains/user/use-current-user";
import { LettersKeyboard } from "../components/Keyboard/Keyboard";
import { useMediaQuery } from "../hooks/use-media-query";
import { Card, Layout } from "antd";
import { Content } from "antd/es/layout/layout";

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
  const sm = useMediaQuery("sm");
  const md = useMediaQuery("md");
  const [orientationDirection, setOrientationDirection] = useState<Orientation>(
    Orientation.ACROSS
  );
  const [selectedSquare, setSelectedSquare] = useState<Square>(board[0][0]);
  const { user } = useCurrentUser();

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
    invariant(user, "user should exsist on Game Page");
    guess({
      x: guessData.x,
      y: guessData.y,
      room_id: sessionData.roomId,
      user_id: user?.id,
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
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {players.map((player) => {
          return (
            <Score
              key={`${player.first_name}${player.id}`}
              title={player.first_name}
              score={player.score}
            ></Score>
          );
        })}
      </div>
      <Spacer margin={"1rem"} />
      <Board>
        {board.map((squares) => (
          <Row
            key={squares[0].x}
            squares={squares}
            guessLetter={guessLetter}
            handleSquareClick={handleSquareClick}
            selectedSquare={selectedSquare}
          />
        ))}
      </Board>
      <Spacer margin={".3rem"} />
      <ClueView square={selectedSquare} direction={orientationDirection} />
      <Spacer margin={"1rem"} />
      {!(sm || md) && (
        <LettersKeyboard
          onInput={(letter) =>
            guessLetter({
              input: letter,
              squareId: selectedSquare.id,
              x: selectedSquare.x,
              y: selectedSquare.y,
            })
          }
        />
      )}
    </GameContainer>
  );
};

const ClueViewContainer: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
    }}
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
    <Card
      title={title}
      style={{ textAlign: "center", height: "7rem", width: "30vw" }}
    >
      <p style={{marginTop: '-5px'}}>{score}</p>
    </Card>
  );
};

const GameContainer: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Layout
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Content
        style={{
          maxWidth: "500px",
          display: "flex",
          flex: "1 1 auto",
          justifyContent: "start",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

export const Board: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div style={{ padding: "5px" }}>{children}</div>;

export const Row: React.FC<{
  squares: Square[];
  guessLetter: (guessData: LetterGuess) => void;
  handleSquareClick: (square: Square) => void;
  selectedSquare: Square;
}> = ({ squares, guessLetter, handleSquareClick, selectedSquare }) => (
  <div style={{ display: "flex" }}>
    {squares.map((square) => (
      <SquareProvider
        key={`${square.id}${square.x}${square.y}`}
        square={square}
        guessLetter={guessLetter}
        handleSquareClick={handleSquareClick}
        selectedSquare={selectedSquare}
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
  isSelected?: boolean;
}

export const SquareContainer: React.FC<SquareContainerProps> = ({
  children,
  fillBlack = false,
  gridNumber = null,
  isSelected = null,
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
      backgroundColor: fillBlack
        ? "#000000"
        : isSelected
        ? "#ADD8E6"
        : "#ffffff" ?? "#ffffff",
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
  selectedSquare: Square;
}> = ({ square, guessLetter, handleSquareClick, selectedSquare }) => {
  switch (square.squareType) {
    case SquareType.BLANK:
      return (
        <BlankSquare
          square={square}
          guessLetter={guessLetter}
          handleSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
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
          selectedSquare={selectedSquare}
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
  selectedSquare: Square;
}> = ({ square, guessLetter, handleSquareClick, selectedSquare }) => {
  const [currentLetter, setCurrentLetter] = useState("");
  const sm = useMediaQuery("sm");
  const md = useMediaQuery("md");
  return (
    <SquareContainer
      onClick={() => handleSquareClick(square)}
      gridNumber={square.gridnumber}
      isSelected={square.id === selectedSquare.id}
    >
      <input
        readOnly={!(sm || md)}
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
          backgroundColor:
            square.id === selectedSquare.id ? "#ADD8E6" : "#ffffff",
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
        {square.letter?.toUpperCase()}
      </div>
    </SquareContainer>
  );
};

export const BlackSquare: React.FC = () => {
  return <SquareContainer fillBlack={true}></SquareContainer>;
};
