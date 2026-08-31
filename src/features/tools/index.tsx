import { withPosts } from "@/hoc/withAllPosts";
import { cn } from "@/lib/utils";
import { PostsModal } from "@/modals/posts-modal";
import type { Blog } from "@/types/db.types";

type Tool = {
  id: string;
  title: string;
  img: string;
  accent: {
    focus: string;
    surface: string;
    border: string;
    shadow: string;
    text: string;
  };
};

const tools = [
  {
    img: "/app/view-post.webp",
    title: "View Posts",
    id: "view-post",
    accent: {
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
    accent: {
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
    accent: {
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
    accent: {
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
    accent: {
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
    accent: {
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

type ToolsProps = {
  posts: Blog[];
  className?: string;
  postId?: number;
};

async function Tools({ posts, className }: ToolsProps) {
  return (
    <aside aria-label="Post tools" className={className}>
      {tools.map((tool) => (
        <PostsModal
          key={tool.id}
          posts={posts}
          title={tool.title}
          render={<ToolButton tool={tool} />}
        />
      ))}
    </aside>
  );
}

function ToolButton({ tool }: { tool: (typeof tools)[number] }) {
  return (
    <button
      type="button"
      aria-label={tool.title}
      className={cn(
        "group relative flex min-h-24 w-24 cursor-pointer flex-col",
        "items-center justify-start gap-1 rounded-xl p-2",

        "outline-none",

        "focus-visible:ring-1",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",

        tool.accent.focus,
      )}
    >
      {/* Background interaction layer */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl",
          "bg-transparent",

          "transition-[background-color,box-shadow,transform]",
          "duration-200 ease-out",

          "group-hover:shadow-sm",
          "group-focus-visible:shadow-sm",

          "group-active:scale-95",
          "group-active:brightness-110",

          "motion-reduce:transform-none",
          "motion-reduce:transition-none",

          tool.accent.surface,
        )}
      />

      {/* Artwork */}
      <span
        aria-hidden="true"
        style={{
          backgroundImage: `url("${tool.img}")`,
        }}
        className={cn(
          "relative z-10 size-16 shrink-0 rounded-full",

          "bg-cover bg-center bg-no-repeat",

          "border border-white/10",
          "ring-1 ring-black/10",

          "shadow-md shadow-black/20",

          "transition-all duration-300 ease-out",

          "group-hover:zoom-125",
          "group-hover:saturate-200",
          "group-hover:shadow-lg",

          "group-focus-visible:-translate-y-1",
          "group-focus-visible:scale-105",
          "group-focus-visible:saturate-200",
          "group-focus-visible:hue-rotate-30",
          "group-focus-visible:shadow-lg",

          "group-active:translate-y-0",
          "group-active:scale-95",

          "motion-reduce:transform-none",
          "motion-reduce:transition-none",

          tool.accent.border,
          tool.accent.shadow,
        )}
      />

      {/* Label */}
      <span
        className={cn(
          "relative z-10 max-w-full rounded-md px-2 py-1",

          "text-center text-[10px] font-medium leading-tight",
          "text-foreground/70",

          "transition-[color,transform] duration-200",

          "group-active:translate-y-px",

          "motion-reduce:transform-none",
          "motion-reduce:transition-none",

          tool.accent.text,
        )}
      >
        {tool.title}
      </span>
    </button>
  );
}

export const GuardedTools = withPosts(Tools);
