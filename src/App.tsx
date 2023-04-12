import { useState } from "react";
import invariant from "tiny-invariant";
import "./App.css";
import { useCurrentUser } from "./domains/user/use-current-user";
import { useGame } from "./domains/socket/use-web-socket";
import { GamePage } from "./pages/Game";
import { JoinRoom } from "./pages/Join";
import { LandingPage } from "./pages/Landing";
import { WaitingPage } from "./pages/Waiting";
import { StorageKeys, useSession } from "./hooks/use-session";

export enum PageState {
  LANDING,
  WAITING,
  JOINING,
  PLAYING,
}

function App() {
  const { get: getRoom } = useSession(StorageKeys.ROOM_ID);
  const roomId = getRoom();
  const [pageState, setPageState] = useState(PageState.LANDING);
  const {
    guess,
    players,
    board,
    sessionData,
    loadRoom,
    joinRoom,
    getSquareById,
  } = useGame();
  const { user } = useCurrentUser();

  if (!user) return <LandingPage setPageState={setPageState} />;

  roomId && loadRoom(parseInt(roomId), setPageState);

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
          sessionData={sessionData}
        />
      );
    default:
      return <LandingPage setPageState={setPageState} />;
  }
}

export default App;
