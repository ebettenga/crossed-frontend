import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthenticationGuard } from "./domains/auth/authentication-guard";
import { useWebSocket } from "./hooks/useWebSocket";
import { LandingPage } from "./pages/LandingPage";

function App() {
  const recieveMessage = (message: string) => {
    setMessages((oldMessages) => [...oldMessages, message]);
  };

  const { sendMessage, joinRoom, guess } = useWebSocket(recieveMessage);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);

  const updateMessage = (e: any) => {
    setMessage(e.target.value);
  };

  const send = () => {
    sendMessage({ message, room: "1" });
    setMessage("");
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/game"
        element={<AuthenticationGuard component={LandingPage} />}
      />
      <Route path="/public" element={<LandingPage />} />
      {/* Error page */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default App;
