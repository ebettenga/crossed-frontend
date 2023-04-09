import { Dispatch, ReactNode, SetStateAction, useEffect } from "react";
import { PageState } from "../App";
import { Player, SessionData } from "../domains/socket/use-web-socket";
import { Layout, Space, Spin, Typography } from "antd";
import { Content } from "antd/es/layout/layout";

const { Title, Text } = Typography;

export const WaitingPage: React.FC<{
  setPageState: Dispatch<SetStateAction<PageState>>;
  players: Player[];
  sessionData: SessionData | null;
}> = ({ setPageState, players: players, sessionData }) => {
  useEffect(() => {
    if (players.length > 1) {
      setPageState(PageState.PLAYING);
    }
  }, [players]);

  return (
    <WaitingPageContainer>
      <Space direction="vertical" align="center" size="middle">
        <Text>Hey {players[0].first_name}!</Text>
        <Spin size="large" />
        <Text>Please wait while we find a match.</Text>
      </Space>
    </WaitingPageContainer>
  );
};

const WaitingPageContainer: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <Layout
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: '100vh',
        alignItems: "center",
      }}
    >
      <WaitingTitle />
      <Content
        style={{
          maxWidth: "500px",
          display: "flex",
          flex: '1 1 auto',
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

const WaitingTitle = () => <Title style={{marginTop: '3rem'}}>Finding Match</Title>;
