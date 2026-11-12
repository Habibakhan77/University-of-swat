"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/strapi/home";
import type { HeroLabels } from "./hero-shared";

const HeroInteractive = dynamic(() => import("./hero-interactive"), { ssr: false });

/**
 * Loads the hero's interactive part (other photos, controls, autoplay) once the browser is idle, so
 * neither its code nor the other slides' photos compete with the first paint.
 */
export function HeroEnhancer(props: { slides: HeroSlide[]; labels: HeroLabels }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(start, { timeout: 4000 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(start, 1500);
    return () => clearTimeout(timer);
  }, []);

  return ready ? <HeroInteractive {...props} /> : null;
}
