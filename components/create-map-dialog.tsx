"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMap, type ActionState } from "@/lib/actions";
import { Plus } from "lucide-react";

const initialState: ActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating…" : "Create map"}
    </Button>
  );
}

export function CreateMapDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createMap, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="rounded-full" />}>
        <Plus className="size-4" />
        New map
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new quest map</DialogTitle>
          <DialogDescription>
            Give your map a name and define its root quest — every other node
            branches from here.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Map title</Label>
            <Input id="title" name="title" required placeholder="Elden Ring Side Quests" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rootTitle">Root quest title</Label>
            <Input id="rootTitle" name="rootTitle" required placeholder="Begin the journey" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rootDescription">Root quest description</Label>
            <Textarea
              id="rootDescription"
              name="rootDescription"
              placeholder="What does this quest involve?"
              rows={3}
            />
          </div>
          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
