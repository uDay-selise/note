import { useState } from "react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useT } from "../../lib/i18n/LocalizationProvider";
import { useSignUpEnabled } from "../auth/signup";
import { WelcomeScreen } from "./WelcomeScreen";

export function WelcomePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { login } = useAuth();
  const { t } = useT();
  const signUpEnabled = useSignUpEnabled();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSignIn() {
    setError(undefined);
    setSigningIn(true);
    try {
      await login("/lists");
    } catch (caught) {
      console.error("Sign-in could not be opened:", caught);
      setError(t("welcome.signInFailed"));
      setSigningIn(false);
    }
  }

  return (
    <WelcomeScreen
      error={error}
      onNavigate={onNavigate}
      onSignIn={() => void handleSignIn()}
      signingIn={signingIn}
      signUpEnabled={signUpEnabled}
    />
  );
}
