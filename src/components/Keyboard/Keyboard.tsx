import "./Keyboard.css";

interface KeyboardButtonProps {
  onKeyPress: (letter: string) => void;
  letter: string;
}

export const LettersKeyboard: React.FC<{
  onInput: (letter: string) => void;
}> = ({ onInput }) => {
  const keyboard = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      {keyboard.map((row: string[], index) => {
        return (
          <div
            key={index}
            style={{ display: "flex", flexDirection: "row", paddingBottom: 1 }}
          >
            {row.map((letter: string) => {
              return (
                <KeyboardKey
                  key={letter}
                  onKeyPress={onInput}
                  letter={letter}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const KeyboardKey: React.FC<KeyboardButtonProps> = ({
  onKeyPress,
  letter,
  ...rest
}) => {
  return (
    <button
      {...rest}
      style={{ width: "calc(100vw / 12)", height: "calc(100vw / 11)" }}
      onClick={() => onKeyPress(letter)}
      className="key"
    >
      <div style={{ fontSize: "18px" }}>{letter}</div>
    </button>
  );
};
