import { CreateDraft } from "@/features/tools/create-draft";
import { ViewDrafts } from "@/features/tools/view-drafts";
import { ViewPosts } from "../features/tools/view-posts";
import type { Tool } from "../types/tools.types";

export default [
  {
    img: "/app/view-post.webp",
    title: "View Posts",
    id: "view-post",
    Component: ViewPosts,
    accent: {
      selected:
        "data-[selected=true]:bg-sky-500/10 data-[selected=true]:ring-2 data-[selected=true]:ring-sky-500",
      focus: "focus-visible:ring-sky-500",
      surface: "group-hover:bg-sky-500/8 group-focus-visible:bg-sky-500/10",
      border:
        "group-hover:border-sky-400/50 group-focus-visible:border-sky-400/70",
      shadow:
        "group-hover:shadow-sky-500/15 group-focus-visible:shadow-sky-500/20",
      text: "group-hover:text-sky-400 group-focus-visible:text-sky-400",
    },
  },
  {
    img: "/app/view-draft.webp",
    title: "View Drafts",
    id: "view-draft",
    Component: ViewDrafts,
    accent: {
      selected:
        "data-[selected=true]:bg-amber-500/10 data-[selected=true]:ring-2 data-[selected=true]:ring-amber-500",
      focus: "focus-visible:ring-amber-500",
      surface: "group-hover:bg-amber-500/8 group-focus-visible:bg-amber-500/10",
      border:
        "group-hover:border-amber-400/50 group-focus-visible:border-amber-400/70",
      shadow:
        "group-hover:shadow-amber-500/15 group-focus-visible:shadow-amber-500/20",
      text: "group-hover:text-amber-400 group-focus-visible:text-amber-400",
    },
  },
  {
    img: "/app/create-draft.webp",
    title: "Create Draft",
    id: "create-draft",
    Component: CreateDraft,
    accent: {
      selected:
        "data-[selected=true]:bg-orange-500/10 data-[selected=true]:ring-2 data-[selected=true]:ring-orange-500",
      focus: "focus-visible:ring-orange-500",
      surface:
        "group-hover:bg-orange-500/8 group-focus-visible:bg-orange-500/10",
      border:
        "group-hover:border-orange-400/50 group-focus-visible:border-orange-400/70",
      shadow:
        "group-hover:shadow-orange-500/15 group-focus-visible:shadow-orange-500/20",
      text: "group-hover:text-orange-400 group-focus-visible:text-orange-400",
    },
  },
  {
    img: "/app/image-collection.webp",
    title: "Image Collection",
    id: "image-collection",
    Component: ViewPosts,
    accent: {
      selected:
        "data-[selected=true]:bg-violet-500/10 data-[selected=true]:ring-2 data-[selected=true]:ring-violet-500",
      focus: "focus-visible:ring-violet-500",
      surface:
        "group-hover:bg-violet-500/8 group-focus-visible:bg-violet-500/10",
      border:
        "group-hover:border-violet-400/50 group-focus-visible:border-violet-400/70",
      shadow:
        "group-hover:shadow-violet-500/15 group-focus-visible:shadow-violet-500/20",
      text: "group-hover:text-violet-400 group-focus-visible:text-violet-400",
    },
  },
  {
    img: "/app/notes.webp",
    title: "View Notes",
    id: "notes",
    Component: ViewPosts,
    accent: {
      selected:
        "data-[selected=true]:bg-yellow-500/10 data-[selected=true]:ring-2 data-[selected=true]:ring-yellow-500",
      focus: "focus-visible:ring-yellow-500",
      surface:
        "group-hover:bg-yellow-500/8 group-focus-visible:bg-yellow-500/10",
      border:
        "group-hover:border-yellow-400/50 group-focus-visible:border-yellow-400/70",
      shadow:
        "group-hover:shadow-yellow-500/15 group-focus-visible:shadow-yellow-500/20",
      text: "group-hover:text-yellow-400 group-focus-visible:text-yellow-400",
    },
  },
  {
    img: "/app/publish-post.webp",
    title: "Publish Post",
    id: "publish-post",
    Component: ViewPosts,
    accent: {
      selected:
        "data-[selected=true]:bg-emerald-500/10 data-[selected=true]:ring-2 data-[selected=true]:ring-emerald-500",
      focus: "focus-visible:ring-emerald-500",
      surface:
        "group-hover:bg-emerald-500/8 group-focus-visible:bg-emerald-500/10",
      border:
        "group-hover:border-emerald-400/50 group-focus-visible:border-emerald-400/70",
      shadow:
        "group-hover:shadow-emerald-500/15 group-focus-visible:shadow-emerald-500/20",
      text: "group-hover:text-emerald-400 group-focus-visible:text-emerald-400",
    },
  },
] as const satisfies readonly Tool[];
