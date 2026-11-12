import { useQuery } from "@tanstack/react-query";
import type { BlocksUser } from "@seliseblocks/client";
import { useAuth } from "../../app/providers/AuthProvider";
import { blocksClient } from "../../lib/blocks/client";
import { useT } from "../../lib/i18n/LocalizationProvider";

export function useCurrentUser() {
  const { status } = useAuth();
  return useQuery({
    enabled: status === "authenticated",
    queryFn: () => blocksClient.iam.me(),
    queryKey: ["iam", "me"]
  });
}

export function userDisplayName(profile?: BlocksUser): string {
  if (!profile) return "";
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  return name || profile.email || "";
}

export function userFirstName(profile?: BlocksUser): string {
  return (profile?.firstName || userDisplayName(profile).split(" ")[0] || "").trim();
}

export function userInitials(profile?: BlocksUser): string {
  if (!profile) return "?";
  const first = profile.firstName?.[0];
  const last = profile.lastName?.[0];
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
  return (profile.email?.[0] ?? "?").toUpperCase();
}

/** The signed-in person as the top bar shows them. */
export function usePerson() {
  const { t } = useT();
  const { data } = useCurrentUser();
  const profile = data?.data;
  return {
    initials: userInitials(profile),
    name: userDisplayName(profile) || t("header.signedIn"),
    role: t("header.signedIn")
  };
}
