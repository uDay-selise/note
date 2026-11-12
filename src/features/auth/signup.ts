import { useEffect, useState } from "react";
import { blocksClient } from "../../lib/blocks/client";

export function useSignUpEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let live = true;
    blocksClient.iam.signupSettings
      .get()
      .then((answer) => {
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
