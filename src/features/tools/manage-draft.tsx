"use client";

import viewDraftsAction, {
  deleteDraftAction,
  publishDraftAction,
} from "@/app/actions/drafts.action";
import { PostDifficulty } from "@/components/blog/post-difficulty";
import { Modal, useModalTrigger } from "@/components/modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateDraft } from "@/features/tools/create-draft";
import { getDraftPublishIssues } from "@/lib/draft";
import { cn } from "@/lib/utils";
import type { Draft } from "@/types/db.types";
import type { ToolComponentProps } from "@/types/tools.types";
import { formatTime } from "@/utils/formatTime";
import {
  AlertTriangleIcon,
  GlobeIcon,
  LoaderCircleIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import {
  Fragment,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { toast } from "sonner";

type DraftAction = "delete" | "publish";

type Confirmation = {
  action: DraftAction;
  draftId: Draft["id"];
};

const COLUMNS = [
  { label: "ID", className: "w-18", skeleton: "w-8" },
  { label: "Title", className: "min-w-48", skeleton: "w-36" },
  { label: "Description", className: "min-w-72", skeleton: "w-64" },
  { label: "Level", className: "w-24", skeleton: "w-8" },
  { label: "Tags", className: "min-w-52", skeleton: "w-32" },
  { label: "Published at", className: "min-w-44", skeleton: "w-32" },
] as const;

function DraftsTableWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="w-full px-4 pb-8 sm:px-6 lg:px-10 lg:pb-16">
      <div className="overflow-hidden rounded-2xl border bg-accent/20 shadow-sm">
        <div className="scrollbar-custom max-h-[70dvh] w-full overflow-x-scroll overflow-y-auto overscroll-contain [&>div]:overflow-visible">
          {children}
        </div>
      </div>
    </div>
  );
}

function EditDraftTrigger({ disabled }: { disabled: boolean }) {
  const { open, openModal } = useModalTrigger();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={(event) => {
        event.stopPropagation();
        openModal();
      }}
    >
      <PencilIcon className="size-4" />
      Edit
    </Button>
  );
}

export function ManageDraft({ render, title }: ToolComponentProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<DraftAction | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<Draft["id"] | null>(
    null,
  );
  const [pendingDraftId, setPendingDraftId] = useState<Draft["id"] | null>(
    null,
  );
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadedRef = useRef(false);
  const loadingRef = useRef(false);
  const mutationRef = useRef(false);

  async function loadDrafts() {
    if (loadedRef.current || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      setDrafts(await viewDraftsAction(true));
      loadedRef.current = true;
    } catch {
      toast.error("Failed to fetch drafts.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }

  function handleSaved(updated: Draft) {
    setDrafts((current) =>
      current.map((draft) => (draft.id === updated.id ? updated : draft)),
    );
  }

  function requestDelete(id: Draft["id"]) {
    if (mutationRef.current) return;
    setConfirmation({ action: "delete", draftId: id });
  }

  function requestPublish(id: Draft["id"]) {
    if (mutationRef.current) return;

    const draft = drafts.find((item) => item.id === id);
    if (!draft) return;

    if (getDraftPublishIssues(draft).length) {
      setSelectedDraftId(id);
      return;
    }

    setConfirmation({ action: "publish", draftId: id });
  }

  function handleConfirm() {
    if (!confirmation || mutationRef.current) return;

    const { action, draftId } = confirmation;
    mutationRef.current = true;
    setPendingDraftId(draftId);
    setPendingAction(action);

    startTransition(async () => {
      try {
        const result =
          action === "delete"
            ? await deleteDraftAction(draftId)
            : await publishDraftAction(draftId, false);

        if (!result.success) {
          if (action === "publish") setSelectedDraftId(draftId);
          toast.error(result.error);
          return;
        }

        setDrafts((current) => current.filter((draft) => draft.id !== draftId));
        setSelectedDraftId((current) => (current === draftId ? null : current));
        setConfirmation(null);
        toast.success(
          action === "delete" ? "Draft deleted." : "Draft published.",
        );
      } catch {
        toast.error(
          action === "delete"
            ? "Failed to delete draft."
            : "Failed to publish draft.",
        );
      } finally {
        mutationRef.current = false;
        setPendingDraftId(null);
        setPendingAction(null);
      }
    });
  }

  const confirmationDraft = confirmation
    ? drafts.find((draft) => draft.id === confirmation.draftId)
    : null;

  return (
    <>
      <Modal
        title={title}
        render={render}
        finalFocus={false}
        wrapper={DraftsTableWrapper}
        onOpenChange={(open) => {
          if (open) void loadDrafts();
        }}
      >
        {() => (
          <Table className="w-full min-w-304">
            <TableHeader className="sticky top-0 z-20  backdrop-blur">
              <TableRow className="hover:bg-transparent">
                {COLUMNS.map((column) => (
                  <TableHead
                    key={column.label}
                    className={cn(
                      "h-11 whitespace-nowrap px-4 text-xs font-semibold text-muted-foreground",
                      column.className,
                    )}
                  >
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className="sticky right-0 z-30 h-11 min-w-76 border-l  px-4 text-right text-xs font-semibold text-muted-foreground backdrop-blur">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !drafts.length ? (
                [1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {COLUMNS.map((column) => (
                      <TableCell key={column.label} className="px-4 py-3">
                        <Skeleton className={cn("h-4", column.skeleton)} />
                      </TableCell>
                    ))}
                    <TableCell className="sticky right-0 z-10 border-l px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-22" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : !drafts.length ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="h-44">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <div className="flex size-10 items-center justify-center rounded-full border bg-accent/20">
                        <GlobeIcon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">No drafts found</p>
                        <p className="text-xs text-muted-foreground">
                          Your saved drafts will appear here.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                drafts.map((draft) => {
                  const issues = getDraftPublishIssues(draft);
                  const canPublish = issues.length === 0;
                  const isSelected = selectedDraftId === draft.id;
                  const isCurrentDraft =
                    isPending && pendingDraftId === draft.id;
                  const isDeleting =
                    isCurrentDraft && pendingAction === "delete";
                  const isPublishing =
                    isCurrentDraft && pendingAction === "publish";

                  return (
                    <Fragment key={draft.id}>
                      <TableRow
                        aria-selected={isSelected}
                        className={cn(
                          "group cursor-pointer transition-colors hover:bg-accent/20",
                          isSelected && "bg-accent/50",
                        )}
                        onClick={() =>
                          setSelectedDraftId((current) =>
                            current === draft.id ? null : draft.id,
                          )
                        }
                      >
                        <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {draft.id}
                        </TableCell>
                        <TableCell className="max-w-56 px-4 py-3 font-medium">
                          {draft.title ? (
                            <p className="truncate" title={draft.title}>
                              {draft.title}
                            </p>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-80 px-4 py-3">
                          {draft.description ? (
                            <p
                              className="truncate text-muted-foreground"
                              title={draft.description}
                            >
                              {draft.description}
                            </p>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {draft.level !== null ? (
                            <PostDifficulty level={draft.level} />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {draft.tags?.length ? (
                            <div className="flex max-w-72 flex-wrap gap-1.5">
                              {draft.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="rounded-full px-2 py-0.5 font-normal"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {draft.published_at
                            ? formatTime(draft.published_at)
                            : "N/A"}
                        </TableCell>
                        <TableCell
                          className="sticky right-0 z-10 border-l  px-4 py-3 transition-colors "
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={isPending}
                              onClick={() => requestDelete(draft.id)}
                            >
                              {isDeleting ? (
                                <LoaderCircleIcon className="size-4 animate-spin" />
                              ) : (
                                <TrashIcon className="size-4" />
                              )}
                              Delete
                            </Button>
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              disabled={isPending || !canPublish}
                              onClick={() => requestPublish(draft.id)}
                            >
                              {isPublishing ? (
                                <LoaderCircleIcon className="size-4 animate-spin" />
                              ) : (
                                <GlobeIcon className="size-4" />
                              )}
                              Publish
                            </Button>
                            <CreateDraft
                              type="draft"
                              id={draft.id}
                              title="Edit Draft"
                              onSaved={handleSaved}
                              render={<EditDraftTrigger disabled={isPending} />}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                      {isSelected && !canPublish && (
                        <TableRow className="bg-destructive/5 hover:bg-destructive/5">
                          <TableCell colSpan={7} className="px-4 py-3">
                            <div className="flex items-start gap-3 rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2.5">
                              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
                              <div className="min-w-0 space-y-1.5">
                                <p className="text-sm font-medium text-destructive">
                                  This draft cannot be published.
                                </p>
                                <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                                  {issues.map((issue) => (
                                    <li
                                      key={issue}
                                      className="before:mr-1.5 before:content-['•']"
                                    >
                                      {issue}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Modal>
      <AlertDialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open && !mutationRef.current) setConfirmation(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation?.action === "delete" ? (
                <>
                  This will permanently delete{" "}
                  <span className="font-medium text-foreground">
                    {confirmationDraft?.title || "this draft"}
                  </span>
                  . This action cannot be undone.
                </>
              ) : (
                <>
                  This will publish{" "}
                  <span className="font-medium text-foreground">
                    {confirmationDraft?.title || "this draft"}
                  </span>{" "}
                  and remove it from your drafts.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending || !confirmationDraft}
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
              className={cn(
                confirmation?.action === "delete" &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              )}
            >
              {isPending && (
                <LoaderCircleIcon className="size-4 animate-spin" />
              )}
              {confirmation?.action === "delete" ? "Delete" : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
