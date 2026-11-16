import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const dir = path.resolve("public/landing");

const jobs = [
  // Hero poster — small, eager LCP candidate
  {
    in: "lp-3d-tee.jpg",
    outs: [
      { file: "hero-poster.webp", width: 1200, quality: 72 },
      { file: "hero-poster-640.webp", width: 640, quality: 70 },
      { file: "hero-poster.jpg", width: 1200, quality: 78, jpeg: true },
    ],
  },
  {
    in: "lp-creator.jpg",
    outs: [
      { file: "lp-creator.webp", width: 900, quality: 75 },
      { file: "lp-creator-640.webp", width: 640, quality: 72 },
    ],
  },
  {
    in: "lp-d2c-rack.jpg",
    outs: [{ file: "lp-d2c-rack.webp", width: 1000, quality: 74 }],
  },
  {
    in: "lp-d2c-flatlay.jpg",
    outs: [{ file: "lp-d2c-flatlay.webp", width: 800, quality: 74 }],
  },
  {
    in: "lp-d2c-store.jpg",
    outs: [{ file: "lp-d2c-store.webp", width: 800, quality: 74 }],
  },
  {
    in: "brand-dashboard.png",
    outs: [
      { file: "brand-dashboard.webp", width: 1400, quality: 76 },
      { file: "brand-dashboard-800.webp", width: 800, quality: 74 },
    ],
  },
  {
    in: "store-demo-1.png",
    outs: [
      { file: "store-demo-1.webp", width: 1200, quality: 72 },
      { file: "store-demo-1-800.webp", width: 800, quality: 70 },
    ],
  },
  {
    in: "store-demo-2.png",
    outs: [
      { file: "store-demo-2.webp", width: 1200, quality: 72 },
      { file: "store-demo-2-800.webp", width: 800, quality: 70 },
    ],
  },
  {
    in: "store-demo-3.png",
    outs: [
      { file: "store-demo-3.webp", width: 1200, quality: 72 },
      { file: "store-demo-3-800.webp", width: 800, quality: 70 },
    ],
  },
];

await mkdir(dir, { recursive: true });

for (const job of jobs) {
  const input = path.join(dir, job.in);
  for (const out of job.outs) {
    const dest = path.join(dir, out.file);
    let pipeline = sharp(input).resize({ width: out.width, withoutEnlargement: true });
    if (out.jpeg) {
      pipeline = pipeline.jpeg({ quality: out.quality, mozjpeg: true });
    } else {
      pipeline = pipeline.webp({ quality: out.quality });
    }
    const info = await pipeline.toFile(dest);
    console.log(`${out.file} ${Math.round(info.size / 1024)}KB ${info.width}x${info.height}`);
  }
}

console.log("done");
