import { describe, expect, it } from "vitest";
import { LIMITS } from "../lib/limits";
import { validateImageBytes } from "../lib/validate-upload";

const PNG_1X1 = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  ),
);

const JPEG_1X1 = Uint8Array.from(
  Buffer.from(
    "/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAAA4QklNBCUAAAAAABDUHYzZjwCyBOmACZjs+EJ+/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/bAEMAAgICAgICAwICAwUDAwMFBgUFBQUGCAYGBgYGCAoICAgICAgKCgoKCgoKCgwMDAwMDA4ODg4ODw8PDw8PDw8PD//bAEMBAgICBAQEBwQEBxALCQsQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEP/dAAQAAf/aAAwDAQACEQMRAD8A+mKKKK/Kz/QA/9k=",
    "base64",
  ),
);

function pngWithSize(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  const view = new DataView(bytes.buffer);
  view.setUint32(8, 13);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

describe("validateImageBytes", () => {
  it("accepts a real PNG and reads its dimensions", () => {
    expect(validateImageBytes(PNG_1X1)).toEqual({
      ok: true,
      mimeType: "image/png",
      width: 1,
      height: 1,
    });
  });

  it("accepts a real JPEG and reads its dimensions", () => {
    expect(validateImageBytes(JPEG_1X1)).toEqual({
      ok: true,
      mimeType: "image/jpeg",
      width: 1,
      height: 1,
    });
  });

  it("rejects an empty file", () => {
    expect(validateImageBytes(new Uint8Array())).toEqual({ ok: false, code: "empty" });
  });

  it("rejects a file over the size limit before trusting its header", () => {
    const bytes = new Uint8Array(LIMITS.maxImageBytes + 1);
    bytes.set(PNG_1X1);
    expect(validateImageBytes(bytes)).toEqual({ ok: false, code: "too_large" });
  });

  it("rejects HTML, SVG and PDF even when the name is irrelevant", () => {
    expect(validateImageBytes(new TextEncoder().encode("<!DOCTYPE html><html></html>"))).toEqual({
      ok: false,
      code: "unsupported_type",
    });
    expect(validateImageBytes(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'></svg>"))).toEqual({
      ok: false,
      code: "unsupported_type",
    });
    expect(validateImageBytes(new TextEncoder().encode("%PDF-1.7"))).toEqual({
      ok: false,
      code: "unsupported_type",
    });
  });

  it("rejects a PNG header whose dimensions are outside the limit", () => {
    expect(validateImageBytes(pngWithSize(5000, 10))).toEqual({
      ok: false,
      code: "dimensions",
    });
    expect(validateImageBytes(pngWithSize(3000, 3000))).toEqual({
      ok: false,
      code: "dimensions",
    });
  });

  it("rejects a PNG signature that is missing a readable header", () => {
    const bytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    expect(validateImageBytes(bytes)).toEqual({ ok: false, code: "invalid_image" });
  });
});
