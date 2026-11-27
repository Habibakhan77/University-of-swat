"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/routing";

/*
 * Web Speech API for the assistant: speech-to-text for the question field and read-aloud for answers.
 * Both run in the browser; this site never records, stores or uploads audio. (The browser's own speech
 * engine may use its vendor's service; on-device recognition is preferred where the browser offers it.)
 * TypeScript's DOM library has no SpeechRecognition constructor, so the few members used are typed here.
 */

interface RecognitionAlternative {
  readonly transcript: string;
}
interface RecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  readonly [index: number]: RecognitionAlternative;
}
interface RecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: { readonly length: number; readonly [index: number]: RecognitionResult };
}
interface RecognitionErrorEvent extends Event {
  readonly error: string;
}
interface Recognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  processLocally?: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
interface RecognitionConstructor {
  new (): Recognition;
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string>;
}

function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const speechLang = (locale: Locale) => (locale === "ur" ? "ur-PK" : "en-US");

export type VoiceError = "blocked" | "failed";

/**
 * Speech-to-text. `start(onText)` streams the transcript so far (interim, then final) to `onText`;
 * `supported` is false where the browser has no recognition, and the mic is then not shown.
 */
export function useSpeechRecognition(locale: Locale) {
  const [supported] = useState(() => recognitionConstructor() !== null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<VoiceError | null>(null);
  const active = useRef<Recognition | null>(null);
  const local = useRef(false);
  const lang = speechLang(locale);

  // Prefer on-device recognition when the browser says it is ready for this language.
  useEffect(() => {
    const Ctor = recognitionConstructor();
    if (!Ctor?.available) return;
    let live = true;
    Ctor.available({ langs: [lang], processLocally: true }).then(
      (state) => {
        if (live) local.current = state === "available";
      },
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, [lang]);

  const stop = useCallback(() => active.current?.stop(), []);

  const start = useCallback(
    (onText: (text: string) => void, onDone: () => void) => {
      const Ctor = recognitionConstructor();
      if (!Ctor || active.current) return;
      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      if (local.current) recognition.processLocally = true;

      let heard = false;
      recognition.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i += 1) text += event.results[i]?.[0]?.transcript ?? "";
        heard = heard || text.trim().length > 0;
        onText(text.trim());
      };
      recognition.onerror = (event) => {
        if (event.error === "aborted") return;
        setError(event.error === "not-allowed" || event.error === "service-not-allowed" ? "blocked" : "failed");
      };
      recognition.onend = () => {
        active.current = null;
        setListening(false);
        if (!heard) setError((current) => current ?? "failed");
        onDone();
      };

      setError(null);
      try {
        recognition.start();
        active.current = recognition;
        setListening(true);
      } catch {
        setError("failed");
      }
    },
    [lang],
  );

  // Never keep the microphone open after the panel goes away.
  useEffect(() => () => active.current?.abort(), []);

  return { supported, listening, error, start, stop, clearError: () => setError(null) };
}

/** Read-aloud. Offered only when the browser has a voice for the page's language. */
export function useSpeechSynthesis(locale: Locale) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  const lang = speechLang(locale);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const prefix = lang.slice(0, 2);
    const pick = () => {
      const voices = synth.getVoices();
      setVoice(
        voices.find((v) => v.lang.replace("_", "-") === lang) ?? voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ?? null,
      );
    };
    pick();
    synth.addEventListener("voiceschanged", pick);
    return () => {
      synth.removeEventListener("voiceschanged", pick);
      synth.cancel();
    };
  }, [lang]);

  const speak = useCallback(
    (id: string, text: string) => {
      const synth = window.speechSynthesis;
      synth.cancel();
      if (speaking === id || !voice) {
        setSpeaking(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      const done = () => setSpeaking((current) => (current === id ? null : current));
      utterance.onend = done;
      utterance.onerror = done;
      setSpeaking(id);
      synth.speak(utterance);
    },
    [speaking, voice],
  );

  return { available: voice !== null, speaking, speak };
}
