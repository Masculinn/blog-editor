import type { Dispatch, ReactElement, SetStateAction } from "react";

export type ToolComponentProps = {
  render: ReactElement | undefined;
  title: string;
  [key: string]: unknown;
};

export type Tool = {
  id: string;
  title: string;
  img: string;

  Component: React.ComponentType<ToolComponentProps>;

  accent: {
    focus: string;
    selected: string;
    surface: string;
    border: string;
    shadow: string;
    text: string;
  };
};

export type ToolsContext = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export type ToolItem = {
  className?: string;
  close: () => void;
};
