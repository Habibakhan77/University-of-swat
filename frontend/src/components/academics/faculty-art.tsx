import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import type { FacultyAccent } from "@/lib/strapi/academics-model";

/**
 * Accent colours for faculty cards. `base` carries white text and icons, so every base is at least
 * 4.5:1 against white (WCAG AA for text, well above the 3:1 needed for icons).
 */
export const FACULTY_ACCENTS: Record<FacultyAccent, { base: string; deep: string; tint: string }> = {
  green: { base: "#186642", deep: "#06291a", tint: "#b1dac3" },
  maroon: { base: "#872436", deep: "#2e0a12", tint: "#edc0c7" },
  teal: { base: "#0f6e6e", deep: "#04292a", tint: "#a7dcd9" },
  blue: { base: "#1f4e8c", deep: "#0a1d3a", tint: "#b9cdea" },
  coral: { base: "#a8402f", deep: "#3d140d", tint: "#f3c3b8" },
  gold: { base: "#80600f", deep: "#2c1f08", tint: "#efd993" },
};

/**
 * CSS variables for a faculty's accent, set on a page or card wrapper:
 * `--fac` (base), `--fac-deep`, `--fac-tint`. Utilities such as `text-fac` and `bg-fac-soft`
 * (globals.css) read them and switch to the light tint in dark mode, where the base would be too dark.
 */
export function accentStyle(accent: FacultyAccent): CSSProperties {
  const c = FACULTY_ACCENTS[accent];
  return { "--fac": c.base, "--fac-deep": c.deep, "--fac-tint": c.tint } as CSSProperties;
}

interface FacultyArtProps {
  /** Unique per card, for the SVG pattern id. */
  id: string;
  accent: FacultyAccent;
  icon: LucideIcon;
}

/**
 * Drawn cover for a faculty without a real photo yet: a gradient in the faculty's accent with its own
 * icon repeated as a faint, tilted pattern, so the six cards are told apart at a glance.
 */
export function FacultyArt({ id, accent, icon: Icon }: FacultyArtProps) {
  const c = FACULTY_ACCENTS[accent];
  const patternId = `faculty-art-${id}`;
  return (
    <div aria-hidden className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c.base} 0%, ${c.deep} 100%)` }}>
      <svg className="absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} width="64" height="64" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
            <Icon x={8} y={8} width={22} height={22} color={c.tint} strokeWidth={1.5} opacity={0.22} />
            <Icon x={40} y={40} width={14} height={14} color={c.tint} strokeWidth={1.5} opacity={0.14} />
          </pattern>
          <radialGradient id={`${patternId}-glow`} cx="80%" cy="10%" r="75%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        <rect width="100%" height="100%" fill={`url(#${patternId}-glow)`} />
      </svg>
      <Icon
        className="absolute -end-6 -bottom-8 size-40 rtl:-scale-x-100"
        color={c.tint}
        strokeWidth={1}
        opacity={0.18}
      />
    </div>
  );
}
