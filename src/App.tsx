import { useAuth0 } from "@auth0/auth0-react";
import {Dispatch, SetStateAction, useState } from "react";
import invariant from "tiny-invariant";
import "./App.css";
import { Guess, JoinRoomPayload, Room, useWebSocket } from "./hooks/useWebSocket";

enum PageState {
  LANDING,
  JOINING,
  PLAYING,
}

function App() {
  const [pageState, setPageState] = useState(PageState.JOINING);
  const { guess, board, state: {downClues}, joinRoom } = useWebSocket();

  switch (pageState) {
    case PageState.LANDING:
      return <LandingPage />;
    case PageState.JOINING:
      return <JoinRoom joinRoom={joinRoom} setPageState={setPageState} />;
    case PageState.PLAYING:
      invariant(board, "board must be present")
      return <GameState guess={guess} board={board}  />;
    default:
      return <LandingPage />;
  }
}

export default App;

export const LandingPage = () => {
  const { user, loginWithPopup, getAccessTokenSilently } = useAuth0();

  const login = () => {
    loginWithPopup({
      authorizationParams: {
        audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE,
        redirect_uri: import.meta.env.VITE_APP_AUTH0_CALLBACK_URL,
      },
    }).then((data) => {
      console.log(data);
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

  const getCrosswords = () => {
    makeRequest(
      "http://localhost:5000/api/v1/crosswords?page=1&limit=4&dow=Tuesday"
    ).then((data) => {
      console.log(data);
    });
  };

  return (
    <div>
      <div>{user?.email}</div>
      <button onClick={login}>Login</button>
      <button onClick={() => getCrosswords()}>Make request</button>
    </div>
  );
};

export const JoinRoom = ({setPageState, joinRoom}: {setPageState: Dispatch<SetStateAction<PageState>>, joinRoom: (joinRoomPayload: JoinRoomPayload) => void}) => {
  return (
    <div>
      <button onClick={() => joinRoom({ difficulty: "easy", user_id: 1 })}>
        Join Room
      </button>
      <button onClick={() => {setPageState(PageState.PLAYING)}}>Start Game</button>
    </div>
  );
};

// Game Stuff

export const GameState = ({guess, board}: {guess: (guess: Guess) => void, board: Room}) => {
  const [inputValue, setInputValue] = useState("");
  const [x, setXValue] = useState(0);
  const [y, setYValue] = useState(0);

  const handleClick = () => {
    guess({
      x: x,
      y: y,
      room_id: board?.id ?? 19,
      user_id: 1,
      guess: inputValue
    })
    setInputValue("")
  };


  return (
    <>
      <input type="text" value={inputValue} onChange={(e) => {setInputValue(e.target.value)}} />
      <input type="number" value={x} onChange={(e) => {setXValue(parseInt(e.target.value))}} />
      <input type="number" value={y} onChange={(e) => {setYValue(parseInt(e.target.value))}} />
      <button onClick={() => handleClick()}>Guess</button>
      { board?.found_letters }
    </>
  );
};
