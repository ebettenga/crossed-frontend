import { useAuth0 } from "@auth0/auth0-react";

export const LandingPage = () => {
  const { user, loginWithPopup } = useAuth0();

  const login = () => {
    loginWithPopup({
      authorizationParams: { audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE, redirect_uri: import.meta.env.VITE_APP_AUTH0_CALLBACK_URL },
    }).then((data) => {
      console.log(data);
    });
  };

  return (
    <div>
      <div>{user?.given_name}</div>
      <button onClick={login}>Login</button>
    </div>
  );
};
