import type { SerializedDocument } from "@lexical/file";

export const MIN_CONTENT_LENGTH = 30;
export const MAX_CONTENT_LENGTH = 200;
export const MAX_TITLE_LENGTH = 37;
export const MAX_DOCUMENT_LENGTH = 65_536;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNodeText(node: unknown, depth = 0): string {
  if (depth > 100 || !isRecord(node) || typeof node.type !== "string") {
    throw new Error("Invalid document payload.");
  }

  if (node.type === "linebreak") {
    return "\n";
  }

  if (Array.isArray(node.children)) {
    return node.children
      .map((child) => getNodeText(child, depth + 1))
      .join(node.type === "root" ? "\n\n" : "");
  }

  if (typeof node.text === "string") {
    return node.text;
  }

  return "";
}

export function getDocumentCharacterCount(document: unknown): number {
  if (
    !isRecord(document) ||
    !isRecord(document.editorState) ||
    !isRecord(document.editorState.root) ||
    document.editorState.root.type !== "root" ||
    !Array.isArray(document.editorState.root.children)
  ) {
    throw new Error("Invalid document payload.");
  }

  return Array.from(getNodeText(document.editorState.root).trim()).length;
}

export function getContentLengthError(characterCount: number): string | null {
  if (characterCount < MIN_CONTENT_LENGTH) {
    return `Content must contain at least ${MIN_CONTENT_LENGTH} characters. Currently: ${characterCount}.`;
  }

  if (characterCount > MAX_CONTENT_LENGTH) {
    return `Content cannot exceed ${MAX_CONTENT_LENGTH} characters. Currently: ${characterCount}.`;
  }

  return null;
}

export function validateDocument(document: SerializedDocument): string | null {
  try {
    const serialized = JSON.stringify(document);

    if (!serialized || serialized.length > MAX_DOCUMENT_LENGTH) {
      return "Invalid document payload.";
    }

    return getContentLengthError(getDocumentCharacterCount(document));
  } catch {
    return "Invalid document payload.";
  }
}
