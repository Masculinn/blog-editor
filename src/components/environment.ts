import { canUseDOM } from "@/utils/editor/canUseDom";

const isDom = canUseDOM();

declare global {
  interface Document {
    documentMode?: unknown;
  }

  interface Window {
    MSStream?: unknown;
  }
}

const documentMode =
  isDom && "documentMode" in document ? document.documentMode : null;

export const IS_APPLE: boolean =
  isDom && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const IS_FIREFOX: boolean =
  isDom && /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);

export const CAN_USE_BEFORE_INPUT: boolean =
  isDom && "InputEvent" in window && !documentMode
    ? "getTargetRanges" in new window.InputEvent("input")
    : false;

export const IS_SAFARI: boolean =
  isDom && /Version\/[\d.]+.*Safari/.test(navigator.userAgent);

export const IS_IOS: boolean =
  isDom && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export const IS_ANDROID: boolean = isDom && /Android/.test(navigator.userAgent);

// Keep these in case we need to use them in the future.
// export const IS_WINDOWS: boolean = CAN_USE_DOM && /Win/.test(navigator.platform);
export const IS_CHROME: boolean =
  isDom && /^(?=.*Chrome).*/i.test(navigator.userAgent);
// export const canUseTextInputEvent: boolean = CAN_USE_DOM && 'TextEvent' in window && !documentMode;

export const IS_ANDROID_CHROME: boolean = isDom && IS_ANDROID && IS_CHROME;

export const IS_APPLE_WEBKIT =
  isDom && /AppleWebKit\/[\d.]+/.test(navigator.userAgent) && !IS_CHROME;
