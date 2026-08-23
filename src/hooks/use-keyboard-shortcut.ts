"use client";

import { useEffect, useRef } from "react";

type ModifierKey = "Alt" | "Control" | "Meta" | "Shift";

type ShortcutKey =
  | ModifierKey
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "Backspace"
  | "Delete"
  | "End"
  | "Enter"
  | "Escape"
  | "Home"
  | "PageDown"
  | "PageUp"
  | "Space"
  | "Tab"
  | (string & {});

export type KeyboardShortcut =
  | readonly [ShortcutKey]
  | readonly [ShortcutKey, ShortcutKey]
  | readonly [ShortcutKey, ShortcutKey, ShortcutKey];

type UseKeyboardShortcutOptions = {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  stopImmediatePropagation?: boolean;
  allowInEditable?: boolean;
};

const MODIFIER_KEYS = new Set<ModifierKey>(["Alt", "Control", "Meta", "Shift"]);

const KEY_ALIASES: Record<string, string> = {
  alt: "Alt",
  cmd: "Meta",
  command: "Meta",
  control: "Control",
  ctrl: "Control",
  esc: "Escape",
  meta: "Meta",
  option: "Alt",
  shift: "Shift",
  space: " ",
};

function normalizeKey(key: string): string {
  const normalized = key.toLowerCase();

  return KEY_ALIASES[normalized] ?? normalized;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

function isModifierPressed(
  event: KeyboardEvent,
  modifier: ModifierKey,
): boolean {
  switch (modifier) {
    case "Alt":
      return event.altKey;

    case "Control":
      return event.ctrlKey;

    case "Meta":
      return event.metaKey;

    case "Shift":
      return event.shiftKey;
  }
}

export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  callback: (event: KeyboardEvent) => void,
  {
    enabled = true,
    preventDefault = true,
    stopPropagation = true,
    stopImmediatePropagation = true,
    allowInEditable = false,
  }: UseKeyboardShortcutOptions = {},
) {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const normalizedShortcut = shortcut.map(normalizeKey);
    const modifiers = shortcut.filter((key): key is ModifierKey =>
      MODIFIER_KEYS.has(key as ModifierKey),
    );

    const actionKeys = normalizedShortcut.filter(
      (key) => !MODIFIER_KEYS.has(key as ModifierKey),
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!allowInEditable && isEditableTarget(event.target)) {
        return;
      }

      const pressedKey = normalizeKey(event.key);
      const modifiersMatch = modifiers.every((modifier) =>
        isModifierPressed(event, modifier),
      );

      if (!modifiersMatch) return;

      const hasUnexpectedModifier =
        (event.ctrlKey && !modifiers.includes("Control")) ||
        (event.metaKey && !modifiers.includes("Meta")) ||
        (event.altKey && !modifiers.includes("Alt")) ||
        (event.shiftKey && !modifiers.includes("Shift"));

      if (hasUnexpectedModifier) return;

      const actionMatches =
        actionKeys.length === 0
          ? normalizedShortcut.includes(pressedKey)
          : actionKeys.includes(pressedKey);

      if (!actionMatches) return;

      if (preventDefault) {
        event.preventDefault();
      }

      if (stopPropagation) {
        event.stopPropagation();
      }

      if (stopImmediatePropagation) {
        event.stopImmediatePropagation();
      }

      callbackRef.current(event);
    };

    window.addEventListener("keydown", handleKeyDown, {
      capture: true,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, {
        capture: true,
      });
    };
  }, [
    shortcut,
    enabled,
    preventDefault,
    stopPropagation,
    stopImmediatePropagation,
    allowInEditable,
  ]);
}
