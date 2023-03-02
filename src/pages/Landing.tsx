import { useAuth0 } from "@auth0/auth0-react";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { PageState } from "../App";
import { Button } from "../domains/components/button";
import { PageContainer, Spacer } from "../domains/components/spacing";
import { useCurrentUser } from "../domains/user/context";

export const LandingPage: React.FC<{
  setPageState: Dispatch<SetStateAction<PageState>>;
}> = ({ setPageState }) => {
  const user = useCurrentUser();

  return !user ? <Login /> : <Start setPageState={setPageState} />;
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

  return (
    <PageContainer>
      <HomeTitle />
      <Spacer margin={"5rem"} />
      <Button onClick={login}>Login</Button>
    </PageContainer>
  );
};

const Start: React.FC<{
  setPageState: Dispatch<SetStateAction<PageState>>;
}> = ({ setPageState }) => {
  return (
    <PageContainer>
      <HomeTitle />
      <Spacer margin={"5rem"} />
      <Button onClick={() => setPageState(PageState.JOINING)}>Start</Button>
    </PageContainer>
  );
};



const HomeTitle = () => <h1>Crossed</h1>;

