import type { SerializedMDXSource } from "./serializeMDX";

type SerializedMDXError = Extract<SerializedMDXSource, { error: Error }>;

export function isSerializedMDXWithError(
  source: SerializedMDXSource,
): source is SerializedMDXError {
  return "error" in source;
}
