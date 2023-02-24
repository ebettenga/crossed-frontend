import { useState } from "react";
import invariant from "tiny-invariant";
import "./App.css";
import {
  useWebSocket,
} from "./hooks/useWebSocket";
import { GamePage } from "./pages/Game";
import { JoinRoom } from "./pages/Join";
import { LandingPage } from "./pages/Landing";

export enum PageState {
  LANDING,
  JOINING,
  PLAYING,
}

function App() {
  const [pageState, setPageState] = useState(PageState.JOINING);
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
