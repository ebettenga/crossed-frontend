import { useAuth0 } from "@auth0/auth0-react";
import { Dispatch, SetStateAction, useEffect } from "react";
import { PageState } from "../App";
import { useCurrentUser } from "../domains/auth/user/context";

export const LandingPage: React.FC<{
  setPageState: Dispatch<SetStateAction<PageState>>;
}> = ({ setPageState }) => {
  const user = useCurrentUser();

  return <div>{!user ? <Login /> : <Start setPageState={setPageState} />}</div>;
};

const Login: React.FC = () => {
  const { loginWithPopup } = useAuth0();

  const login = () => {
    loginWithPopup({
      authorizationParams: {
        audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE,
        redirect_uri: import.meta.env.VITE_APP_AUTH0_CALLBACK_URL,
      },
    });
  };

  return <button onClick={login}>Login</button>;
};

const Start: React.FC<{
  setPageState: Dispatch<SetStateAction<PageState>>;
}> = ({ setPageState }) => {
  return <button onClick={() => setPageState(PageState.JOINING)}>Start</button>;
};
