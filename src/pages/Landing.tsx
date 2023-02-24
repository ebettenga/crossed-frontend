import { Dispatch, SetStateAction } from "react";
import { PageState } from "../App";



export const LandingPage: React.FC<{
    setPageState: Dispatch<SetStateAction<PageState>>;
  }> = ({ setPageState }) => {
    // const { user, loginWithPopup, getAccessTokenSilently } = useAuth0();
  
    // const login = () => {
    //   loginWithPopup({
    //     authorizationParams: {
    //       audience: import.meta.env.VITE_APP_AUTH0_AUDIENCE,
    //       redirect_uri: import.meta.env.VITE_APP_AUTH0_CALLBACK_URL,
    //     },
    //   }).then((data) => {
    //     setPageState(PageState.JOINING);
    //   });
    // };
  
    // const makeRequest = async (url: string) => {
    //   return getAccessTokenSilently().then((token) => {
    //     return fetch(url, {
    //       headers: [["Authorization", `Bearer ${token}`]],
    //     }).then((data) => {
    //       return data.json().then((data) => {
    //         return data;
    //       });
    //     });
    //   });
    // };
  
    return (
      <div>
        Hello
        {/* <div>{user?.email}</div>
        <button onClick={login}>Login</button> */}
      </div>
    );
  };
  
  