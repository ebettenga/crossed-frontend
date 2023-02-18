import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

  
  export const useWebSocket = () => {
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
    
    const sendMessage = (message: unknown) => {
        if (socketInstance) {
            socketInstance.send(message)
        }
    }

    const joinRoom = (roomId: number) => {
        if (socketInstance) {
            socketInstance.emit("join", {"room": roomId})
        } 
    }
    
    useEffect(() => {
              const socket = io("localhost:5000/", {
                transports: ["websocket"],
              });
        
              setSocketInstance(socket);
        
              // @ts-ignore
              socket.on("connect", (data: any) => {
                // socket.emit("join", {"room": 1});
              });

              socket.on("message", (data: any) => {
                console.log("this happened")
                console.log(data)
              })
        
        
              // @ts-ignore
              socket.on("disconnect", (data: AsyncGeneratorFunctionConstructor) => {
                console.log(data);
              });
        
              return function cleanup() {
                socket.disconnect();
              };
            
          }, []);

    return {
        joinRoom,
        sendMessage
    }
  };