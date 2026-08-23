# Editor App

A modern, extensible rich-text editor built at the top of **Next.js**, **React**, **TypeScript**, and **Lexical**.

Aimed at providing a responsive document-editing experience with modular toolbar controls, rich formatting, custom editor nodes, keyboard interaction, and a component architecture that can be extended without coupling individual editor features together.

**This project is primarily tailored for my personal use**, but it is also intended to serve as a reference for others interested in the editor architecture and development of editor features. It serve as a starting point for building custom editor applications with its highly modular architecture and extensibility. Just like a puzzle box, it can be customized to fit your needs.

I am actively using this editor to write my technical articles about the web. I hope you will find it useful because it's pretty much everything you might need when transforming the `.md` into a `.mdx` where it can be used to build SSG sites with highly performant static rendering.

> **Status:** Active development. APIs, editor plugins, and internal component structure may change as the editor evolves.

---

## Overview

The project uses [Lexical](https://lexical.dev/) as its editor framework and Next.js as the application platform.

Rather than implementing the editor as one large component, functionality is separated into editor plugins, toolbar controls, shared context, hooks, and UI primitives.

The current development focus is on:

- predictable Lexical state management;
- reliable selection synchronization;
- modular toolbar plugins;
- rich-text formatting;
- custom node interaction;
- image selection and keyboard handling;
- reducing unnecessary React memoization;
- compatibility with the React Compiler;
- clean TypeScript APIs;
- maintainable editor component boundaries.

---

## Tech Stack

| Technology             | Purpose                            |
| ---------------------- | ---------------------------------- |
| **Next.js**            | Application framework              |
| **React**              | UI and component model             |
| **TypeScript**         | Static typing                      |
| **Lexical**            | Rich-text editor engine            |
| **@lexical/react**     | React integration for Lexical      |
| **@lexical/selection** | Selection and text-style utilities |
| **@lexical/utils**     | Lexical utility functions          |
| **Lucide React**       | Interface icons                    |
| **Biome**              | Formatting and static checks       |

The UI layer also uses reusable primitives such as buttons and dropdown menus, allowing editor-specific controls to remain separate from lower-level interface components.

---

## Editor Architecture

Editor App follows Lexical's plugin-oriented model.

Conceptually, the application is structured around:

```text
Editor
├── Lexical configuration
├── Editor state
├── Toolbar context
├── Toolbar plugins
│   ├── Text formatting
│   └── Additional formatting controls
├── Editor plugins
├── Custom nodes
│   └── Interactive media/image nodes
├── Selection synchronization
├── Keyboard commands
└── Shared UI components
```

A core design goal is to keep individual editor features independent.

For example, a toolbar control should generally:

1. read the current Lexical selection;
2. derive the formatting state it needs;
3. dispatch or apply an editor update;
4. synchronize itself when the selection changes.

It should not need to understand the implementation of unrelated toolbar controls.

---

## Lexical Integration

The editor makes extensive use of Lexical's command and selection APIs, including concepts such as:

```ts
$getSelection();
$isRangeSelection();
$isNodeSelection();
$setSelection();
```

and editor commands such as:

```ts
CLICK_COMMAND;
DRAGSTART_COMMAND;
KEY_ENTER_COMMAND;
KEY_ESCAPE_COMMAND;
SELECTION_CHANGE_COMMAND;
```

Lexical command registration is composed where appropriate with:

```ts
mergeRegister(...)
```

This keeps setup and cleanup of related command listeners together.

---

## Toolbar System

Toolbar functionality is implemented as independent React components/plugins instead of placing all formatting logic inside the editor root.

Shared editor state can be coordinated through the toolbar context and editor update hooks.

Representative internal modules include:

```text
components/
├── toolbar-context
├── use-update-toolbar
└── ui/
    ├── button
    └── dropdown-menu
```

This arrangement allows toolbar plugins to focus on a single editor concern.

---

## Selection Handling

Selection is treated as editor state rather than ordinary DOM state.

The project distinguishes between Lexical selection types when implementing editor behavior:

### Range selections

Used for normal text selections and cursor-based formatting.

```ts
$isRangeSelection(selection);
```

### Node selections

Used when interacting with custom nodes such as media or images.

```ts
$isNodeSelection(selection);
```

This distinction is particularly important for keyboard handling, click behavior, deletion, focus management, and custom node interactions.

---

## Interactive Nodes

The editor supports interaction patterns for non-text editor nodes.

These components can integrate with:

```ts
useLexicalComposerContext();
useLexicalEditable();
useLexicalNodeSelection();
```

This enables a custom node component to understand:

- the current Lexical editor instance;
- whether the editor is editable;
- whether the node itself is selected;
- selection changes;
- click interactions;
- keyboard commands;
- drag operations.

Node-specific behavior is kept connected to Lexical's editor state instead of maintaining a second independent selection system in the DOM.

---

## React Compiler

The project is designed with the **React Compiler** enabled.

Because of that, manual memoization is not added automatically to every component or callback.

The codebase favors ordinary React code unless referential stability is actually required by:

> _It's worth to mention that due to using memoization pretty much everywhere in the project, some edge cases may cause unexpected bugs. So I am actively working on ensuring the memoizationsare stable enough to keep the app performant across the app. I will be so glad if in case you folks find one and create an issue ticket, would be great for anyone ✨_

- an effect dependency;
- an external subscription;
- command registration;
- a third-party API;
- or another concrete identity-sensitive boundary.

This avoids unnecessary combinations of:

```ts
useMemo(...)
useCallback(...)
memo(...)
```

when the compiler or normal React rendering model can handle the component correctly without them.

Memoization is therefore treated as a correctness or measurable performance tool rather than a default coding convention.

---

### React Compiler

```ts
reactCompiler: true;
```

Allows the project to take advantage of compiler-driven React optimizations.

### Typed Routes

```ts
typedRoutes: true;
```

Provides stronger TypeScript checking for application routes.

### Partial Prefetching

```ts
partialPrefetching: true;
```

Enables the corresponding Next.js navigation optimization.

### Cache Components

```ts
cacheComponents: true;
```

Uses Next.js component caching infrastructure.

Some of these capabilities may depend on the installed Next.js version and can evolve between framework releases.

---

## TypeScript

The project is written in TypeScript and favors explicit types around editor boundaries.

Examples include Lexical types such as:

```ts
LexicalCommand;
LexicalEditor;
NodeKey;
BaseSelection;
```

and React types where appropriate:

```ts
JSX;
```

The intent is to preserve type information through editor commands, nodes, plugins, and component props rather than falling back to broad `any` types.

---

## Development

### Requirements

You will need:

- Node.js
- npm

Clone the repository:

```bash
git clone https://github.com/Masculinn/blog-editor.git
cd blog-editor
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The current development script starts Next.js on port `36805`:

```text
http://localhost:36805
```

---

## Available Scripts

### Development

```bash
npm run dev
```

Runs:

```bash
next dev -p 36805
```

### Production build

```bash
npm run build
```

Runs:

```bash
next build
```

### Production server

```bash
npm run start
```

Runs:

```bash
next start
```

### Static checks

```bash
npm run lint
```

Runs:

```bash
biome check
```

### Formatting

```bash
npm run format
```

Runs:

```bash
biome format --write
```

---

## Development Principles

### Keep Lexical updates inside Lexical

Editor mutations should happen through:

```ts
editor.update(() => {
  // Lexical state mutation
});
```

rather than by directly manipulating content in the DOM.

### Treat selections explicitly

Before performing a formatting operation, the implementation should verify the expected selection type.

For example:

```ts
const selection = $getSelection();

if (!$isRangeSelection(selection)) {
  return;
}
```

Node-oriented operations should similarly validate node selections where required.

### Keep toolbar state derived

Toolbar UI should represent the current editor state rather than becoming an independent source of truth for document formatting.

### Separate editor behavior from UI primitives

Components such as buttons and dropdown menus should remain generic.

Lexical-specific behavior belongs in editor plugins and toolbar components.

### Prefer focused plugins

A plugin should have a clear responsibility rather than becoming a global controller for unrelated editor behavior.

### Avoid speculative memoization

`useMemo`, `useCallback`, and `React.memo` should be introduced when they solve an actual identity or performance problem—not solely because a function or value is recreated during rendering.

### Clean up editor registrations

Lexical commands and listeners must be unregistered when their owning React component is disposed.

Where multiple registrations belong together, `mergeRegister()` is preferred.

---

## Example Plugin Pattern

A typical editor plugin obtains the Lexical instance through the composer context:

```tsx
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";

export function ExamplePlugin() {
  const [editor] = useLexicalComposerContext();

  function applyChange() {
    editor.update(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }

      // Apply the editor operation here.
    });
  }

  // Render plugin UI or register editor behavior.
  return null;
}
```

More complex plugins can additionally register Lexical commands, listen for selection changes, or interact with custom nodes.

---

## Project Direction

Editor App is being developed as an editor foundation rather than a single-purpose text area.

The architecture is intended to make it practical to continue adding features such as:

```text
Formatting
├── Typography
├── Block formatting
├── Lists
├── Links
└── Additional text styles

Content
├── Images
├── Media
└── Custom Lexical nodes

Interaction
├── Keyboard commands
├── Node selection
├── Drag handling
└── Context-sensitive toolbar state

Application
├── Document persistence
├── Import/export
└── Extended document workflows
```

Features listed in this section describe the architectural direction and should not necessarily be interpreted as completed functionality.

---

## Contributing

The project is currently under active development.

When contributing:

1. keep editor features isolated where practical;
2. preserve Lexical's editor-state model;
3. avoid direct DOM mutations for document state;
4. maintain strict TypeScript typing;
5. remove unnecessary abstractions rather than adding them preemptively;
6. use manual React memoization only when it serves a concrete purpose;
7. run Biome checks before submitting changes.

Before opening a pull request:

```bash
npm run lint
npm run build
```

Formatting can be normalized with:

```bash
npm run format
```

---

## Repository Status

The editor architecture is still being refined, particularly around complex interactions between React lifecycle behavior and Lexical's command, node, and selection systems.

Expect refactoring while those APIs are stabilized.

Bug reports and focused improvements are welcome.

---

## Acknowledgements

Editor App is built on top of the excellent open-source work provided by:

- [Lexical](https://lexical.dev/)
- [React](https://react.dev/)
- [Next.js](https://nextjs.org/)
- [Lucide](https://lucide.dev/)
- [Biome](https://biomejs.dev/)

---

## License

MIT license is currently specified for this project.
