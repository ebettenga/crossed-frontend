import { User, useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { UserProvider } from "./context";

export const UserWrapper: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>();
  const {
    user: OauthUser,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();

  const makeUserRequest = async (): Promise<User> => {
    return getAccessTokenSilently().then((token) => {
      return fetch("http://localhost:5000/api/v1/me", {
        method: "POST",
        headers: [
          ["Authorization", `Bearer ${token}`],
          ["Content-Type", "application/json"],
        ],
        body: JSON.stringify(OauthUser),
      })
        .then((data) => data.json())
        .then((data) => {
          return data;
        });
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      makeUserRequest().then((user) => {
        setUser(user);
      });
    }
  }, [isAuthenticated]);

  return <UserProvider user={user}>{children}</UserProvider>;
};
