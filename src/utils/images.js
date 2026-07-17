// Client-side resize/compress before upload — keeps mobile camera photos
// (often several MB, 3000px+) fast to upload on spotty wifi and cheap to
// store, without needing a server-side function.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

// iPhones save camera photos as HEIC/HEIF by default. Safari can decode that
// into a canvas, but Chrome/Android/Edge have no HEIC decoder at all — the
// Image element just fires onerror. There's no client-side polyfill for
// this (would need a large WASM decoder), so we detect it up front and give
// an actionable message instead of a bare "couldn't load image".
const isHeic = (file) =>
  /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

export const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

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
      reject(
        new Error(
          isHeic(file)
            ? 'HEIC photos aren\'t supported by this browser. On iPhone, go to Settings > Camera > Formats and choose "Most Compatible", or pick a different photo.'
            : "Couldn't load this photo — try a different one."
        )
      );
    };
    img.src = objectUrl;
  });
