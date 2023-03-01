import { useState } from "react";
import invariant from "tiny-invariant";
import "./App.css";
import {
  useWebSocket,
} from "./hooks/useWebSocket";
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
  const { guess, players, board, clues, sessionData, joinRoom } = useWebSocket();

  switch (pageState) {
    case PageState.LANDING:
      return <LandingPage setPageState={setPageState} />;
    case PageState.WAITING:
        return <WaitingPage setPageState={setPageState} players={players} sessionData={sessionData}/>
    case PageState.JOINING:
      return <JoinRoom joinRoom={joinRoom} setPageState={setPageState} sessionData={sessionData}/>;
    case PageState.PLAYING:
      invariant(board, "board must be present");
      invariant(sessionData, "sessionData must be present");
      return (
        <GamePage
          guess={guess}
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
