import { useAuth0 } from "@auth0/auth0-react";
import React, { Dispatch, SetStateAction, useState } from "react";

export const BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? "http://localhost:5001";

export interface User {
  id: number;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: URL;
}

interface UserState {
  user: User | undefined;
  setUser: Dispatch<SetStateAction<User | undefined>>;
}

export const UserContext = React.createContext<UserState>({
  user: undefined,
  setUser: () => {},
});

export const useCurrentUser = () => {
  const { user, setUser } = React.useContext(UserContext);
  const [isLoading, setLoading] = useState(false);
  const {
    user: OauthUser,
    getAccessTokenSilently,
    loginWithPopup,
  } = useAuth0();

  const updateUser = async () => {
    setLoading(true);
    getAccessTokenSilently().then((token) => {
      fetch(`${BASE_URL}/api/v1/me`, {
        method: "POST",
        headers: [
          ["Authorization", `Bearer ${token}`],
          ["Content-Type", "application/json"],
        ],
        body: JSON.stringify(OauthUser),
      })
        .then((data) => data.json() as Promise<User>)
        .then((userData) => {
          setUser(userData);
        }).finally(() => {
          setLoading(false);
        })
    });
  };

  const login = () => {
    loginWithPopup({
      authorizationParams: {
        audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE,
        redirect_uri: import.meta.env.VITE_APP_AUTH0_CALLBACK_URL,
      },
    }).then(() => {
      updateUser();
    });
  };

  return { user, login, isLoading };
};

export const UserProvider: React.FC<{
  children: React.ReactElement;
  user: {
    user: User | undefined;
    setUser: Dispatch<SetStateAction<User | undefined>>;
  };
}> = ({ children, user }) => (
  <UserContext.Provider value={user}>{children}</UserContext.Provider>
);

export const UserWrapper: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>();

  const values = { user, setUser };

  return <UserProvider user={values}>{children}</UserProvider>;
};
