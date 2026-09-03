"use server";

import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

import { db } from "@/lib/db/server";

const WEBP_QUALITY = 80;
const MAX_FILE_SIZE = 12 * 1024 * 1024;
const PAGE_SIZE = 100;
const CACHE_CONTROL = "31536000";

const SUPPORTED_INPUT_FORMATS = new Set(["jpeg", "png", "webp", "gif"]);

function getBucketName() {
  const bucket = process.env.BUCKET_NAME;

  if (!bucket) {
    throw new Error("Missing BUCKET_NAME.");
  }

  return bucket;
}

function sanitizeFileName(fileName: string) {
  const extensionIndex = fileName.lastIndexOf(".");

  const withoutExtension =
    extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);

  const sanitized = withoutExtension
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return sanitized || "image";
}

function createStoragePath(fileName: string, extension: string) {
  const baseName = sanitizeFileName(fileName);
  const identifier = randomUUID().slice(0, 8);

  return `${baseName}-${identifier}.${extension}`;
}

function isSafeStoragePath(path: string) {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("..") &&
    !path.includes("\\")
  );
}

function getPublicUrl(path: string) {
  const bucket = getBucketName();

  return db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function isImageObject(file: {
  name: string;
  metadata?: Record<string, unknown> | null;
}) {
  const mimeType =
    typeof file.metadata?.mimetype === "string"
      ? file.metadata.mimetype
      : undefined;

  if (mimeType?.startsWith("image/")) return true;

  return /\.(?:webp|png|jpe?g|gif)$/i.test(file.name);
}

async function uploadStorageObject({
  path,
  buffer,
  contentType,
}: {
  path: string;
  buffer: Buffer;
  contentType: string;
}) {
  const bucket = getBucketName();

  const { error } = await db.storage.from(bucket).upload(path, buffer, {
    contentType,
    cacheControl: CACHE_CONTROL,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getMediaAction() {
  try {
    const bucket = getBucketName();

    let offset = 0;

    const objects: Array<{
      id: string | null;
      name: string;
      created_at: string | null;
      updated_at: string | null;
      metadata: Record<string, unknown> | null;
    }> = [];

    while (true) {
      const { data, error } = await db.storage.from(bucket).list("", {
        limit: PAGE_SIZE,
        offset,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message,
        } as const;
      }

      objects.push(...data);

      if (data.length < PAGE_SIZE) break;

      offset += PAGE_SIZE;
    }

    const media = objects
      .filter(
        (
          file,
        ): file is typeof file & {
          id: string;
        } => file.id !== null && isImageObject(file),
      )
      .map((file) => ({
        id: file.id,
        name: file.name,
        path: file.name,
        publicUrl: getPublicUrl(file.name),
        createdAt: file.created_at,
        updatedAt: file.updated_at,
        size:
          typeof file.metadata?.size === "number" ? file.metadata.size : null,
        mimeType:
          typeof file.metadata?.mimetype === "string"
            ? file.metadata.mimetype
            : null,
      }));

    return {
      success: true,
      data: media,
    } as const;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve media files.",
    } as const;
  }
}

export async function uploadMediaAction(formData: FormData) {
  try {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return {
        success: false,
        error: "No image was provided.",
      } as const;
    }

    if (file.size === 0) {
      return {
        success: false,
        error: `${file.name} is empty.`,
      } as const;
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `${file.name} exceeds the 12 MB upload limit.`,
      } as const;
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const metadata = await sharp(inputBuffer, {
      animated: true,
    }).metadata();

    const format = metadata.format?.toLowerCase();

    if (!format || !SUPPORTED_INPUT_FORMATS.has(format)) {
      return {
        success: false,
        error: `${file.name} must be a JPEG, PNG, WebP, or GIF image.`,
      } as const;
    }

    const outputBuffer = await sharp(inputBuffer, {
      animated: true,
    })
      .rotate()
      .webp({
        quality: WEBP_QUALITY,
        effort: 4,
        smartSubsample: true,

        ...(metadata.loop !== undefined
          ? {
              loop: metadata.loop,
            }
          : {}),

        ...(metadata.delay !== undefined
          ? {
              delay: metadata.delay,
            }
          : {}),
      })
      .toBuffer();

    const path = createStoragePath(file.name, "webp");

    await uploadStorageObject({
      path,
      buffer: outputBuffer,
      contentType: "image/webp",
    });

    const timestamp = new Date().toISOString();

    return {
      success: true,
      data: {
        id: path,
        name: path,
        path,
        publicUrl: getPublicUrl(path),
        createdAt: timestamp,
        updatedAt: timestamp,
        size: outputBuffer.byteLength,
        mimeType: "image/webp",
      },
    } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image.",
    } as const;
  }
}

export async function deleteMediaAction(path: string) {
  try {
    if (!isSafeStoragePath(path)) {
      return {
        success: false,
        error: "Invalid media path.",
      } as const;
    }

    const bucket = getBucketName();

    const { error } = await db.storage.from(bucket).remove([path]);

    if (error) {
      return {
        success: false,
        error: error.message,
      } as const;
    }

    return {
      success: true,
      path,
    } as const;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete image.",
    } as const;
  }
}

export async function getMediaPublicUrlAction(path: string) {
  try {
    if (!isSafeStoragePath(path)) {
      return {
        success: false,
        error: "Invalid media path.",
      } as const;
    }

    return {
      success: true,
      data: getPublicUrl(path),
    } as const;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve public URL.",
    } as const;
  }
}
