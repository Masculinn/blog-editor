"use client";

import {
  deletePostAction,
  viewPostsAction,
  type BlogWithoutContent,
} from "@/app/actions/posts.action";
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
import { cn } from "@/lib/utils";
import type { ToolComponentProps } from "@/types/tools.types";
import { formatTime } from "@/utils/formatTime";
import {
  FileTextIcon,
  LoaderCircleIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

const COLUMNS = [
  { label: "ID", className: "w-18", skeleton: "w-8" },
  { label: "Title", className: "min-w-48", skeleton: "w-36" },
  { label: "Description", className: "min-w-72", skeleton: "w-64" },
  { label: "Level", className: "w-24", skeleton: "w-8" },
  { label: "Tags", className: "min-w-52", skeleton: "w-32" },
  { label: "Published at", className: "min-w-44", skeleton: "w-32" },
] as const;

function PostsTableWrapper({ children }: { children: ReactNode }) {
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

function EditPostTrigger({ disabled }: { disabled: boolean }) {
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

export function ManagePosts({ render, title }: ToolComponentProps) {
  const [posts, setPosts] = useState<BlogWithoutContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogWithoutContent | null>(
    null,
  );
  const [pendingPostId, setPendingPostId] = useState<
    BlogWithoutContent["id"] | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const loadedRef = useRef(false);
  const loadingRef = useRef(false);
  const mutationRef = useRef(false);

  async function loadPosts() {
    if (loadedRef.current || loadingRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      setPosts(await viewPostsAction(false));
      loadedRef.current = true;
    } catch {
      toast.error("Failed to fetch posts.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }

  function handleSaved(updated: BlogWithoutContent) {
    setPosts((current) =>
      current.map((post) => (post.id === updated.id ? updated : post)),
    );
  }

  function requestDelete(post: BlogWithoutContent) {
    if (mutationRef.current) return;
    setPostToDelete(post);
  }

  function handleDelete(id: BlogWithoutContent["id"]) {
    if (mutationRef.current) return;

    mutationRef.current = true;
    setPendingPostId(id);

    startTransition(async () => {
      try {
        const result = await deletePostAction(id);

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        setPosts((current) => current.filter((post) => post.id !== id));
        setPostToDelete(null);
        toast.success("Post deleted.");
      } catch {
        toast.error("Failed to delete post.");
      } finally {
        mutationRef.current = false;
        setPendingPostId(null);
      }
    });
  }

  return (
    <>
      <Modal
        title={title}
        render={render}
        finalFocus={false}
        wrapper={PostsTableWrapper}
        onOpenChange={(open) => {
          if (open) void loadPosts();
        }}
      >
        {() => (
          <Table className="w-full min-w-6xl">
            <TableHeader className="sticky top-0 z-20 ">
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
                <TableHead className="sticky right-0 z-30 h-11 min-w-52 border-l px-4 text-right text-xs font-semibold text-muted-foreground backdrop-blur">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !posts.length ? (
                [1, 2, 3, 4, 5].map((row) => (
                  <TableRow key={row}>
                    {COLUMNS.map((column) => (
                      <TableCell key={column.label} className="px-4 py-3">
                        <Skeleton className={cn("h-4", column.skeleton)} />
                      </TableCell>
                    ))}
                    <TableCell className="sticky right-0 z-10 border-l  px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : !posts.length ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="h-48">
                    <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
                      <div className="flex size-11 items-center justify-center rounded-full border">
                        <FileTextIcon className="size-4.5 shrink-0 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          No published posts
                        </p>
                        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                          Published posts will appear here once they become
                          available.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => {
                  const isDeleting = isPending && pendingPostId === post.id;

                  return (
                    <TableRow
                      key={post.id}
                      className="group transition-colors hover:bg-accent/35"
                    >
                      <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {post.id}
                      </TableCell>
                      <TableCell className="max-w-56 px-4 py-3 font-medium">
                        <p className="truncate" title={post.title}>
                          {post.title}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-80 px-4 py-3">
                        <p
                          className="truncate text-muted-foreground"
                          title={post.description}
                        >
                          {post.description}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <PostDifficulty level={post.level} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {post.tags.length ? (
                          <div className="flex max-w-72 flex-wrap gap-1.5">
                            {post.tags.map((tag) => (
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
                        {post.published_at
                          ? formatTime(post.published_at)
                          : "N/A"}
                      </TableCell>
                      <TableCell
                        className="sticky right-0 z-10 border-l px-4 py-3 transition-colors "
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isPending}
                            onClick={() => requestDelete(post)}
                          >
                            {isDeleting ? (
                              <LoaderCircleIcon className="size-4 animate-spin" />
                            ) : (
                              <TrashIcon className="size-4" />
                            )}
                            Delete
                          </Button>
                          <CreateDraft
                            type="post"
                            id={post.id}
                            title="Edit Post"
                            onSaved={handleSaved}
                            render={<EditPostTrigger disabled={isPending} />}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Modal>
      <AlertDialog
        open={postToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !mutationRef.current) setPostToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The post{" "}
              <span className="font-medium text-foreground">
                {postToDelete?.title}
              </span>{" "}
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending || !postToDelete}
              onClick={(event) => {
                event.preventDefault();
                if (postToDelete) handleDelete(postToDelete.id);
              }}
              render={<Button type="button" variant="destructive" />}
            >
              {isPending ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : (
                <TrashIcon className="size-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
