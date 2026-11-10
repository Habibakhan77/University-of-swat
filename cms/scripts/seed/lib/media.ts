/**
 * Media for the seed: real photos (scripts/seed/assets/photos, see data/photos.ts) and generated
 * placeholders.
 *
 * Placeholders are generated locally in fixed ratios so the frontend can rely on consistent aspect
 * ratios. They contain NO text (a heading laid over an image must never compete with words baked into
 * it): just a brand gradient, a faint Gandhara rosette pattern and a mountain or portrait silhouette,
 * varied per image. They are marked as placeholders by their file name (`placeholder-*`), alt text and
 * caption, so the Media Cell can find and replace them (filter the Media Library by "placeholder").
 */
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import type { Core } from '@strapi/strapi';
import { PHOTOS, photoCaption, type PhotoKey } from '../data/photos';

export const PLACEHOLDER_PREFIX = 'placeholder-';
/** Real photos uploaded by the seed; removed and re-uploaded by `--reset` like placeholders. */
export const PHOTO_PREFIX = 'seed-photo-';

/** Relative to the Strapi app root: the seed runs compiled from dist/, where these files are not copied. */
const PHOTO_DIR = path.join('scripts', 'seed', 'assets', 'photos');

/** Fixed sizes: the frontend uses the same ratios in next/image. */
export const RATIOS = {
  hero: { width: 1920, height: 1080 },
  cover: { width: 1600, height: 900 },
  portrait: { width: 800, height: 1000 },
  square: { width: 600, height: 600 },
  og: { width: 1200, height: 630 },
} as const;

export type Ratio = keyof typeof RATIOS;

/** Brand palette from the university logo. */
const THEMES = {
  green: { from: '#145c3c', to: '#082a1b', line: '#d4a72c', ridge: '#04170e' },
  maroon: { from: '#7d2233', to: '#3f0f19', line: '#d4a72c', ridge: '#26080e' },
  gold: { from: '#a67f17', to: '#5e4512', line: '#f7f3e8', ridge: '#2c1f08' },
  slate: { from: '#2f4650', to: '#162126', line: '#d4a72c', ridge: '#0c1417' },
} as const;

export type Theme = keyof typeof THEMES;

export interface UploadedFile {
  id: number;
  documentId: string;
  url: string;
}

interface UploadService {
  upload(input: {
    data: { fileInfo: { name: string; alternativeText?: string; caption?: string } };
    files: { filepath: string; originalFilename: string; mimetype: string; size: number };
  }): Promise<UploadedFile[]>;
  remove(file: unknown): Promise<unknown>;
}

/** Small deterministic hash, so each placeholder gets its own (stable) composition. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Eight-petal lotus rosette, as carved on Gandhara stupas. */
function rosette(cx: number, cy: number, r: number, color: string, opacity: number): string {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    const x = cx + Math.cos(a) * r * 0.55;
    const y = cy + Math.sin(a) * r * 0.55;
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(r * 0.42).toFixed(1)}" ry="${(r * 0.18).toFixed(1)}"
      transform="rotate(${i * 45} ${x.toFixed(1)} ${y.toFixed(1)})" fill="none" stroke="${color}" stroke-width="${(r * 0.05).toFixed(1)}"/>`;
  }).join('');
  return `<g opacity="${opacity}">${petals}<circle cx="${cx}" cy="${cy}" r="${(r * 0.16).toFixed(1)}" fill="${color}"/></g>`;
}

/** Layered ridgelines along the bottom; `seed` shifts the peaks so images differ. */
function mountains(w: number, h: number, color: string, seed: number): string {
  const ridge = (base: number, amp: number, phase: number, opacity: number) => {
    const points: string[] = [];
    const steps = 9;
    for (let i = 0; i <= steps; i += 1) {
      const x = (w * i) / steps;
      const n = Math.sin(i * 1.7 + phase) + Math.sin(i * 0.9 + phase * 2.3) * 0.6;
      points.push(`${x.toFixed(0)} ${(h * base - n * h * amp).toFixed(0)}`);
    }
    return `<path d="M0 ${h} L${points.join(' L')} L${w} ${h} Z" fill="${color}" opacity="${opacity}"/>`;
  };
  const p = (seed % 628) / 100;
  return ridge(0.7, 0.08, p, 0.35) + ridge(0.8, 0.06, p + 1.3, 0.6) + ridge(0.9, 0.035, p + 2.1, 0.9);
}

function portraitSilhouette(w: number, h: number): string {
  const cx = w / 2;
  return `<circle cx="${cx}" cy="${h * 0.38}" r="${w * 0.16}" fill="#ffffff" opacity="0.16"/>
    <path d="M${cx - w * 0.34} ${h} Q${cx - w * 0.3} ${h * 0.62} ${cx} ${h * 0.6} Q${cx + w * 0.3} ${h * 0.62} ${cx + w * 0.34} ${h} Z"
      fill="#ffffff" opacity="0.16"/>`;
}

/** A text-free placeholder: gradient, faint rosettes, silhouette. */
export function placeholderSvg(ratio: Ratio, theme: Theme, key: string): string {
  const { width: w, height: h } = RATIOS[ratio];
  const t = THEMES[theme];
  const seed = hash(key);
  const angle = 20 + (seed % 50);
  const people = ratio === 'portrait';
  const big = Math.min(w, h);
  const rosettes = [
    rosette(w * (0.12 + ((seed >> 3) % 20) / 100), h * 0.22, big * 0.12, t.line, 0.1),
    rosette(w * (0.78 + ((seed >> 7) % 12) / 100), h * 0.3, big * 0.2, t.line, 0.07),
    rosette(w * 0.5, h * (0.12 + ((seed >> 11) % 10) / 100), big * 0.07, t.line, 0.08),
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${0.2 + (seed % 60) / 100}" cy="0.15" r="0.7">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.14"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${people ? "" : rosettes}
  ${people ? portraitSilhouette(w, h) : mountains(w, h, t.ridge, seed)}
</svg>`;
}

/** A small, valid one-page PDF that says it is a placeholder document. */
export function placeholderPdf(title: string, lines: string[]): Buffer {
  const esc = (s: string): string => s.replace(/[\\()]/g, (m) => `\\${m}`).replace(/[^\x20-\x7e]/g, '-');
  const body = [
    'BT /F1 11 Tf 72 760 Td (PLACEHOLDER DOCUMENT - University of Swat website seed data) Tj ET',
    `BT /F1 18 Tf 72 720 Td (${esc(title.slice(0, 70))}) Tj ET`,
    ...lines.map((l, i) => `BT /F1 11 Tf 72 ${690 - i * 18} Td (${esc(l.slice(0, 95))}) Tj ET`),
    `BT /F1 10 Tf 72 ${660 - lines.length * 18} Td (Replace this file with the official document before going live.) Tj ET`,
  ].join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${Buffer.byteLength(body)} >>\nstream\n${body}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

export interface ImageRequest {
  ratio: Ratio;
  /** Stable key, becomes part of the file name (e.g. "news-allama-iqbal-day"). */
  key: string;
  /** What the image should show; used in the alt text ("Placeholder image: …"). */
  title: string;
  /** Kept for call sites; no longer drawn on the image. */
  kicker?: string;
  theme?: Theme;
}

/** Generates and uploads seed media, caching by key so shared images are uploaded once. */
export class MediaFactory {
  private readonly cache = new Map<string, UploadedFile>();
  private dir = '';
  uploaded = 0;
  photos = 0;

  constructor(private readonly strapi: Core.Strapi) {}

  private get service(): UploadService {
    return this.strapi.plugin('upload').service('upload') as unknown as UploadService;
  }

  async init(): Promise<void> {
    this.dir = await mkdtemp(path.join(tmpdir(), 'uswat-seed-'));
  }

  async dispose(): Promise<void> {
    if (this.dir) await rm(this.dir, { recursive: true, force: true });
  }

  private async push(fileName: string, buffer: Buffer, mimetype: string, alt: string, caption: string): Promise<UploadedFile> {
    const filepath = path.join(this.dir, fileName);
    await writeFile(filepath, buffer);
    const { size } = await stat(filepath);
    const [file] = await this.service.upload({
      data: { fileInfo: { name: fileName, alternativeText: alt, caption } },
      files: { filepath, originalFilename: fileName, mimetype, size },
    });
    this.uploaded += 1;
    return file;
  }

  async image(req: ImageRequest): Promise<number> {
    const cacheKey = `${req.ratio}:${req.key}`;
    const hit = this.cache.get(cacheKey);
    if (hit) return hit.id;
    const svg = placeholderSvg(req.ratio, req.theme ?? 'green', req.key);
    const buffer = await sharp(Buffer.from(svg)).webp({ quality: 80 }).toBuffer();
    const file = await this.push(
      `${PLACEHOLDER_PREFIX}${req.ratio}-${req.key}.webp`,
      buffer,
      'image/webp',
      `Placeholder image: ${req.title}`,
      'PLACEHOLDER — replace with a real photo',
    );
    this.cache.set(cacheKey, file);
    return file.id;
  }

  /** Uploads a real photo from assets/photos as WebP (16:9, 1920px) with its credit as the caption. */
  async photo(key: PhotoKey): Promise<number> {
    const cacheKey = `photo:${key}`;
    const hit = this.cache.get(cacheKey);
    if (hit) return hit.id;
    const photo = PHOTOS[key];
    const source = await readFile(path.join(this.strapi.dirs.app.root, PHOTO_DIR, photo.file));
    const { width, height } = RATIOS.hero;
    const buffer = await sharp(source).resize(width, height, { fit: 'cover', position: 'attention' }).webp({ quality: 80 }).toBuffer();
    const file = await this.push(`${PHOTO_PREFIX}${key}.webp`, buffer, 'image/webp', photo.alt, photoCaption(photo));
    this.photos += 1;
    this.cache.set(cacheKey, file);
    return file.id;
  }

  async pdf(key: string, title: string, lines: string[] = []): Promise<number> {
    const cacheKey = `pdf:${key}`;
    const hit = this.cache.get(cacheKey);
    if (hit) return hit.id;
    const file = await this.push(
      `${PLACEHOLDER_PREFIX}${key}.pdf`,
      placeholderPdf(title, lines),
      'application/pdf',
      `Placeholder document: ${title}`,
      'PLACEHOLDER — replace with the official PDF',
    );
    this.cache.set(cacheKey, file);
    return file.id;
  }

  /** Deletes every placeholder and seed photo uploaded by a previous seed run. */
  static async removeAll(strapi: Core.Strapi): Promise<number> {
    const files = (await strapi.db.query('plugin::upload.file').findMany({
      where: { $or: [{ name: { $startsWith: PLACEHOLDER_PREFIX } }, { name: { $startsWith: PHOTO_PREFIX } }] },
    })) as unknown[];
    const service = strapi.plugin('upload').service('upload') as unknown as UploadService;
    for (const file of files) await service.remove(file);
    return files.length;
  }
}
