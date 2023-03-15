import { Dispatch, ReactNode, SetStateAction, useEffect } from "react";
import { PageState } from "../App";
import { useCurrentUser } from "../domains/user/use-current-user";
import { JoinRoomPayload, SessionData } from "../domains/socket/use-web-socket";
import invariant from "tiny-invariant";
import { PageContainer, Spacer } from "../domains/components/spacing";
import { Button } from "antd";

export const JoinRoom = ({
  sessionData,
  setPageState,
  joinRoom,
}: {
  setPageState: Dispatch<SetStateAction<PageState>>;
  joinRoom: (joinRoomPayload: JoinRoomPayload) => void;
  sessionData: SessionData | null;
}) => {
  useEffect(() => {
    if (sessionData?.roomId) {
      setPageState(PageState.WAITING);
    }
  }, [sessionData?.roomId]);

  return (
    <PageContainer>
      <JoinRoomTitle />
      <Spacer margin={"10vh"} />
      <DifficultlyButtonContainer>
        <SelectDifficultyButton
          difficulty="easy"
          joinRoom={joinRoom}
          title={"Easy"}
        />
        <SelectDifficultyButton
          difficulty="medium"
          joinRoom={joinRoom}
          title={"Medium"}
        />
        <SelectDifficultyButton
          difficulty="hard"
          joinRoom={joinRoom}
          title={"Hard"}
        />
      </DifficultlyButtonContainer>
    </PageContainer>
  );
};

const JoinRoomTitle = () => <h1>Select Difficulty</h1>;

const DifficultlyButtonContainer: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

const SelectDifficultyButton: React.FC<{
  joinRoom: (joinRoomPayload: JoinRoomPayload) => void;
  difficulty: "easy" | "medium" | "hard";
  title: "Easy" | "Medium" | "Hard";
}> = ({ joinRoom, difficulty, title }) => {
  const {user} = useCurrentUser();
  invariant(user, "user not found during difficulty selection");
  return (
    <>
      <Button onClick={() => joinRoom({ difficulty, user_id: user.id })}>
        {title}
      </Button>
      <Spacer margin={"5vh"} />
    </>
  );
};
