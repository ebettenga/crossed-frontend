import { Auth0Provider } from "@auth0/auth0-react";
import React, { PropsWithChildren } from "react";

interface Auth0ProviderWithNavigateProps {
  children: React.ReactNode;
}

export const Auth0ProviderWithNavigate = ({
  children,
}: PropsWithChildren<Auth0ProviderWithNavigateProps>): JSX.Element | null => {
  const domain = import.meta.env.VITE_APP_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_APP_AUTH0_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_APP_AUTH0_CALLBACK_URL;
  const audience = import.meta.env.VITE_APP_AUTH0_AUDIENCE;
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        audience: audience,
        redirect_uri: redirectUri,
      }}
    >
      {children}
    </Auth0Provider>
  );
};
