import { Dispatch, ReactNode, SetStateAction, useEffect } from "react";
import { PageState } from "../App";
import { useCurrentUser } from "../domains/user/use-current-user";
import { JoinRoomPayload, SessionData } from "../domains/socket/use-web-socket";
import invariant from "tiny-invariant";
import { Button, Layout, Space } from "antd";
import Title from "antd/es/typography/Title";

const { Content } = Layout;

const JoinPageContainer: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Layout
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <JoinRoomTitle />
      <div style={{ paddingTop: "30px" }}></div>
      <Content
        style={{
          maxWidth: "500px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "space-between",
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

export interface ButtonInfo {
  difficulty: "easy" | "medium" | "hard";
  title: "Easy" | "Medium" | "Hard";
}

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

  const buttonData: ButtonInfo[] = [
    {
      difficulty: "easy",
      title: "Easy",
    },
    {
      difficulty: "medium",
      title: "Medium",
    },
    {
      difficulty: "hard",
      title: "Hard",
    },
  ];

  return (
    <JoinPageContainer>
      <Space>
        {buttonData.map(({ difficulty, title }) => {
          return (
            <>
              <SelectDifficultyButton
                difficulty={difficulty}
                joinRoom={joinRoom}
                title={title}
              />
            </>
          );
        })}
      </Space>
    </JoinPageContainer>
  );
};

const JoinRoomTitle = () => <Title>Select Difficulty</Title>;

const SelectDifficultyButton: React.FC<{
  joinRoom: (joinRoomPayload: JoinRoomPayload) => void;
  difficulty: "easy" | "medium" | "hard";
  title: "Easy" | "Medium" | "Hard";
}> = ({ joinRoom, difficulty, title }) => {
  const { user } = useCurrentUser();
  invariant(user, "user not found during difficulty selection");
  return (
    <>
      <Button
        type="primary"
        onClick={() => joinRoom({ difficulty, user_id: user.id })}
      >
        {title}
      </Button>
    </>
  );
};
