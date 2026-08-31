import {
  $getDocument,
  type DOMExportOutput,
  type EditorConfig,
  ElementNode,
  type LexicalNode,
  type NodeKey,
  type SerializedElementNode,
  type Spread,
} from "lexical";

export type SerializedDetailsContainerNode = Spread<
  {
    open: boolean;
  },
  SerializedElementNode
>;

export class DetailsContainerNode extends ElementNode {
  __open: boolean;

  constructor(open = false, key?: NodeKey) {
    super(key);
    this.__open = open;
  }

  static getType(): string {
    return "details-container";
  }

  static clone(node: DetailsContainerNode): DetailsContainerNode {
    return new DetailsContainerNode(node.__open, node.__key);
  }

  createDOM(_config: EditorConfig): HTMLDetailsElement {
    const element = $getDocument().createElement("details");

    element.className = "my-3 rounded-md border border-border px-3 py-2";

    element.open = this.__open;

    return element;
  }

  updateDOM(prevNode: DetailsContainerNode, dom: HTMLDetailsElement): boolean {
    if (prevNode.__open !== this.__open) {
      dom.open = this.__open;
    }

    return false;
  }

  static importJSON(
    serializedNode: SerializedDetailsContainerNode,
  ): DetailsContainerNode {
    return $createDetailsContainerNode(serializedNode.open).updateFromJSON(
      serializedNode,
    );
  }

  exportJSON(): SerializedDetailsContainerNode {
    return {
      ...super.exportJSON(),
      open: this.__open,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = $getDocument().createElement("details");

    if (this.__open) {
      element.setAttribute("open", "");
    }

    return { element };
  }

  setOpen(open: boolean): this {
    const writable = this.getWritable();
    writable.__open = open;

    return writable;
  }

  getOpen(): boolean {
    return this.getLatest().__open;
  }

  toggleOpen(): this {
    return this.setOpen(!this.getOpen());
  }

  isShadowRoot(): boolean {
    return true;
  }
}

export function $createDetailsContainerNode(
  open = false,
): DetailsContainerNode {
  return new DetailsContainerNode(open);
}

export function $isDetailsContainerNode(
  node: LexicalNode | null | undefined,
): node is DetailsContainerNode {
  return node instanceof DetailsContainerNode;
}
