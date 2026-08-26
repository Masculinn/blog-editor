import {
  $getDocument,
  type DOMExportOutput,
  type EditorConfig,
  ElementNode,
  type LexicalNode,
  type NodeKey,
} from "lexical";

export class DetailsContentNode extends ElementNode {
  static getType(): string {
    return "details-content";
  }

  static clone(node: DetailsContentNode): DetailsContentNode {
    return new DetailsContentNode(node.__key);
  }

  constructor(key: NodeKey | undefined = undefined) {
    super(key);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = $getDocument().createElement("div");

    element.className = "pt-2";
    element.setAttribute("data-details-content", "");

    return element;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = $getDocument().createElement("div");
    element.setAttribute("data-details-content", "");

    return { element };
  }

  isShadowRoot(): boolean {
    return true;
  }
}

export function $createDetailsContentNode(): DetailsContentNode {
  return new DetailsContentNode();
}

export function $isDetailsContentNode(
  node: LexicalNode | null | undefined,
): node is DetailsContentNode {
  return node instanceof DetailsContentNode;
}
