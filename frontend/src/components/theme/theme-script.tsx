/**
 * Runs before first paint so the page never flashes the wrong theme.
 * Reads the saved choice ("light" | "dark" | "system") from localStorage; default is "system".
 */
export const THEME_STORAGE_KEY = "uswat-theme";

const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||((t===null||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
