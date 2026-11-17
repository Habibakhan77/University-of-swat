import type { MetadataRoute } from "next";

/**
 * /manifest.webmanifest: name, colours and icons (all from the university crest) for "Add to Home screen"
 * on phones and for browsers that show app icons. favicon.ico, icon.png and apple-icon.png sit next to
 * this file and are linked by Next automatically.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "University of Swat",
    short_name: "UoSwat",
    description: "Official website of the University of Swat, Charbagh, Swat, Khyber Pakhtunkhwa.",
    start_url: "/",
    display: "browser",
    background_color: "#faf8f2",
    theme_color: "#0c3b26",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
