// Client-side resize/compress before upload — keeps mobile camera photos
// (often several MB, 3000px+) fast to upload on spotty wifi and cheap to
// store, without needing a server-side function.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

// iPhones save camera photos as HEIC/HEIF by default. Safari can decode that
// natively, but Chrome/Android/Edge have no HEIC decoder at all — the Image
// element just fires onerror there. heic2any wraps a WASM build of libheif
// so decoding works the same on every browser; it's loaded on demand (not in
// the main bundle) since most uploads are already JPEG/PNG and won't need it.
const isHeic = (file) =>
  /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

const decodeHeic = async (file) => {
  const heic2any = (await import("heic2any")).default;
  try {
    const result = await heic2any({ blob: file, toType: "image/jpeg", quality: JPEG_QUALITY });
    return Array.isArray(result) ? result[0] : result;
  } catch {
    throw new Error("Couldn't process this HEIC photo — try a different one.");
  }
};

export const compressImage = async (file) => {
  const sourceBlob = isHeic(file) ? await decodeHeic(file) : file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(sourceBlob);

    img.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (blob) resolve(blob);
          else reject(new Error("Couldn't process this photo — try a different one."));
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Couldn't load this photo — try a different one."));
    };
    img.src = objectUrl;
  });
};
