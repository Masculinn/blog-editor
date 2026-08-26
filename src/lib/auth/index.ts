const encoder = new TextEncoder();
const decoder = new TextDecoder();

const HKDF_SALT = encoder.encode("editor-app:identity:v1");
export const IDENTITY_COOKIE_NAME = "editor_identity";

type HeaderReader = {
  get(name: string): string | null;
};

export type RequestIdentity = {
  ip: string;
  userAgent: string;
};

export type IdentityPayload = RequestIdentity & {
  version: 1;
  userId: string;
};

function getSecret(): string {
  const secret = process.env.APP_ENCRYPT_TOKEN;

  if (!secret || secret.length < 32) {
    throw new Error("APP_ENCRYPT_TOKEN must contain at least 32 characters.");
  }

  return secret;
}

export function normalizeUserAgent(value: string): string {
  return value.split(" ").join("");
}

function getClientIp(headers: HeaderReader): string {
  const netlifyIp = headers.get("x-nf-client-connection-ip");

  if (netlifyIp) {
    return netlifyIp.trim();
  }

  if (process.env.NODE_ENV !== "production") {
    const forwardedFor = headers.get("x-forwarded-for");

    if (forwardedFor) {
      return forwardedFor.split(",")[0]?.trim() ?? "";
    }

    return headers.get("x-real-ip")?.trim() ?? "";
  }

  return "";
}

export function getRequestIdentity(headers: HeaderReader): RequestIdentity {
  return {
    ip: getClientIp(headers),
    userAgent: normalizeUserAgent(headers.get("user-agent") ?? ""),
  };
}

export function isAdminIdentity(identity: RequestIdentity): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const expectedIp = process.env.MY_IP?.trim() ?? "";

  const expectedUserAgent = normalizeUserAgent(process.env.MY_USER_AGENT ?? "");

  return (
    expectedIp.length > 0 &&
    expectedUserAgent.length > 0 &&
    identity.ip === expectedIp &&
    identity.userAgent === expectedUserAgent
  );
}

async function getRootKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    "HKDF",
    false,
    ["deriveKey"],
  );
}

async function deriveEncryptionKey(rootKey: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: HKDF_SALT,
      info: encoder.encode("encryption"),
    },
    rootKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

async function deriveSigningKey(rootKey: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: HKDF_SALT,
      info: encoder.encode("signing"),
    },
    rootKey,
    {
      name: "HMAC",
      hash: "SHA-256",
      length: 256,
    },
    false,
    ["sign", "verify"],
  );
}

async function deriveUserIdKey(rootKey: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: HKDF_SALT,
      info: encoder.encode("user-id"),
    },
    rootKey,
    {
      name: "HMAC",
      hash: "SHA-256",
      length: 256,
    },
    false,
    ["sign"],
  );
}

function toBase64Url(bytes: Uint8Array<ArrayBuffer>): string {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array<ArrayBuffer> {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);

  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function createUserId(
  identity: RequestIdentity,
  userIdKey: CryptoKey,
): Promise<string> {
  const canonicalIdentity = `${identity.ip}\n${identity.userAgent}`;

  const signature = await crypto.subtle.sign(
    "HMAC",
    userIdKey,
    encoder.encode(canonicalIdentity),
  );

  return toBase64Url(new Uint8Array(signature));
}

export async function createIdentityToken(
  identity: RequestIdentity,
): Promise<string> {
  const rootKey = await getRootKey();

  const [encryptionKey, signingKey, userIdKey] = await Promise.all([
    deriveEncryptionKey(rootKey),
    deriveSigningKey(rootKey),
    deriveUserIdKey(rootKey),
  ]);

  const payload: IdentityPayload = {
    version: 1,
    ip: identity.ip,
    userAgent: identity.userAgent,

    userId: await createUserId(identity, userIdKey),
  };

  const iv = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(12)));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    encryptionKey,
    encoder.encode(JSON.stringify(payload)),
  );

  const body = [
    "v1",
    toBase64Url(iv),
    toBase64Url(new Uint8Array(ciphertext)),
  ].join(".");

  const signature = await crypto.subtle.sign(
    "HMAC",
    signingKey,
    encoder.encode(body),
  );

  return [body, toBase64Url(new Uint8Array(signature))].join(".");
}

export async function verifyIdentityToken(
  token: string,
  currentIdentity: RequestIdentity,
): Promise<IdentityPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 4) return null;

    const [version, ivEncoded, ciphertextEncoded, signatureEncoded] = parts;

    if (
      version !== "v1" ||
      !ivEncoded ||
      !ciphertextEncoded ||
      !signatureEncoded
    ) {
      return null;
    }

    const rootKey = await getRootKey();

    const [encryptionKey, signingKey, userIdKey] = await Promise.all([
      deriveEncryptionKey(rootKey),
      deriveSigningKey(rootKey),
      deriveUserIdKey(rootKey),
    ]);

    const body = `${version}.${ivEncoded}.${ciphertextEncoded}`;

    const signature = fromBase64Url(signatureEncoded);

    const validSignature = await crypto.subtle.verify(
      "HMAC",
      signingKey,
      signature.buffer,
      encoder.encode(body),
    );

    if (!validSignature) return null;

    const iv = fromBase64Url(ivEncoded);
    if (iv.length !== 12) return null;

    const ciphertext = fromBase64Url(ciphertextEncoded);

    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv.buffer,
      },
      encryptionKey,
      ciphertext.buffer,
    );

    const parsed: unknown = JSON.parse(decoder.decode(plaintext));

    if (!isIdentityPayload(parsed)) return null;

    const expectedUserId = await createUserId(currentIdentity, userIdKey);

    if (
      parsed.ip !== currentIdentity.ip ||
      parsed.userAgent !== currentIdentity.userAgent ||
      parsed.userId !== expectedUserId
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isIdentityPayload(value: unknown): value is IdentityPayload {
  if (typeof value !== "object" || value === null) return false;

  const payload = value as Record<string, unknown>;

  return (
    payload.version === 1 &&
    typeof payload.ip === "string" &&
    typeof payload.userAgent === "string" &&
    typeof payload.userId === "string"
  );
}
