import { createCommand, type LexicalCommand, type NodeKey } from "lexical";

export const OPEN_CONTENTS_DIALOG_COMMAND: LexicalCommand<NodeKey | null> =
  createCommand("OPEN_CONTENTS_DIALOG_COMMAND");
