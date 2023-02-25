import { Dispatch, SetStateAction, useEffect } from "react";
import { PageState } from "../App";
import { JoinRoomPayload,
         SessionData
 } from "../hooks/useWebSocket";


export const JoinRoom = ({
    
    sessionData,
    setPageState,
    joinRoom,
    
  }: {
    setPageState: Dispatch<SetStateAction<PageState>>;
    joinRoom: (joinRoomPayload: JoinRoomPayload) => void;
    sessionData: SessionData | null

  }) => {
    useEffect(()=>{
      if(sessionData?.roomId){
        setPageState(PageState.WAITING);
        
      }
    },[sessionData?.roomId])
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
  