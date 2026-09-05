import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import type { JSX } from "react";

import { ContentsBlock } from "./contents-block";
import { serializeContentsMarkdown } from "./contents-markdown";
import {
  cloneContentsData,
  contentsDataSchema,
  type ContentsData,
} from "./contents-types";

export type SerializedContentsNode = Spread<
  {
    type: "contents";
    version: 1;
    data: ContentsData;
  },
  SerializedLexicalNode
>;

export class ContentsNode extends DecoratorNode<JSX.Element> {
  __data: ContentsData;

  static getType(): string {
    return "contents";
  }

  static clone(node: ContentsNode): ContentsNode {
    return new ContentsNode(node.__data, node.__key);
  }

  constructor(data: ContentsData = { sections: [] }, key?: NodeKey) {
    super(key);

    this.__data = cloneContentsData(data);
  }

  static importJSON(serializedNode: SerializedContentsNode): ContentsNode {
    const data = contentsDataSchema.parse(serializedNode.data);

    return $createContentsNode(data).updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedContentsNode {
    return {
      ...super.exportJSON(),
      type: "contents",
      version: 1,
      data: this.getData(),
    };
  }

  createDOM(): HTMLElement {
    const element = document.createElement("div");

    element.className = "my-5";
    element.dataset.lexicalContents = "true";

    return element;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): false {
    return false;
  }

  isKeyboardSelectable(): true {
    return true;
  }

  getData(): ContentsData {
    return cloneContentsData(this.getLatest().__data);
  }

  setData(data: ContentsData): this {
    const writable = this.getWritable();

    writable.__data = contentsDataSchema.parse(data);

    return writable;
  }

  getTextContent(): string {
    return serializeContentsMarkdown(this.getLatest().__data);
  }

  decorate(): JSX.Element {
    return <ContentsBlock nodeKey={this.getKey()} data={this.getData()} />;
  }
}

export function $createContentsNode(data: ContentsData): ContentsNode {
  return $applyNodeReplacement(
    new ContentsNode(contentsDataSchema.parse(data)),
  );
}

export function $isContentsNode(
  node: LexicalNode | null | undefined,
): node is ContentsNode {
  return node instanceof ContentsNode;
}
