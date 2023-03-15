import { Dispatch, SetStateAction, useEffect } from "react";
import { PageState } from "../App";
import {
    Player,
    SessionData
  } from "../domains/socket/use-web-socket";



export const WaitingPage: React.FC<{
    setPageState: Dispatch<SetStateAction<PageState>>;
    players: Player[],
    sessionData: SessionData | null
  }> = ({setPageState,players: players,sessionData}) => {
    useEffect(()=>{
      if(players.length > 1){
        setPageState(PageState.PLAYING);
        
      }
    },[players])
  
    return (
      <div>
        Hello {players[0].first_name};
        <div>You are in {sessionData?.roomId}.</div>
        
        <div>Please wait while we find a match.</div>
         

       
      </div>
    );
  };
  
  