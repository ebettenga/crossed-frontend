import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Auth0ProviderWithNavigate } from "./domains/auth/auth-provider-with-navigate";
import { UserWrapper } from "./domains/user/use-current-user";
import 'antd/dist/reset.css';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Auth0ProviderWithNavigate>
      <UserWrapper>
        <App />
      </UserWrapper>
    </Auth0ProviderWithNavigate>
  </React.StrictMode>
);
