import { useState } from "react";
import invariant from "tiny-invariant";
import "./App.css";
import { useCurrentUser } from "./domains/user/use-current-user";
import { useWebSocket } from "./domains/socket/use-web-socket";
import { GamePage } from "./pages/Game";
import { JoinRoom } from "./pages/Join";
import { LandingPage } from "./pages/Landing";
import { WaitingPage } from "./pages/Waiting";

export enum PageState {
  LANDING,
  WAITING,
  JOINING,
  PLAYING,
}

function App() {
  const [pageState, setPageState] = useState(PageState.LANDING);
  const { guess, players, board, clues, sessionData, joinRoom, getSquareById } =
    useWebSocket();
  const {user} = useCurrentUser();

  if (!user) return <LandingPage setPageState={setPageState} />;

  switch (pageState) {
    case PageState.LANDING:
      return <LandingPage setPageState={setPageState} />;
    case PageState.JOINING:
      return (
        <JoinRoom
          joinRoom={joinRoom}
          setPageState={setPageState}
          sessionData={sessionData}
        />
      );
    case PageState.WAITING:
      return (
        <WaitingPage
          setPageState={setPageState}
          players={players}
          sessionData={sessionData}
        />
      );
    case PageState.PLAYING:
      invariant(board, "board must be present");
      invariant(sessionData, "sessionData must be present");
      return (
        <GamePage
          guess={guess}
          getSquareById={getSquareById}
          players={players}
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
