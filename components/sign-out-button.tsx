"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";

export function SignOutButton() {
  return (
    <Button variant="ghost" size="sm" onClick={() => signOut()}>
      Sign out
    </Button>
  );
}
