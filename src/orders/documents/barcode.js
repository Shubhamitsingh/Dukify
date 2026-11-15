/**
 * Visual Code39-style barcode SVG for MOCK PREVIEW only.
 * Not a courier-certified symbology — replace with courier-supplied barcode/PDF when integrated.
 */
const CODE39 = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  A: "wnnnnwnnw",
  B: "nnwnnwnnw",
  C: "wnwnnwnnn",
  D: "nnnnwwnnw",
  E: "wnnnwwnnn",
  F: "nnwnwwnnn",
  G: "nnnnnwwnw",
  H: "wnnnnwwnn",
  I: "nnwnnwwnn",
  J: "nnnnwwwnn",
  K: "wnnnnnnww",
  L: "nnwnnnnww",
  M: "wnwnnnnwn",
  N: "nnnnwnnww",
  O: "wnnnwnnwn",
  P: "nnwnwnnwn",
  Q: "nnnnnnwww",
  R: "wnnnnnwwn",
  S: "nnwnnnwwn",
  T: "nnnnwnwwn",
  U: "wwnnnnnnw",
  V: "nwwnnnnnw",
  W: "wwwnnnnnn",
  X: "nwnnwnnnw",
  Y: "wwnnwnnnn",
  Z: "nwwnwnnnn",
  "-": "nwnnnnwnw",
  ".": "wwnnnnwnn",
  " ": "nwwnnnwnn",
  "*": "nwnnwnwnn",
};

export function barcodeSvg(raw, { height = 48, narrow = 1.2 } = {}) {
  const text = String(raw || "MOCK")
    .toUpperCase()
    .replace(/[^0-9A-Z\-. ]/g, "")
    .slice(0, 22);
  const payload = `*${text || "MOCK"}*`;
  let x = 0;
  const bars = [];
  [...payload].forEach((char) => {
    const pattern = CODE39[char] || CODE39["-"];
    [...pattern].forEach((bit, index) => {
      const width = (bit === "w" ? 3 : 1) * narrow;
      if (index % 2 === 0) {
        bars.push(`<rect x="${x}" y="0" width="${width}" height="${height}" fill="#000"/>`);
      }
      x += width;
    });
    x += narrow;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(x)}" height="${height}" viewBox="0 0 ${Math.ceil(x)} ${height}" role="img" aria-label="Mock barcode ${text}">${bars.join("")}</svg>`;
}
