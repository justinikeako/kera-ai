"use client";

import { authClient } from "#/server/better-auth/client";
import type { Session } from "better-auth";

export function SignInSignOutGoogle({
  session,
}: {
  session: Session | null | undefined;
}) {
  async function handleSignInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
    });
  }

  async function handleSignOut() {
    await authClient.signOut();
  }

  return (
    <>
      {!session ? (
        <form>
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            onClick={handleSignInWithGoogle}
          >
            Sign in with Google
          </button>
        </form>
      ) : (
        <form>
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </form>
      )}
    </>
  );
}
