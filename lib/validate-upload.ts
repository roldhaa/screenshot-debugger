import { LIMITS } from "@/lib/limits";

export type ImageMimeType = "image/png" | "image/jpeg";

export type UploadErrorCode =
  | "empty"
  | "too_large"
  | "unsupported_type"
  | "dimensions"
  | "invalid_image";

export type UploadValidation =
  | {
      ok: true;
      mimeType: ImageMimeType;
      width: number;
      height: number;
    }
  | {
      ok: false;
      code: UploadErrorCode;
    };

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export const uploadErrorMessage: Record<UploadErrorCode, string> = {
  empty: "Le fichier est vide.",
  too_large: "L'image dépasse 2 Mio.",
  unsupported_type: "Seuls les fichiers PNG et JPEG sont acceptés.",
  dimensions: "Les dimensions de l'image dépassent la limite autorisée.",
  invalid_image: "Le fichier ne correspond pas à une image PNG ou JPEG lisible.",
};

export function validateImageBytes(bytes: Uint8Array): UploadValidation {
  if (bytes.byteLength === 0) {
    return { ok: false, code: "empty" };
  }

  if (bytes.byteLength > LIMITS.maxImageBytes) {
    return { ok: false, code: "too_large" };
  }

  const mimeType = detectMimeType(bytes);
  if (!mimeType) {
    return { ok: false, code: "unsupported_type" };
  }

  const size = mimeType === "image/png" ? readPngSize(bytes) : readJpegSize(bytes);
  if (!size) {
    return { ok: false, code: "invalid_image" };
  }

  if (
    size.width < 1 ||
    size.height < 1 ||
    size.width > LIMITS.maxDimension ||
    size.height > LIMITS.maxDimension ||
    size.width * size.height > LIMITS.maxPixels
  ) {
    return { ok: false, code: "dimensions" };
  }

  return { ok: true, mimeType, width: size.width, height: size.height };
}

function detectMimeType(bytes: Uint8Array): ImageMimeType | null {
  if (startsWith(bytes, PNG_SIGNATURE)) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  return null;
}

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) {
    return false;
  }
  return signature.every((value, index) => bytes[index] === value);
}

function readPngSize(bytes: Uint8Array): { width: number; height: number } | null {
  // 8 byte signature, 4 byte length, 4 byte IHDR, then width and height.
  if (bytes.length < 24) {
    return null;
  }
  const ihdr = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);
  if (ihdr !== "IHDR") {
    return null;
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    width: view.getUint32(16),
    height: view.getUint32(20),
  };
}

function readJpegSize(bytes: Uint8Array): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      return null;
    }
    while (offset < bytes.length && bytes[offset] === 0xff) {
      offset += 1;
    }
    if (offset >= bytes.length) {
      return null;
    }
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue;
    }
    if (offset + 1 >= bytes.length) {
      return null;
    }
    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      return null;
    }
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isStartOfFrame) {
      if (segmentLength < 7) {
        return null;
      }
      const height = (bytes[offset + 3] << 8) | bytes[offset + 4];
      const width = (bytes[offset + 5] << 8) | bytes[offset + 6];
      return { width, height };
    }
    offset += segmentLength;
  }
  return null;
}
