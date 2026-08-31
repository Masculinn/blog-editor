// @ts-nocheck

import type { SeparatorProps } from "@base-ui/react";
import {
  MdAnchor,
  MdBlockquote,
  MdCaption,
  MdCode,
  MdContents,
  MdDetails,
  MdHeading,
  MdHr,
  MdImage,
  MdList,
  MdOl,
  MdParagraph,
  MdPre,
  MdSummary,
  MdTable,
  MdTbody,
  MdTd,
  MdTh,
  MdThead,
  MdTr,
  MdUl,
} from "./ui";

type IntrinsicComponentMap = {
  [K in keyof JSX.IntrinsicElements]?: React.ComponentType<
    JSX.IntrinsicElements[K]
  >;
};
export type MDXComponentsMap = IntrinsicComponentMap &
  Record<string, ComponentType>;

function createMDXComponents<T extends MDXComponentsMap>(component: T): T {
  return component;
}

export const MDXComponents = createMDXComponents({
  h1: (props) => <MdHeading as="h1" {...props} />,
  h2: (props) => <MdHeading as="h2" {...props} />,
  h3: (props) => <MdHeading as="h3" {...props} />,
  h4: (props) => <MdHeading as="h4" {...props} />,
  h5: (props) => <MdHeading as="h5" {...props} />,
  h6: (props) => <MdHeading as="h6" {...props} />,
  blockquote: (props) => <MdBlockquote {...props} />,
  img: (props) => <MdImage {...props} />,
  a: (props) => <MdAnchor {...props} />,
  code: (props) => <MdCode {...props} />,
  li: (props) => <MdList className="text-[1.15rem]" {...props} />,
  ol: (props) => <MdOl {...props} />,
  ul: (props) => <MdUl {...props} />,
  table: (props) => <MdTable {...props} />,
  thead: (props) => <MdThead {...props} />,
  tbody: (props) => <MdTbody {...props} />,
  tr: (props) => <MdTr {...props} />,
  th: (props) => <MdTh {...props} />,
  td: (props) => <MdTd {...props} />,
  caption: (props) => <MdCaption {...props} />,
  hr: (props: SeparatorProps) => <MdHr {...props} />,
  p: (props) => <MdParagraph {...props} />,
  pre: (props) => <MdPre {...props} />,
  Details: (props) => <MdDetails {...props} />,
  Summary: (props) => <MdSummary {...props} />,
  Contents: (props) => <MdContents {...props} />,
});
