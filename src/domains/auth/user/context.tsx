import React from "react";
import { User } from "./user";

export const UserContext = React.createContext<User | undefined>(undefined);

export const useCurrentUser = () => {
  const user = React.useContext(UserContext);
  return user;
};

export const UserProvider: React.FC<{ children: React.ReactElement; user: User | undefined }> = ({ children, user }) => <UserContext.Provider value={user}>{children}</UserContext.Provider>;

