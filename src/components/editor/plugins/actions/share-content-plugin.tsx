"use client";

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
import {
  getContentLengthError,
  getDocumentCharacterCount,
  MAX_CONTENT_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_CONTENT_LENGTH,
  validateDocument,
} from "@/lib/small-talk-validation";
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

  if (title.length > MAX_TITLE_LENGTH) {
    return {
      status: "error",
      message: `The title cannot exceed ${MAX_TITLE_LENGTH} characters.`,
    };
  }

  const validationError = validateDocument(payload.doc);

  if (validationError) {
    return {
      status: "error",
      message: validationError,
    };
  }

  try {
    const result = await createSmallTalkAction(payload.doc, title);

    if (!result.success) {
      return {
        status: "error",
        message: result.message,
      };
    }

    return {
      status: "success",
      message: "Content published",
    };
  } catch {
    return {
      status: "error",
      message: "Content could not be saved.",
    };
  }
}

export function ShareContentPlugin() {
  const [editor] = useLexicalComposerContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const submissionRef = useRef(false);

  const [saveState, saveAction, isSaving] = useActionState(
    saveDocumentAction,
    INITIAL_SAVE_STATE,
  );

  const contentLengthError = getContentLengthError(characterCount);
  const isContentValid = contentLengthError === null;

  useEffect(() => {
    function updateCharacterCount() {
      const document = serializedDocumentFromEditorState(
        editor.getEditorState(),
        { source: "editor" },
      );

      setCharacterCount(getDocumentCharacterCount(document));
    }

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      const document = serializedDocumentFromEditorState(editorState, {
        source: "editor",
      });

      setCharacterCount(getDocumentCharacterCount(document));
    });

    updateCharacterCount();

    return unregister;
  }, [editor]);

  useEffect(() => {
    if (saveState.status === "idle") {
      return;
    }

    submissionRef.current = false;

    if (saveState.status === "success") {
      toast.success(saveState.message);
      formRef.current?.reset();
      setDialogOpen(false);
      return;
    }

    toast.error(saveState.message);
  }, [saveState]);

  function getSerializedDocument(): SerializedDocument {
    return serializedDocumentFromEditorState(editor.getEditorState(), {
      source: "editor",
    });
  }

  function handleDialogOpenChange(open: boolean): void {
    if (isSaving || submissionRef.current) {
      return;
    }

    if (open) {
      const validationError = validateDocument(getSerializedDocument());

      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    setDialogOpen(open);
  }

  function saveDoc(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (isSaving || submissionRef.current) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const titleValue = formData.get("title");

    if (typeof titleValue !== "string" || !titleValue.trim()) {
      toast.error("A title is required.");
      return;
    }

    const title = titleValue.trim();

    if (title.length > MAX_TITLE_LENGTH) {
      toast.error(`The title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
      return;
    }

    const doc = getSerializedDocument();
    const validationError = validateDocument(doc);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    submissionRef.current = true;

    startTransition(() => {
      saveAction({ doc, title });
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              size="sm"
              variant="success"
              onClick={() => handleDialogOpenChange(true)}
              disabled={isSaving || !isContentValid}
              title={contentLengthError ?? "Publish"}
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
            (contentLengthError ?? "Publish Content")
          )}
        </TooltipContent>
      </Tooltip>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish document</DialogTitle>
          <DialogDescription>
            Give your document a title before publishing it. The title and
            document will be publicly visible in Posts. Content must contain
            between {MIN_CONTENT_LENGTH} and {MAX_CONTENT_LENGTH} characters.
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
              maxLength={MAX_TITLE_LENGTH}
              disabled={isSaving}
              required
              autoFocus
            />

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
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSaving || !isContentValid}
              variant="success"
            >
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
