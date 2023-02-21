import { useAuth0 } from "@auth0/auth0-react";

export const LandingPage = () => {
  const { user, loginWithPopup, getAccessTokenSilently } = useAuth0();

  const login = () => {
    loginWithPopup({
      authorizationParams: {
        audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE,
        redirect_uri: import.meta.env.VITE_APP_AUTH0_CALLBACK_URL,
      },
    }).then((data) => {
      
      console.log(data);
    });
  };

  const makeRequest = async () => {
    let token = "";
    await getAccessTokenSilently().then((data) => {
     token = data 
    })
    fetch("http://localhost:5000/api/v1/crosswords?page=1&limit=4&dow=Tuesday", {headers: [['Authorization', `Bearer ${token}`]]}).then(data => {
      console.log(data)
    })
  }

  return (
    <div>
      <div>{user?.email}</div>
      <button onClick={login}>Login</button>
      <button onClick={() => makeRequest()}>Make request</button>
    </div>
  );
};
