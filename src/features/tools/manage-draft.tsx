"use client";

import viewDraftsAction, {
    deleteDraftAction,
    publishDraftAction,
} from "@/app/actions/drafts.action";
import { Modal } from "@/components/modal";
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
import { getDraftPublishIssues } from "@/lib/draft";
import { cn } from "@/lib/utils";
import type { Draft } from "@/types/db.types";
import { formatTime } from "@/utils/formatTime";
import {
    AlertTriangleIcon,
    GlobeIcon,
    LoaderCircleIcon,
    TrashIcon,
} from "lucide-react";
import { Fragment, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ToolComponentProps } from "../../types/tools.types";

type DraftAction = "delete" | "publish";

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

  const [isPending, startTransition] = useTransition();

  const loadedRef = useRef(false);
  const loadingRef = useRef(false);

  async function loadDrafts() {
    if (loadedRef.current || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const data = await viewDraftsAction(true);

      setDrafts(data);
      loadedRef.current = true;
    } catch {
      toast.error("Failed to fetch drafts.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }

  function handleDelete(id: Draft["id"]) {
    if (isPending) return;

    setPendingDraftId(id);
    setPendingAction("delete");

    startTransition(async () => {
      try {
        const result = await deleteDraftAction(id);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        setDrafts((current) => current.filter((draft) => draft.id !== id));

        setSelectedDraftId((current) => (current === id ? null : current));

        toast.success("Draft deleted.");
      } catch {
        toast.error("Failed to delete draft.");
      } finally {
        setPendingDraftId(null);
        setPendingAction(null);
      }
    });
  }

  function handlePublish(id: Draft["id"]) {
    if (isPending) return;

    const draft = drafts.find((item) => item.id === id);
    if (!draft) return;

    const issues = getDraftPublishIssues(draft);

    if (issues.length) {
      setSelectedDraftId(id);
      return;
    }

    setPendingDraftId(id);
    setPendingAction("publish");

    startTransition(async () => {
      try {
        const result = await publishDraftAction(id, false);

        if (!result.success) {
          setSelectedDraftId(id);

          toast.error(result.error);
          return;
        }

        setDrafts((current) => current.filter((draft) => draft.id !== id));
        setSelectedDraftId((current) => (current === id ? null : current));

        toast.success("Draft published.");
      } catch {
        toast.error("Failed to publish draft.");
      } finally {
        setPendingDraftId(null);
        setPendingAction(null);
      }
    });
  }

  return (
    <Modal
      title={title}
      render={render}
      finalFocus={false}
      onOpenChange={(open) => {
        if (open) {
          void loadDrafts();
        }
      }}
      wrapper={({ children }) => (
        <div className="w-full overflow-hidden pb-12 px-8">
          <div className="max-h-[70dvh] w-full overflow-auto rounded-xl">
            {children}
          </div>
        </div>
      )}
    >
      {() =>
        isLoading && !drafts.length ? (
          <DraftTableSkeleton />
        ) : (
          <Table className="min-w-225">
            <TableHeader className="sticky top-0 z-20 bg-background">
              <TableRow>
                <TableHead className="w-18">ID</TableHead>
                <TableHead className="min-w-48">Title</TableHead>
                <TableHead className="min-w-72">Description</TableHead>
                <TableHead className="w-24">Level</TableHead>
                <TableHead className="min-w-52">Tags</TableHead>
                <TableHead className="min-w-44">Published at</TableHead>
                <TableHead className="w-60 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!drafts.length ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No drafts found.
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
                          "cursor-pointer",
                          isSelected && "bg-muted/50",
                        )}
                        onClick={() =>
                          setSelectedDraftId((current) =>
                            current === draft.id ? null : draft.id,
                          )
                        }
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {draft.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {draft.title || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {draft.description ? (
                            <p
                              className="max-w-96 truncate text-muted-foreground"
                              title={draft.description}
                            >
                              {draft.description}
                            </p>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{draft.level}</TableCell>
                        <TableCell>
                          {draft.tags?.length ? (
                            <div className="flex max-w-72 flex-wrap gap-1">
                              {draft.tags.map((tag) => (
                                <Badge key={tag} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {draft.published_at
                            ? formatTime(draft.published_at)
                            : "N/A"}
                        </TableCell>
                        <TableCell onClick={(event) => event.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleDelete(draft.id)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleDelete(draft.id)
                              }
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
                              onClick={() => handlePublish(draft.id)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleDelete(draft.id)
                              }
                            >
                              {isPublishing ? (
                                <LoaderCircleIcon className="size-4 animate-spin" />
                              ) : (
                                <GlobeIcon className="size-4" />
                              )}
                              Publish
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {isSelected && !canPublish && (
                        <TableRow className="bg-destructive/5 hover:bg-destructive/5">
                          <TableCell colSpan={7}>
                            <div className="flex gap-3 py-1">
                              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />

                              <div className="space-y-1">
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
        )
      }
    </Modal>
  );
}

function DraftTableSkeleton() {
  return (
    <Table className="min-w-225">
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead>Published at</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static index
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-36" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-64" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-8" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-22" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
