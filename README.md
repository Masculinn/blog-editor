![Ultimate Blog Editor App](/public/assets/editor-app-campaign.png)

I always thought that using our own custom solutions over the ready ones is not necessary but genuine idea because we face with an unknown in other words **real challenge.** I used to write my articles using [Obsidian](https://obsidian.md/) and manually update the DB so far.

It turns out actively using this app to write and manage my technical articles. Just like this one 😅

## Introduction

The **open-source Ultimate Blog Editor App** brings together the Markdown editing experience of [Obsidian](https://obsidian.md/) and the publishing flexibility of [Substack](https://substack.com/) in a single workspace.

_The stack doesn't cost a penny._ [_Supabase_ ](https://supabase.com/)_and_ [_Netlify_](https://www.netlify.com/) _free plans are suitable. It won't let you down halfway through even at scale._

That said, it comes with amazing features listed down below:

- **Rich-Text Editing**
- **Blazing Fast Editing**
- **Markdown Editing Mode**
- **MDX Content Viewer**
- **Dynamic Error Display for Compiled MDX Source**
- **Media Library**
- **Image Optimization (converting primary formats to `.webp`)**
- **Extensive Autocomplete In English**
- **Custom Content Components (including charts from `recharts`)**
- **Command Center**
- **50+ Predefined Eye Soothing Backgrounds**
- **Draft & Post Management**
- **Document Serialization and Compression**
- **URL-Based Document State**
- **Comprehensive Keyboard Shortcuts With Full Accessibility Support**
- **Dialogs, Sheets, Shared Controls**
- **Feedback and Cloud Syncing**
- **Backend Integration**

**This project is primarily tailored for my personal use**, but it is also intended to serve as a reference for others interested in the editor architecture and development of editor features. It's so easy to change the serialized custom components and allowing you to curate them as you wish.

A snippet from the collection of app features:

![App features collection](/public/assets/blog-editor-thumb-98412b75.webp)

---

It serve as a starting point for building custom editor apps with its highly modular architecture and extensibility. Just like a puzzle box, it can be customized to fit your needs.

## Stack

| tech                   | version  |
| ---------------------- | -------- |
| Next.js                | ≥16      |
| React / React DOM      | >19      |
| TypeScript             | ≥5.0     |
| Lexical                | ≥0.49.0  |
| Supabase JS            | ≥2.112.3 |
| Tailwind CSS           | ≥4.0.0   |
| shadcn                 | ≥4.19.0  |
| Base UI                | ≥1.7.0   |
| next-mdx-remote-client | ≥2.1.12  |
| React Hook Form        | ≥7.87.0  |
| Zod                    | ≥4.5.4   |

---

My experience on very first blog using this editor was pretty good actually you can write your thoughts abot the repo maybe some improvements down the blog [using this link](https://burakdev.com/blogs/i-have-built-an-ultimate-blogging-workspace-and-open-sourced-it)

For inspiration purposes you can always [check out my Github portfolio repo slug](https://github.com/Masculinn/burakdev/blob/main/src/pages/blogs/%5Bslug%5D.tsx) to see that how I made the integration for my SSG rendered Next.js personal blog.

## Motivation

Of course, those who rely on others' solutions rather than coming up with their own in 2026 are not fools or timid. What I mean is that whatever [Substack](https://substack.com/) or [Obsidian](https://obsidian.md/) provides is maybe convenient enough for you.

Therefore you might not end up with going further, it's totally up to you.

_As far as I am concerned, these techs don't meet my expectations on their own, but would meet them if they were combined, if you're the one looking from the same window like me then you've come to the right place._

## Architecture

The app follows a modular architecture that separates editing, document previews, and content management into dedicated feature areas. Shared UI components, an extensible Lexical editor, and centralized server actions keep the code organized and make it easier to maintain and expand. Respected to DRY principles heavily.

- **Feature modules:** `features/` separates the editor, document viewer, and management tools for drafts, posts, and the media library.
- **Extensible editor:** `components/editor/` organizes Lexical nodes, plugins, extensions, toolbars, and Markdown transformers. Charts and Contents have dedicated modules for editing, rendering, and conversion.
- **MDX rendering:** `components/mdx/` defines content components and processing plugins, while `lib/mdx/` handles serialization and related error handling.
- **Server and DB layer:** `app/actions/` groups content operations, supported by the server database client in `lib/db/` and generated database types in `types/`.
- **State and validation:** `store/document.store.ts` holds document state, `providers/tools-provider.tsx` supplies shared tool context, and `schema/` defines draft validation.
- **Shared interface:** `components/ui/`, reusable modals, and `hooks/` provide consistent controls, dialogs, keyboard shortcuts, and URL parameter handling.

The working tree is pretty straightforward and scalable with it's modular design:

```text
src/
├── app/
│   ├── page.tsx         # Entry point
│   └── actions/         # Server-side content operations
├── features/
│   ├── editor/          # Editor workspace
│   ├── document-viewer/ # Content preview
│   └── tools/           # Drafts, posts, and media management
├── components/
│   ├── editor/          # Lexical nodes, plugins, and extensions
│   ├── mdx/             # MDX rendering components
│   └── ui/              # Shared interface components
├── lib/                 # Auth, database, and serialization
├── store/               # Document state
├── providers/           # Shared tool context
├── hooks/               # Reusable React hooks
├── hoc/                 # Content and metadata wrappers
├── schema/              # Validation schemas
├── types/               # Application and database types
├── constants/           # Tool and editor configuration
├── utils/               # Supporting utilities
└── proxy.ts             # Request interception
```

## Installation

### 1. Requirements

You will need:

- Node.js >= 22
- npm

Clone the repository:

```javascript
git clone https://github.com/Masculinn/blog-editor.git
cd blog-editor
```

Install dependencies:

```javascript
npm install
```

> **⚠️ CAUTION: Before continuing further you must configure the DB layer. Do not attempt running the dev server unless all the database environments and tables are configured properly. See instructions below to be able to start the dev server.**

---

### 2. Database Configuration

Visit [Supabase auth page ](https://supabase.com/dashboard/sign-up)to signup or if you have already an account simply login. Create a new organization and choose your own namespace. After that, create a table called
`blog_posts` and paste the given [PostgreSQL ](https://www.postgresql.org/)snippet below into the SQL Editor section placed in the sidebar of your dashboard.

This will create our very first table for our articles.

```sql
create table public.blog_posts (
  id serial not null,
  title text not null default 'title'::text,
  content text not null,
  tags text[] not null,
  published_at timestamp with time zone null default now(),
  description text not null default 'I AM JOHN DOE BUT CANT PROVE IT'::text,
  banner_image text not null default 'MY_DEFAULT_IMAGE_URL'::text,
  level numeric not null default '1'::numeric,
  constraint blog_posts_pkey primary key (id),
  constraint blog_posts_level_check check ((level > (0)::numeric))
) TABLESPACE pg_default;
```

> After configuring the DB and ensuring everything is stable, you can curate the predefined tables however you want.

Next, we need the secondary table for our article candidates that isn't actually ready to be considered under the category of posts. I call it **draft.**

Paste the given snippet below to create **draft** table into the SQL Editor as well.

```sql
create table public.drafts (
  id serial not null,
  title text not null default 'title'::text,
  content text null default 'The quick brown fox jumps over the lazy dog.'::text,
  tags text[] null,
  published_at timestamp with time zone null default now(),
  description text null,
  banner_image text null,
  level numeric not null default '1'::numeric,
  constraint drafts_pkey primary key (id),
  constraint drafts_level_check check ((level > (0)::numeric))
) TABLESPACE pg_default;
```

> These tables are almost identical. The only difference is the partially defined columns, which are in response to the separation of concerns principle.

Finally, we're one step away to be done on DB configuration which is creating a bucket called **banner**. To do that, move into the _storage page_ via dashboard > sidebar and create a new bucket called **banner**.

![storage-tutorial](https://ytpmpkgcjlcdidphswzv.supabase.co/storage/v1/object/public/banner/screenshot-2026-09-07-000037-9c56f442.webp)

I'm currently using my bucket publicly because I treat my bucket as an external CDN point for my media elements in my site — idc how unsafe it is so if you think that things in it must remain private then you can leave the toggle state as-is like the one showed above.

### 3. Environment Configuration

Create a brand new env file called `.env` at the root of your project and get the corresponding values of your env keys from project settings of your Supabase organization.

```bash
SUPABASE_URL = YOUR_PROJECT_URI;
SUPABASE_SERVICE_ROLE_KEY = YOUR_SERVICE_ROLE_KEY;
BUCKET_NAME = banner;

APP_TOKEN = YOUR_APP_BASE64_PSW;
APP_USER_AGENT = YOUR_APP_USER_AGENT_WITHOUT_WHITESPACE;
```

### 4. Database Types

The app uses the typegen for DB types for in particular for React actions. Everything in the `package.json` file is configured for you to invoke codegen but before doing so, you must login to your Supabase account via CLI

Run the CLI command to login your account in your IDE.

```bash
npx supabase login
```

This is going to open up a new window inside of your browser to SSO. Follow the instructions given in the CLI to login then run the following command to fetch the DB types

```bash
npm run db:types
```

### 5. Running the App

Start the development server:

```bash
npm run dev
```

The current development script starts Next.js on port `36805`:

```bash
http://localhost:36805
```

That's pretty much everything so far to run the app on locally, it takes max 5 minutes from scratch, I think it's fair.

## Usage & Writing Your First Article

#### Important Note for Unix-Based OS Developers

It's worth to mention that the **Unix**-based users like mac or linux OS, a bit differs in particular scenarios such as key bindings. If you're the one, you may want to configure the app shortcuts in a way that the modifier key `meta` handles the shortcut over `Control` because initially it's defined to `Control`

Simply find the components in your IDE search with a match for the hook imported as:

```ts
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
```

And configure like:

```tsx
useKeyboardShortcut(["Meta", "/"], () => {
  /* INTERNAL CALLBACK */
});
```

---

### Command Center & Shortcuts

> Consider `Ctrl` as `Meta` please mac & linux users.

Press `Ctrl + K` to toggle the Command Center, even while editing. Search for a tool, navigate with `↑` / `↓`, and press `Enter` to open its modal. Selecting a tool automatically closes the Command Center.

| Shortcut   | Action                    |
| ---------- | ------------------------- |
| `Ctrl + K` | Toggle the Command Center |
| `↑` / `↓`  | Navigate tools            |
| `Enter`    | Open the selected tool    |
| `Esc`      | Dismiss the active dialog |

Available tools: **View Posts**, **View Drafts**, **Create Draft**, **Media Library**, **Manage Drafts**, and **Manage Posts**.

| Shortcut   | Purpose                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Ctrl + M` | Toggle between rich-text editing and Markdown mode. [Source](https://github.com/Masculinn/blog-editor/blob/main/src/components/editor/plugins/actions/markdown-toggle-plugin.tsx)                      |
| `Ctrl + /` | Show or hide the document viewer. Requires a selected post or draft. [Source](https://github.com/Masculinn/blog-editor/blob/main/src/features/document-viewer/toggle-viewer.tsx)                       |
| `Ctrl + S` | Save content changes to the selected draft or post while the document viewer is mounted. [Source](https://github.com/Masculinn/blog-editor/blob/main/src/features/document-viewer/article-content.tsx) |

---

If you'd like to publish the posts powered by SSG render power in Next.js Pages router that maximizes your SEO by god knows how many times, you can [take a look at my blog app's Github Repo ](https://github.com/Masculinn/burakdev/blob/main/src/pages/blogs/%5Bslug%5D.tsx)to inspire by.

## Deployment

Please ensure that the DB configuration has done properly before moving on this part

#### Deploy To Netlify

The app may fail during the build when next.js is used in your stack and to prevent this add 2 more env key-pair to the env file alongside the existing keys to prevent this behaviour in your Netlify dashboard. Although I don't know the reason, I found this patch due to an error caused by its external systems.

```javascript
SECRETS_SCAN_ENABLED=false
SECRETS_SCAN_OMIT_PATHS=.netlify/.next/cache
```

---

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Masculinn/blog-editor)

---

#### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Masculinn/blog-editor)

## Contributing

Contributions are welcome! Open an issue to report a bug, suggest a feature, or discuss a significant change before starting.

1. Fork the repository and create a branch for your changes.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.
4. Make your changes, keeping them focused and consistent with the existing architecture.
5. Run `npm run check` and `npm run build` before submitting.
6. Open a pull request describing the changes, any related issues, and how you tested
7. them. Include screenshots for UI updates.

Keep credentials and environment files out of your commits.

## Acknowledgements

Huge thanks to [this repo ](https://github.com/htmujahid/shadcn-editor)and its hard-working contributors for allowing me to curate their Shadcn Editor! Lovely set of backgrounds are also scraped from [patterns craft](https://patterncraft.fun/) definitely worth to add in your checklist.
