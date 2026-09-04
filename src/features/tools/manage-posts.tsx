"use client";

import {
  type BlogWithoutContent,
  deletePostAction,
  viewPostsAction,
} from "@/app/actions/posts.action";
import { PostDifficulty } from "@/components/blog/post-difficulty";
import { Modal } from "@/components/modal";
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
import { cn } from "@/lib/utils";
import { FileTextIcon, LoaderCircleIcon, TrashIcon } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ToolComponentProps } from "../../types/tools.types";

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateFormatter.format(date);
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

  async function loadPosts() {
    if (loadedRef.current || loadingRef.current) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const data = await viewPostsAction(false);

      setPosts(data);
      loadedRef.current = true;
    } catch {
      toast.error("Failed to fetch posts.");
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }

  function handleDelete(id: BlogWithoutContent["id"]) {
    if (isPending) {
      return;
    }

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
        onOpenChange={(open) => {
          if (open) {
            void loadPosts();
          }
        }}
        wrapper={({ children }) => (
          <div className="w-full px-4 pb-8 sm:px-6 lg:px-10 lg:pb-16">
            <div className="overflow-hidden rounded-2xl border bg-accent/20 shadow-sm">
              <div
                className={cn(
                  "scrollbar-custom max-h-[70dvh] w-full",
                  "overflow-x-scroll overflow-y-auto overscroll-contain",
                  "[&>div]:overflow-visible",
                )}
              >
                {children}
              </div>
            </div>
          </div>
        )}
      >
        {() =>
          isLoading && !posts.length ? (
            <PostsTableSkeleton />
          ) : (
            <Table className="w-full min-w-6xl">
              <TableHeader className="sticky top-0 z-20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-11 w-18 whitespace-nowrap px-4 text-xs font-semibold text-muted-foreground">
                    ID
                  </TableHead>

                  <TableHead className="h-11 min-w-48 whitespace-nowrap px-4 text-xs font-semibold text-muted-foreground">
                    Title
                  </TableHead>

                  <TableHead className="h-11 min-w-72 whitespace-nowrap px-4 text-xs font-semibold text-muted-foreground">
                    Description
                  </TableHead>

                  <TableHead className="h-11 w-24 whitespace-nowrap px-4 text-xs font-semibold text-muted-foreground">
                    Level
                  </TableHead>

                  <TableHead className="h-11 min-w-52 whitespace-nowrap px-4 text-xs font-semibold text-muted-foreground">
                    Tags
                  </TableHead>

                  <TableHead className="h-11 min-w-44 whitespace-nowrap px-4 text-xs font-semibold text-muted-foreground">
                    Published at
                  </TableHead>

                  <TableHead
                    className={cn(
                      "sticky z-30 h-11 w-32 min-w-32",
                      "border-l px-4 text-center",
                      "text-xs font-semibold text-muted-foreground backdrop-blur",
                    )}
                  ></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!posts.length ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="h-48">
                      <div className="flex flex-col items-center justify-center gap-3 px-6 text-center">
                        <div className="flex size-11 items-center justify-center rounded-full border">
                          <FileTextIcon className="size-4.5 text-muted-foreground shrink-0" />
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
                          {formatDate(post.published_at)}
                        </TableCell>

                        <TableCell
                          className={cn(
                            "sticky right-0 z-10 border-l px-4 py-3",
                            "transition-colors group-hover:bg-accent/30",
                          )}
                        >
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={isPending}
                              onClick={() => setPostToDelete(post)}
                            >
                              {isDeleting ? (
                                <LoaderCircleIcon className="size-4 animate-spin" />
                              ) : (
                                <TrashIcon className="size-4" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )
        }
      </Modal>

      <AlertDialog
        open={postToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) {
            setPostToDelete(null);
          }
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

                if (!postToDelete) {
                  return;
                }

                handleDelete(postToDelete.id);
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

function PostsTableSkeleton() {
  return (
    <Table className="w-full min-w-6xl">
      <TableHeader className="sticky top-0 z-20 backdrop-blur ">
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-11 w-18 px-4">ID</TableHead>
          <TableHead className="h-11 min-w-48 px-4">Title</TableHead>
          <TableHead className="h-11 min-w-72 px-4">Description</TableHead>
          <TableHead className="h-11 w-24 px-4">Level</TableHead>
          <TableHead className="h-11 min-w-52 px-4">Tags</TableHead>
          <TableHead className="h-11 min-w-44 px-4">Published at</TableHead>

          <TableHead
            className={cn(
              "sticky z-30 h-11 w-32 min-w-32",
              "border-l px-4 text-center ",
            )}
          >
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static index
          <TableRow key={index}>
            <TableCell className="px-4 py-3">
              <Skeleton className="h-4 w-8" />
            </TableCell>

            <TableCell className="px-4 py-3">
              <Skeleton className="h-4 w-36" />
            </TableCell>

            <TableCell className="px-4 py-3">
              <Skeleton className="h-4 w-64" />
            </TableCell>

            <TableCell className="px-4 py-3">
              <Skeleton className="h-4 w-8" />
            </TableCell>

            <TableCell className="px-4 py-3">
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-18 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </TableCell>

            <TableCell className="px-4 py-3">
              <Skeleton className="h-4 w-32" />
            </TableCell>

            <TableCell className="sticky right-0 z-10 border-l bg-background px-4 py-3">
              <div className="flex justify-end">
                <Skeleton className="h-8 w-20" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
