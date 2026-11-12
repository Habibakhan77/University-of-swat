import type { CSSProperties } from "react";

interface StatCounterProps {
  value: number;
  suffix?: string | null;
  /** BCP 47 locale for digit grouping, e.g. "en-GB". */
  intlLocale: string;
  className?: string;
}

/**
 * A number that counts up from 0 as the stats band scrolls into view, in CSS only (`.stat-count` in
 * globals.css): the digits are CSS counters animated with a scroll timeline. The real number is in the
 * HTML for search engines and screen readers (the drawn digits are aria-hidden), and with reduced motion
 * or without scroll-driven animations the final number is simply shown.
 *
 * CSS counters only draw Latin digits without grouping, so numbers up to 999,999 are drawn as
 * "thousands, separator, three padded digits". Anything the counters can't reproduce exactly (other
 * digit systems, larger numbers) is shown as plain text instead.
 */
export function StatCounter({ value, suffix, intlLocale, className }: StatCounterProps) {
  const final = new Intl.NumberFormat(intlLocale).format(value);
  const whole = Number.isInteger(value) && value >= 0;
  const grouped = /^(\d{1,3})(\D)(\d{3})$/.exec(final);

  let digits: { style: CSSProperties; split: boolean } | null = null;
  if (whole && value < 1000 && /^\d+$/.test(final)) {
    digits = { style: { "--stat-a": value, "--stat-b": 0 } as CSSProperties, split: false };
  } else if (whole && value < 1_000_000 && grouped) {
    digits = {
      style: {
        "--stat-a": Math.floor(value / 1000),
        "--stat-b": value % 1000,
        "--stat-sep": JSON.stringify(grouped[2]),
      } as CSSProperties,
      split: true,
    };
  }

  return (
    <span className={className}>
      {/* Numbers read left to right ("80+") and use the Latin UI font, also on Urdu pages. */}
      <span aria-hidden dir="ltr" className="inline-block font-sans tabular-nums">
        {digits ? <span className="stat-count" data-split={digits.split || undefined} style={digits.style} /> : final}
        {suffix}
      </span>
      <span className="sr-only">
        {final}
        {suffix}
      </span>
    </span>
  );
}
