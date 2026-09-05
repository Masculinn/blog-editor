import type { SerializedDocument } from "@lexical/file";

async function readBytes(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): Promise<Uint8Array<ArrayBuffer>> {
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value !== undefined) {
      chunks.push(value);
      totalLength += value.length;
    }
  }

  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

export async function docToHash(doc: SerializedDocument): Promise<string> {
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();

  const [, compressed] = await Promise.all([
    writer
      .write(new TextEncoder().encode(JSON.stringify(doc)))
      .then(() => writer.close()),
    readBytes(cs.readable.getReader()),
  ]);

  const b64url = compressed.toBase64({
    alphabet: "base64url",
    omitPadding: true,
  });

  return `#doc=${b64url}`;
}

export async function docFromHash(
  hash: string,
): Promise<SerializedDocument | null> {
  const m = /^#doc=(.*)$/.exec(hash);
  if (!m) return null;

  let compressed: Uint8Array<ArrayBuffer>;
  try {
    compressed = Uint8Array.fromBase64(m[1], { alphabet: "base64url" });
  } catch {
    return null;
  }

  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();

  const [, decompressed] = await Promise.all([
    writer.write(compressed).then(() => writer.close()),
    readBytes(ds.readable.getReader()),
  ]);

  try {
    return JSON.parse(
      new TextDecoder().decode(decompressed),
    ) as SerializedDocument;
  } catch {
    return null;
  }
}
