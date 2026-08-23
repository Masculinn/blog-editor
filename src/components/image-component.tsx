import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import type { LexicalCommand, NodeKey } from "lexical";
import {
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import type { JSX } from "react";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ImageStatus =
  | { error: true }
  | {
      error: false;
      width: number;
      height: number;
    };

const imageCache = new Map<string, Promise<ImageStatus> | ImageStatus>();

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> =
  createCommand("RIGHT_CLICK_IMAGE_COMMAND");

function useSuspenseImage(src: string): ImageStatus {
  let cached = imageCache.get(src);

  if (cached && "error" in cached && typeof cached.error === "boolean") {
    return cached;
  }

  if (!cached) {
    cached = new Promise<ImageStatus>((resolve) => {
      const img = new Image();

      img.src = src;

      img.onload = () => {
        resolve({
          error: false,
          height: img.naturalHeight,
          width: img.naturalWidth,
        });
      };

      img.onerror = () => {
        resolve({ error: true });
      };
    }).then((result) => {
      imageCache.set(src, result);
      return result;
    });

    imageCache.set(src, cached);

    throw cached;
  }

  throw cached;
}

function isSVG(src: string): boolean {
  const lowerCaseSrc = src.toLowerCase();

  return (
    lowerCaseSrc.endsWith(".svg") ||
    lowerCaseSrc.startsWith("data:image/svg+xml")
  );
}

function LazyImage({
  altText,
  className,
  imageRef,
  src,
  width,
  height,
  maxWidth,
  onError,
}: {
  altText: string;
  className: string | null;
  height: "inherit" | number;
  imageRef: { current: HTMLImageElement | null };
  maxWidth: number;
  src: string;
  width: "inherit" | number;
  onError: () => void;
}): JSX.Element {
  const status = useSuspenseImage(src);

  useEffect(() => {
    if (status.error) {
      onError();
    }
  }, [status.error, onError]);

  if (status.error) return <>Image failed to load</>;

  const calculateDimensions = () => {
    if (width !== "inherit" && height !== "inherit") {
      return {
        height,
        maxWidth,
        width,
      };
    }

    if (!isSVG(src)) {
      return {
        height,
        maxWidth,
        width,
      };
    }

    const naturalWidth = status.width;
    const naturalHeight = status.height;

    let finalWidth = naturalWidth || maxWidth;
    let finalHeight = naturalHeight || finalWidth;

    if (finalWidth > maxWidth) {
      const scale = maxWidth / finalWidth;

      finalWidth = maxWidth;
      finalHeight = Math.round(finalHeight * scale);
    }

    const maxHeight = 500;

    if (finalHeight > maxHeight) {
      const scale = maxHeight / finalHeight;

      finalHeight = maxHeight;
      finalWidth = Math.round(finalWidth * scale);
    }

    return {
      height: finalHeight,
      maxWidth,
      width: finalWidth,
    };
  };

  const imageStyle = calculateDimensions();

  return (
    // biome-ignore lint/performance/noImgElement: dynamic image creation
    <img
      className={className || undefined}
      src={src}
      alt={altText}
      ref={imageRef}
      style={imageStyle}
      onError={onError}
      draggable="false"
    />
  );
}

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
}: {
  altText: string;
  height: "inherit" | number;
  maxWidth: number;
  nodeKey: NodeKey;
  src: string;
  width: "inherit" | number;
}): JSX.Element {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);

  const [editor] = useLexicalComposerContext();

  const [isLoadError, setIsLoadError] = useState(false);

  const isEditable = useLexicalEditable();

  const isInNodeSelection = useMemo(
    () =>
      isSelected &&
      editor.getEditorState().read(() => {
        const selection = $getSelection();

        return $isNodeSelection(selection) && selection.has(nodeKey);
      }),
    [editor, isSelected, nodeKey],
  );

  const $onEnter = useCallback(
    (event: KeyboardEvent | null): boolean => {
      // KEY_ENTER_COMMAND can intentionally be dispatched with null.
      // This handler is only interested in an actual keyboard event.
      if (event === null) {
        return false;
      }

      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;

      if (
        $isNodeSelection(latestSelection) &&
        latestSelection.has(nodeKey) &&
        latestSelection.getNodes().length === 1 &&
        buttonElem !== null &&
        buttonElem !== document.activeElement
      ) {
        event.preventDefault();
        buttonElem.focus();

        return true;
      }

      return false;
    },
    [nodeKey],
  );

  const $onEscape = useCallback(
    (event: KeyboardEvent): boolean => {
      if (buttonRef.current !== event.target) {
        return false;
      }

      $setSelection(null);

      editor.update(() => {
        setSelected(true);

        const parentRootElement = editor.getRootElement();

        if (parentRootElement !== null) {
          parentRootElement.focus();
        }
      });

      return true;
    },
    [editor, setSelected],
  );

  const onClick = useCallback(
    (event: MouseEvent): boolean => {
      if (event.target !== imageRef.current) {
        return false;
      }

      if (event.shiftKey) {
        setSelected(!isSelected);
      } else {
        clearSelection();
        setSelected(true);
      }

      return true;
    },
    [clearSelection, isSelected, setSelected],
  );

  const onRightClick = useCallback(
    (event: MouseEvent): void => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection();
        const domElement = event.target as HTMLElement;

        if (
          domElement.tagName === "IMG" &&
          $isRangeSelection(latestSelection) &&
          latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event);
        }
      });
    },
    [editor],
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => false,
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target !== imageRef.current) {
            return false;
          }

          // Temporary workaround for Firefox behavior.
          event.preventDefault();

          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerCommand<MouseEvent>(
        RIGHT_CLICK_IMAGE_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),

      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        $onEscape,
        COMMAND_PRIORITY_LOW,
      ),

      editor.registerRootListener((rootElement) => {
        if (!rootElement) {
          return;
        }

        rootElement.addEventListener("contextmenu", onRightClick);

        return () => {
          rootElement.removeEventListener("contextmenu", onRightClick);
        };
      }),
    );
  }, [editor, $onEnter, $onEscape, onClick, onRightClick]);

  const draggable = isInNodeSelection;
  const isFocused = isSelected && isEditable;

  const handleImageError = useCallback(() => {
    setIsLoadError(true);
  }, []);

  return (
    <Suspense fallback={null}>
      <div draggable={draggable}>
        {!isLoadError && (
          <LazyImage
            className={
              isFocused
                ? `focused ${isInNodeSelection ? "draggable" : ""}`
                : null
            }
            src={src}
            altText={altText}
            imageRef={imageRef}
            width={width}
            height={height}
            maxWidth={maxWidth}
            onError={handleImageError}
          />
        )}
      </div>
    </Suspense>
  );
}
