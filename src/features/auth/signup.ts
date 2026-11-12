import { useEffect, useState } from "react";
import { blocksClient } from "../../lib/blocks/client";

type SignUpSettings = { isSignUpEnable?: boolean; isEmailPasswordSignUpEnabled?: boolean };

/** Whether the project lets people make their own account, read without a session. */
export function useSignUpEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let live = true;
    blocksClient.iam.signupSettings
      .get()
      .then((answer: SignUpSettings | undefined) => {
        if (!live) return;
        setEnabled(Boolean(answer?.isSignUpEnable ?? answer?.isEmailPasswordSignUpEnabled));
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, []);

  return enabled;
}
