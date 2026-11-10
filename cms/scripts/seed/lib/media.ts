/**
 * Placeholder media for the seed.
 *
 * Every image is generated locally (no external image service) in one of four fixed ratios so the
 * frontend can rely on consistent aspect ratios. Each one is visibly stamped "PLACEHOLDER", named
 * `placeholder-*`, and has alt text / caption saying so, which lets the Media Cell find and replace them
 * (filter the Media Library by "placeholder").
 */
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import type { Core } from '@strapi/strapi';

export const PLACEHOLDER_PREFIX = 'placeholder-';

/** Fixed sizes: the frontend uses the same ratios in next/image. */
export const RATIOS = {
  hero: { width: 1920, height: 1080, label: '16:9' },
  cover: { width: 1600, height: 900, label: '16:9' },
  portrait: { width: 800, height: 1000, label: '4:5' },
  square: { width: 600, height: 600, label: '1:1' },
  og: { width: 1200, height: 630, label: '1.91:1' },
} as const;

export type Ratio = keyof typeof RATIOS;

/** Brand palette from the university logo. */
const THEMES = {
  green: { bg: '#0f4d32', bg2: '#0b3a26', fg: '#f7f3e8', accent: '#d4a72c' },
  maroon: { bg: '#6d1a2a', bg2: '#521320', fg: '#f7f3e8', accent: '#d4a72c' },
  gold: { bg: '#8a6a12', bg2: '#6b520d', fg: '#fffaf0', accent: '#f7f3e8' },
  slate: { bg: '#24343b', bg2: '#1a272c', fg: '#f7f3e8', accent: '#d4a72c' },
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

const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((line + ' ' + word).trim().length > maxChars && line) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s*\S*$/, '') + '…';
    return kept;
  }
  return lines;
}

/** Layered Swat-valley mountain silhouette along the bottom of the image. */
function mountains(w: number, h: number, color: string): string {
  const y = (f: number): number => Math.round(h * f);
  const x = (f: number): number => Math.round(w * f);
  return `
    <path d="M0 ${y(0.78)} L${x(0.12)} ${y(0.6)} L${x(0.22)} ${y(0.7)} L${x(0.36)} ${y(0.5)} L${x(0.5)} ${y(0.68)}
      L${x(0.63)} ${y(0.55)} L${x(0.78)} ${y(0.72)} L${x(0.9)} ${y(0.58)} L${w} ${y(0.7)} L${w} ${h} L0 ${h} Z"
      fill="${color}" opacity="0.35"/>
    <path d="M${x(0.31)} ${y(0.56)} L${x(0.36)} ${y(0.5)} L${x(0.41)} ${y(0.56)} L${x(0.38)} ${y(0.55)} L${x(0.36)} ${y(0.57)} Z"
      fill="#ffffff" opacity="0.25"/>
    <path d="M0 ${y(0.88)} L${x(0.18)} ${y(0.74)} L${x(0.3)} ${y(0.82)} L${x(0.46)} ${y(0.7)} L${x(0.6)} ${y(0.84)}
      L${x(0.74)} ${y(0.73)} L${x(0.88)} ${y(0.85)} L${w} ${y(0.78)} L${w} ${h} L0 ${h} Z" fill="${color}" opacity="0.6"/>`;
}

function personIcon(w: number, h: number, color: string): string {
  const cx = w / 2;
  return `
    <circle cx="${cx}" cy="${h * 0.36}" r="${w * 0.17}" fill="${color}" opacity="0.5"/>
    <path d="M${cx - w * 0.32} ${h * 0.78} Q${cx} ${h * 0.46} ${cx + w * 0.32} ${h * 0.78} Z" fill="${color}" opacity="0.5"/>`;
}

function placeholderSvg(ratio: Ratio, theme: Theme, title: string, kicker: string): string {
  const { width: w, height: h, label } = RATIOS[ratio];
  const t = THEMES[theme];
  const portrait = ratio === 'portrait' || ratio === 'square';
  const fontSize = Math.round(w * (portrait ? 0.06 : 0.042));
  const lines = wrap(title, portrait ? 18 : 34, portrait ? 3 : 3);
  const textTop = portrait ? h * 0.84 - (lines.length - 1) * fontSize * 1.2 : h * 0.42 - ((lines.length - 1) * fontSize * 1.2) / 2;
  const badgeW = Math.round(w * (portrait ? 0.62 : 0.3));
  const badgeH = Math.round(fontSize * 1.25);
  const pad = Math.round(w * 0.04);
  const textY = (i: number): number => Math.round(textTop + i * fontSize * 1.2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${t.bg}"/><stop offset="1" stop-color="${t.bg2}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${portrait ? personIcon(w, h, t.fg) : mountains(w, h, t.bg2)}
  <rect x="${pad}" y="${pad}" width="${badgeW}" height="${badgeH}" rx="${badgeH / 2}" fill="${t.accent}"/>
  <text x="${pad + badgeW / 2}" y="${pad + badgeH * 0.7}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(badgeH * 0.55)}"
    font-weight="700" letter-spacing="2" fill="${t.bg2}" text-anchor="middle">PLACEHOLDER IMAGE</text>
  <text x="${w - pad}" y="${pad + badgeH * 0.7}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(badgeH * 0.5)}"
    fill="${t.fg}" opacity="0.8" text-anchor="end">${label} · ${w}×${h}</text>
  <text x="${w / 2}" y="${textY(-1) - fontSize * 0.2}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(fontSize * 0.55)}"
    font-weight="600" letter-spacing="3" fill="${t.accent}" text-anchor="middle">${escapeXml(kicker.toUpperCase())}</text>
  ${lines
    .map(
      (line, i) =>
        `<text x="${w / 2}" y="${textY(i) + fontSize * 0.6}" font-family="Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${t.fg}" text-anchor="middle">${escapeXml(line)}</text>`,
    )
    .join('\n  ')}
  <text x="${w / 2}" y="${h - pad * 0.7}" font-family="Segoe UI, Arial, sans-serif" font-size="${Math.round(fontSize * 0.42)}"
    fill="${t.fg}" opacity="0.75" text-anchor="middle">University of Swat · replace with a real photo</text>
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
  title: string;
  kicker: string;
  theme?: Theme;
}

/** Generates and uploads placeholder media, caching by key so shared images are uploaded once. */
export class MediaFactory {
  private readonly cache = new Map<string, UploadedFile>();
  private dir = '';
  uploaded = 0;

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
    const svg = placeholderSvg(req.ratio, req.theme ?? 'green', req.title, req.kicker);
    const buffer = await sharp(Buffer.from(svg)).webp({ quality: 78 }).toBuffer();
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

  /** Deletes every placeholder file uploaded by a previous seed run. */
  static async removeAll(strapi: Core.Strapi): Promise<number> {
    const files = (await strapi.db
      .query('plugin::upload.file')
      .findMany({ where: { name: { $startsWith: PLACEHOLDER_PREFIX } } })) as unknown[];
    const service = strapi.plugin('upload').service('upload') as unknown as UploadService;
    for (const file of files) await service.remove(file);
    return files.length;
  }
}
