import type {
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  SerializedTextNode,
  Spread,
} from "lexical";
import { TextNode } from "lexical";

export type SerializedAutoCompleteNode = Spread<
  {
    type: "autocomplete";
    version: 1;
  },
  SerializedTextNode
>;

export class AutoCompleteNode extends TextNode {
  static getType(): string {
    return "autocomplete";
  }

  static clone(node: AutoCompleteNode): AutoCompleteNode {
    return new AutoCompleteNode(node.__text, node.__key);
  }

  static importJSON(
    serializedNode: SerializedAutoCompleteNode,
  ): AutoCompleteNode {
    return $createAutoCompleteNode(serializedNode.text).updateFromJSON(
      serializedNode,
    );
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);

    element.setAttribute("aria-hidden", "true");
    element.setAttribute("data-autocomplete", "true");

    element.classList.add(
      "pointer-events-none",
      "select-none",
      "text-muted-foreground/50",
    );

    return element;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    return super.updateDOM(prevNode, dom, config);
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    return {
      element: null,
    };
  }

  static importDOM(): null {
    return null;
  }

  exportJSON(): SerializedAutoCompleteNode {
    return {
      ...super.exportJSON(),
      type: "autocomplete",
      version: 1,
    };
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createAutoCompleteNode(text: string): AutoCompleteNode {
  return new AutoCompleteNode(text).setMode("token") as AutoCompleteNode;
}

export function $isAutoCompleteNode(
  node: LexicalNode | null | undefined,
): node is AutoCompleteNode {
  return node instanceof AutoCompleteNode;
}
