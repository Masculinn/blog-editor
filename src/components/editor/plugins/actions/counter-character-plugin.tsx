import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $rootTextContent } from "@lexical/text";
import { useEffect, useState } from "react";

let textEncoderInstance: null | TextEncoder = null;

function textEncoder(): null | TextEncoder {
  if (typeof TextEncoder === "undefined") {
    return null;
  }

  if (textEncoderInstance === null) {
    textEncoderInstance = new TextEncoder();
  }

  return textEncoderInstance;
}

function utf8Length(text: string) {
  const currentTextEncoder = textEncoder();

  if (currentTextEncoder === null) {
    const encoded = encodeURIComponent(text);
    const matches = encoded.match(/%[89ABab]/g);

    return text.length + (matches ? matches.length : 0);
  }

  return currentTextEncoder.encode(text).length;
}

interface CounterCharacterPluginProps {
  charset?: "UTF-8" | "UTF-16";
}

const strlen = (text: string, charset: "UTF-8" | "UTF-16") => {
  if (charset === "UTF-8") {
    return utf8Length(text);
  }

  return text.length;
};

const getFileSize = (text: string, charset: "UTF-8" | "UTF-16") => {
  if (charset === "UTF-8") {
    return utf8Length(text);
  }

  // UTF-16 uses 2 bytes per code unit.
  return text.length * 2;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 ** 2) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
};

const countWords = (text: string) => {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
};

export function CounterCharacterPlugin({
  charset = "UTF-16",
}: CounterCharacterPluginProps) {
  const [editor] = useLexicalComposerContext();

  const [stats, setStats] = useState(() => {
    const initialText = editor.getEditorState().read($rootTextContent);

    return {
      characters: strlen(initialText, charset),
      words: countWords(initialText),
      fileSize: getFileSize(initialText, charset),
    };
  });

  useEffect(() => {
    return editor.registerTextContentListener((currentText: string) => {
      setStats({
        characters: strlen(currentText, charset),
        words: countWords(currentText),
        fileSize: getFileSize(currentText, charset),
      });
    });
  }, [editor, charset]);

  return (
    <div className="flex gap-2 whitespace-nowrap pl-2 font-secondary text-[10px] tracking-tighter text-muted-foreground">
      <p>{stats.characters} characters</p>
      <span>|</span>
      <p>{stats.words} words</p>
      <span>|</span>
      <p>{formatFileSize(stats.fileSize)}</p>
    </div>
  );
}
