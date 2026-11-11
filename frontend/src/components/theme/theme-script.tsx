"use client";

/**
 * Runs before first paint so the page never flashes the wrong theme.
 * Reads the saved choice ("light" | "dark" | "system") from localStorage; default is "system".
 *
 * React warns about (and never runs) a script it renders on the client. The server HTML carries it
 * as a normal script, which the browser runs while parsing; on the client the same element is
 * marked as a data block so React treats it as inert and the warning goes away.
 */
export const THEME_STORAGE_KEY = "uswat-theme";

const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||((t===null||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      type={typeof window === "undefined" ? undefined : "application/json"}
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
