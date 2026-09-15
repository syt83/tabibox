export interface ExtractedPhotoMetadata {
  takenAt: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Reads EXIF DateTimeOriginal/GPS off a photo file. Falls back to the
 * file's last-modified timestamp when EXIF is missing or unreadable (no
 * EXIF on web-exported images, stripped metadata, unsupported format, ...).
 */
export async function extractPhotoMetadata(file: File): Promise<ExtractedPhotoMetadata> {
  const fallback: ExtractedPhotoMetadata = { takenAt: new Date(file.lastModified).toISOString() };

  try {
    const exifr = (await import("exifr")).default;
    const exif = await exifr.parse(file, { gps: true, pick: ["DateTimeOriginal", "CreateDate"] });

    const takenAtRaw = exif?.DateTimeOriginal ?? exif?.CreateDate;
    const takenAt = takenAtRaw ? new Date(takenAtRaw) : null;

    return {
      takenAt: takenAt && !Number.isNaN(takenAt.getTime()) ? takenAt.toISOString() : fallback.takenAt,
      latitude: typeof exif?.latitude === "number" ? exif.latitude : undefined,
      longitude: typeof exif?.longitude === "number" ? exif.longitude : undefined,
    };
  } catch {
    return fallback;
  }
}
