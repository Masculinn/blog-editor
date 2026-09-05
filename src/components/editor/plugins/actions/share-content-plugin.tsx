"use client";

import {
  type SerializedDocument,
  serializedDocumentFromEditorState,
} from "@lexical/file";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { GlobeIcon } from "lucide-react";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { createSmallTalkAction } from "@/app/actions/create-small-talk";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { docToHash } from "@/lib/serialization";

type SaveState =
  | {
      status: "idle";
      message: "";
    }
  | {
      status: "success";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

type SaveDocumentPayload = {
  doc: SerializedDocument;
  title: string;
};

const INITIAL_SAVE_STATE: SaveState = {
  status: "idle",
  message: "",
};

async function saveDocumentAction(
  _previousState: SaveState,
  payload: SaveDocumentPayload,
): Promise<SaveState> {
  const title = payload.title.trim();

  if (!title) {
    return {
      status: "error",
      message: "A title is required.",
    };
  }

  try {
    const hash = await docToHash(payload.doc);

    const contentHashed = hash.startsWith("#") ? hash : `#${hash}`;

    const res = await createSmallTalkAction(contentHashed, title);

    if (!res.success) {
      return {
        status: "error",
        message: res.message,
      };
    }

    return {
      status: "success",
      message: "Content published",
    };
  } catch {
    return {
      status: "error",
      message: "Content could not be saved",
    };
  }
}

export function ShareContentPlugin() {
  const [editor] = useLexicalComposerContext();

  const [dialogOpen, setDialogOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const [saveState, saveAction, isSaving] = useActionState(
    saveDocumentAction,
    INITIAL_SAVE_STATE,
  );

  useEffect(() => {
    if (saveState.status === "success") {
      toast.success(saveState.message);

      formRef.current?.reset();
      setDialogOpen(false);

      return;
    }

    if (saveState.status === "error") {
      toast.error(saveState.message);
    }
  }, [saveState]);

  function getSerializedDocument(): SerializedDocument {
    return serializedDocumentFromEditorState(editor.getEditorState(), {
      source: "editor",
    });
  }

  function handleDialogOpenChange(open: boolean): void {
    if (isSaving) return;
    setDialogOpen(open);
  }

  function saveDoc(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const titleValue = formData.get("title");

    if (typeof titleValue !== "string") {
      toast.error("A title is required.");
      return;
    }

    const title = titleValue.trim();

    if (!title) {
      toast.error("A title is required.");
      return;
    }

    const doc = getSerializedDocument();

    startTransition(() => {
      saveAction({
        doc,
        title,
      });
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="sm"
              variant="success"
              onClick={() => setDialogOpen(true)}
              disabled={isSaving}
              title="Publish"
              aria-label="Publish current editor content"
              className="p-2"
            />
          }
        >
          <GlobeIcon />
          Publish
        </TooltipTrigger>

        <TooltipContent>
          {isSaving ? (
            <>
              <span className="pr-1">Saving</span>
              <Spinner className="size-4" />
            </>
          ) : (
            "Publish Content"
          )}
        </TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish document</DialogTitle>
          <DialogDescription>
            Give your document a title before publishing it. The title and
            document will be publicly visible in Posts.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={saveDoc} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="document-title">Document title</Label>
            <Input
              id="document-title"
              name="title"
              type="text"
              placeholder="Give this document a title"
              autoComplete="off"
              maxLength={37}
              disabled={isSaving}
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              This title will identify your document in the public Posts list.
            </p>
            <Separator orientation="horizontal" className="my-1" />
            <p className="text-xs text-rose-400">
              *Warning, please note that <b>you cannot</b> publish a new post if
              you have published 3 posts before.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSaving} variant="success">
              {isSaving ? (
                <>
                  <Spinner className="size-4" />
                  Publishing...
                </>
              ) : (
                <>
                  <GlobeIcon className="size-4" />
                  Publish
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
