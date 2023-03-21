import { Button, Card, Divider, Layout, List, Space, Typography } from "antd";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { PageState } from "../App";
import { PageContainer, Spacer } from "../domains/components/spacing";
import { JoinRoomPayload } from "../domains/socket/use-web-socket";
import { useCurrentUser } from "../domains/user/use-current-user";
import { useSession } from "../hooks/use-session";

const { Title } = Typography;

const { Content } = Layout;

const LandingPageContainer: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <Layout
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <HomeTitle />
      <Content
        style={{
          maxWidth: "500px",
          minHeight: "100vh",
          display: "flex",
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

export const LandingPage: React.FC<{
  setPageState: Dispatch<SetStateAction<PageState>>;
}> = ({ setPageState }) => {
  const { user } = useCurrentUser();

  return !user ? <Login /> : <Start setPageState={setPageState} />;
};

const Login: React.FC = () => {
  const { login, isLoading } = useCurrentUser();

  return (
    <LandingPageContainer>
      <Button size="large" type="primary" onClick={login}>
        {isLoading ? "..." : "Login"}
      </Button>
    </LandingPageContainer>
  );
};

const gridStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "center",
};

const Start: React.FC<{
  setPageState: Dispatch<SetStateAction<PageState>>;
}> = ({ setPageState }) => {

  const rules = [
    "press a square to see the clue",
    "press the square again to change the clue direction",
    "correct guesses will earn points",
    "incorrect guesses will lose points",
  ];

  return (
    <LandingPageContainer>
      <Card
        style={{
          minWidth: 300,
          maxWidth: 700,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card.Grid style={gridStyle}>
          <Title level={4}>How To Play</Title>
        </Card.Grid>
        <Card.Grid style={gridStyle}>
          <RulesList rules={rules} />
        </Card.Grid>
        <Card.Grid style={gridStyle}>
          <Button
            size="large"
            type="primary"
            onClick={() => setPageState(PageState.JOINING)}
          >
            Start
          </Button>
        </Card.Grid>
      </Card>
    </LandingPageContainer>
  );
};

const HomeTitle = () => <Title>Crossed</Title>;

const RulesList: React.FC<{ rules: string[] }> = ({ rules }) => (
  <List
    itemLayout="horizontal"
    style={{
      minWidth: "300px",
    }}
    dataSource={rules}
    renderItem={(item, index) => (
      <List.Item key={index}>
        <List.Item.Meta description={item} />
      </List.Item>
    )}
  />
);
