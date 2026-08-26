import {
  $getDocument,
  type EditorConfig,
  ElementNode,
  type LexicalNode,
  type NodeKey,
} from "lexical";

export class DetailsSummaryNode extends ElementNode {
  static getType(): string {
    return "details-summary";
  }

  static clone(node: DetailsSummaryNode): DetailsSummaryNode {
    return new DetailsSummaryNode(node.__key);
  }

  constructor(key: NodeKey | undefined = undefined) {
    super(key);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = $getDocument().createElement("summary");

    element.className = "cursor-pointer select-none font-medium outline-none";

    return element;
  }

  updateDOM(): boolean {
    return false;
  }
}

export function $createDetailsSummaryNode(): DetailsSummaryNode {
  return new DetailsSummaryNode();
}

export function $isDetailsSummaryNode(
  node: LexicalNode | null | undefined,
): node is DetailsSummaryNode {
  return node instanceof DetailsSummaryNode;
}
