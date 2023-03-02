import React from "react";


export interface User {
  id: number;
created_at: string;
first_name: string;
last_name: string;
email: string;
profile_image: URL;
}

export const UserContext = React.createContext<User | undefined>(undefined);

export const useCurrentUser = () => {
  const user = React.useContext(UserContext);
  return user;
};

export const UserProvider: React.FC<{ children: React.ReactElement; user: User | undefined }> = ({ children, user }) => <UserContext.Provider value={user}>{children}</UserContext.Provider>;

