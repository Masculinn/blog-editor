import { addClassNamesToElement } from "@lexical/utils";
import type { EditorConfig, SerializedTextNode } from "lexical";
import { $applyNodeReplacement, TextNode } from "lexical";

export class SpecialTextNode extends TextNode {
  static getType(): string {
    return "specialText";
  }

  static clone(node: SpecialTextNode): SpecialTextNode {
    return new SpecialTextNode(node.__text, node.__key);
  }

  static importJSON(serializedNode: SerializedTextNode): SpecialTextNode {
    return $createSpecialTextNode().updateFromJSON(serializedNode);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);

    addClassNamesToElement(dom, config.theme.specialText);

    return dom;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const didUpdate = super.updateDOM(prevNode, dom, config);

    addClassNamesToElement(dom, config.theme.specialText);

    return didUpdate;
  }

  isTextEntity(): true {
    return true;
  }
}

export function $createSpecialTextNode(text = ""): SpecialTextNode {
  return $applyNodeReplacement(new SpecialTextNode(text));
}
