import { Dispatch, SetStateAction } from "react";
import { PageState } from "../App";
import { JoinRoomPayload } from "../hooks/useWebSocket";


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
  