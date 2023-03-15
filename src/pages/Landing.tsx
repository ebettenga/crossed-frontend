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
      <Spacer margin={"2rem"} />
      <HowToPlayText />
    </PageContainer>
  );
};

const HomeTitle = () => <h1>Crossed</h1>;

const HowToPlayText = () => (
  <div
    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
  >
    <h4>How To Play</h4>
    <ul>
      <li>press a square to see the clue</li>
      <li>press the square again to change the clue direction</li>
      <br />
      <li>correct guesses will earn points</li>
      <li>incorrect guesses will lose points</li>
    </ul>
  </div>
);
