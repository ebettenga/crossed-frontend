import { Dispatch, SetStateAction } from "react";
import { PageState } from "../App";
import { Button } from "../domains/components/button";
import { PageContainer, Spacer } from "../domains/components/spacing";
import { useCurrentUser } from "../domains/user/use-current-user";

export const LandingPage: React.FC<{
  setPageState: Dispatch<SetStateAction<PageState>>;
}> = ({ setPageState }) => {
  const { user } = useCurrentUser();

  return !user ? <Login /> : <Start setPageState={setPageState} />;
};

const Login: React.FC = () => {
  const { login, isLoading } = useCurrentUser();

  return (
    <PageContainer>
      <HomeTitle />
      <Spacer margin={"5rem"} />
      <Button onClick={login}>{isLoading ? "..." : "Login"}</Button>
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
