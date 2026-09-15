export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB per image

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const HEIC_MIME_TYPES = ["image/heic", "image/heif"] as const;
const HEIC_EXTENSIONS = [".heic", ".heif"];

export const ACCEPTED_FILE_INPUT_ACCEPT = ACCEPTED_MIME_TYPES.join(",");

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type FileRejectionReason = "heic-unsupported" | "unsupported-type" | "too-large";

export interface FileValidationResult {
  valid: boolean;
  reason?: FileRejectionReason;
  message?: string;
}

export function validateFile(file: File): FileValidationResult {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const looksLikeHeic = HEIC_EXTENSIONS.some((ext) => name.endsWith(ext));

  if ((HEIC_MIME_TYPES as readonly string[]).includes(type) || (!type && looksLikeHeic)) {
    return { valid: false, reason: "heic-unsupported", message: "HEIC support coming soon." };
  }

  if (!(ACCEPTED_MIME_TYPES as readonly string[]).includes(type)) {
    return { valid: false, reason: "unsupported-type", message: "Unsupported file type." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, reason: "too-large", message: "File is larger than 20MB." };
  }

  return { valid: true };
}

/** Prefers the MIME type; falls back to the filename extension, then jpg. */
export function extensionForFile(file: File): string {
  const byMime = MIME_TO_EXTENSION[file.type.toLowerCase()];
  if (byMime) return byMime;

  const match = /\.([a-zA-Z0-9]+)$/.exec(file.name);
  return match ? match[1].toLowerCase() : "jpg";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
