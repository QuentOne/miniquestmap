"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function JoinMapForm() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length === 4) {
      router.push(`/m/${trimmed}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
        placeholder="ENTER CODE"
        maxLength={4}
        className="text-center font-mono tracking-[0.3em] uppercase"
      />
      <Button type="submit" variant="secondary" disabled={code.trim().length !== 4}>
        View
      </Button>
    </form>
  );
}
