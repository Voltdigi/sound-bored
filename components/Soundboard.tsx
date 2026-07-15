"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SoundEngine, type SoundKind } from "@/lib/sounds";
import {
  deleteCustomSound,
  loadCustomSounds,
  saveCustomSound,
} from "@/lib/soundStorage";
import SettingsPanel, { type SettingsTab } from "@/components/SettingsPanel";

export type Theme = "Arcade" | "Neon" | "Pastel";

export interface Pad {
  label: string;
  hue: number;
  sound: SoundKind;
}

export interface CustomSound {
  buffer: AudioBuffer;
  name: string;
}

export interface SoundboardProps {
  theme?: Theme;
  accent?: string;
  showLabels?: boolean;
  /** Override the default pad set (label / hue / sound). */
  pads?: Pad[];
}

const PAD_LABELS_KEY = "soundbored:padLabels";

const DEFAULT_PADS: Pad[] = [
  { label: "Airhorn", hue: 14, sound: "airhorn" },
  { label: "Vine Boom", hue: 275, sound: "vineboom" },
  { label: "Bruh", hue: 205, sound: "bruh" },
  { label: "Bonk", hue: 330, sound: "bonk" },
  { label: "Oof", hue: 45, sound: "oof" },
  { label: "Wow", hue: 150, sound: "wow" },
  { label: "Sad Violin", hue: 225, sound: "sadviolin" },
  { label: "Applause", hue: 95, sound: "applause" },
];

interface ThemeConf {
  name: Theme;
  stage: string;
  title: string;
  sub: string;
  label: string;
}

export function themeConf(theme: Theme): ThemeConf {
  if (theme === "Neon")
    return {
      name: "Neon",
      stage: "radial-gradient(130% 110% at 50% -12%, #0d1636, #04050b 72%)",
      title: "#ffffff",
      sub: "rgba(255,255,255,.5)",
      label: "rgba(255,255,255,.82)",
    };
  if (theme === "Pastel")
    return {
      name: "Pastel",
      stage: "linear-gradient(160deg,#f7f2ea,#ece2d3)",
      title: "#231e18",
      sub: "rgba(40,32,26,.5)",
      label: "rgba(40,32,26,.62)",
    };
  return {
    name: "Arcade",
    stage: "radial-gradient(120% 120% at 50% -12%, #271c34, #0b0910 74%)",
    title: "#ffffff",
    sub: "rgba(255,255,255,.5)",
    label: "rgba(255,255,255,.84)",
  };
}

function tileStyle(
  hue: number,
  conf: ThemeConf,
  playing: boolean,
  accent: string
): CSSProperties {
  const base: CSSProperties = {
    position: "relative",
    height: "100%",
    aspectRatio: "1",
    maxWidth: "100%",
    borderRadius: 20,
    cursor: "pointer",
    padding: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform .09s ease, box-shadow .18s ease",
    border: "none",
    outline: "none",
  };

  let sty: CSSProperties;
  if (conf.name === "Neon") {
    sty = {
      background: `linear-gradient(180deg, hsl(${hue} 60% 13%), hsl(${hue} 55% 8%))`,
      border: `2px solid hsl(${hue} 95% 60%)`,
      boxShadow: `0 0 16px hsl(${hue} 95% 55% / .5), inset 0 0 22px hsl(${hue} 95% 50% / .18)`,
      color: `hsl(${hue} 95% 80%)`,
    };
  } else if (conf.name === "Pastel") {
    sty = {
      background: `linear-gradient(180deg, hsl(${hue} 78% 89%), hsl(${hue} 68% 79%))`,
      border: "1px solid rgba(0,0,0,.06)",
      boxShadow: "0 7px 15px rgba(120,110,95,.22)",
      color: `hsl(${hue} 48% 34%)`,
    };
  } else {
    sty = {
      background: `radial-gradient(120% 120% at 30% 18%, hsl(${hue} 90% 63%), hsl(${hue} 85% 45%))`,
      border: "none",
      boxShadow:
        "inset 0 2px 0 rgba(255,255,255,.35), inset 0 -8px 18px rgba(0,0,0,.26), 0 10px 22px rgba(0,0,0,.34)",
      color: "#fff",
    };
  }

  const merged: CSSProperties = { ...base, ...sty };
  if (playing) {
    merged.boxShadow = `${sty.boxShadow}, 0 0 0 3px ${accent}, 0 0 26px ${accent}`;
    merged.transform = "scale(0.96)";
  }
  return merged;
}

function GearIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export default function Soundboard({
  theme = "Arcade",
  accent = "#ff3b6b",
  showLabels = true,
  pads = DEFAULT_PADS,
}: SoundboardProps) {
  const engineRef = useRef<SoundEngine | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [flash, setFlash] = useState<Record<number, number>>({});
  const [isPortrait, setIsPortrait] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("audio");
  const [volume, setVolume] = useState(1);
  const [padList, setPadList] = useState<Pad[]>(pads);
  const [activeTheme, setActiveTheme] = useState<Theme>(theme);
  const [customSounds, setCustomSounds] = useState<Record<number, CustomSound>>(
    {}
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    engineRef.current = new SoundEngine();
    const mq = window.matchMedia("(orientation: portrait)");
    const upd = () => setIsPortrait(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => {
      mq.removeEventListener("change", upd);
      if (clearTimer.current) clearTimeout(clearTimer.current);
      engineRef.current?.stopAll();
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    let cancelled = false;

    const loadLabels = () => {
      try {
        const stored = window.localStorage.getItem(PAD_LABELS_KEY);
        if (!stored) return;
        const labels: string[] = JSON.parse(stored);
        setPadList((list) =>
          list.map((p, i) =>
            typeof labels[i] === "string" && labels[i]
              ? { ...p, label: labels[i] }
              : p
          )
        );
      } catch {
        /* malformed or unavailable storage, keep defaults */
      }
    };

    const loadSounds = async () => {
      const engine = engineRef.current;
      if (!engine) return;
      try {
        const stored = await loadCustomSounds();
        const entries: Record<number, CustomSound> = {};
        for (const item of stored) {
          try {
            const buffer = await engine.decodeFile(item.blob);
            entries[item.index] = { buffer, name: item.name };
          } catch {
            /* skip corrupt/unreadable stored entry */
          }
        }
        if (!cancelled) setCustomSounds((prev) => ({ ...entries, ...prev }));
      } catch {
        /* indexeddb unavailable, keep session-only sounds */
      }
    };

    loadLabels();
    // Minimum visible time so the loading shimmer reads as intentional
    // rather than a one-frame flash on fast cache lookups.
    const minDelay = new Promise((resolve) => setTimeout(resolve, 260));
    Promise.all([loadSounds(), minDelay]).then(() => {
      if (!cancelled) setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const onPress = (i: number) => {
    let dur = 0.5;
    try {
      const custom = customSounds[i];
      dur = custom
        ? engineRef.current?.playBuffer(custom.buffer) ?? 0.5
        : engineRef.current?.play(padList[i].sound) ?? 0.5;
    } catch {
      /* noop */
    }
    setFlash((f) => ({ ...f, [i]: (f[i] || 0) + 1 }));
    setPlayingIndex(i);
    if (clearTimer.current) clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setPlayingIndex(null), dur * 1000);
  };

  const updatePadLabel = (index: number, label: string) => {
    setPadList((list) => {
      const next = list.map((p, i) => (i === index ? { ...p, label } : p));
      try {
        window.localStorage.setItem(
          PAD_LABELS_KEY,
          JSON.stringify(next.map((p) => p.label))
        );
      } catch {
        /* storage unavailable (private mode, quota, etc.) */
      }
      return next;
    });
  };

  const uploadCustomSound = async (index: number, file: File) => {
    if (!engineRef.current) return;
    try {
      const buffer = await engineRef.current.decodeFile(file);
      setCustomSounds((sounds) => ({
        ...sounds,
        [index]: { buffer, name: file.name },
      }));
      saveCustomSound(index, file.name, file).catch(() => {
        /* persistence failed, sound still works for this session */
      });
    } catch {
      /* invalid/unsupported audio file, ignore */
    }
  };

  const clearCustomSound = (index: number) => {
    setCustomSounds((sounds) => {
      const next = { ...sounds };
      delete next[index];
      return next;
    });
    deleteCustomSound(index).catch(() => {
      /* noop */
    });
  };

  const stopAll = () => {
    engineRef.current?.stopAll();
    if (clearTimer.current) clearTimeout(clearTimer.current);
    setPlayingIndex(null);
  };

  const conf = themeConf(activeTheme);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: "100%",
        background: conf.stage,
        display: "flex",
        flexDirection: "column",
        padding: "14px 18px 16px",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flex: "none",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                fontFamily: "var(--font-archivo), system-ui, sans-serif",
                fontWeight: 900,
                fontSize: 22,
                lineHeight: 1,
                letterSpacing: "-.01em",
                color: conf.title,
              }}
            >
              SOUNDBORED
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Open settings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                border: "none",
                borderRadius: 7,
                background: "transparent",
                color: conf.sub,
                cursor: "pointer",
                padding: 0,
              }}
            >
              <GearIcon size={15} />
            </button>
          </div>
          <div
            style={{
              fontFamily: "var(--font-space-mono), monospace",
              fontSize: 9.5,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: conf.sub,
            }}
          >
            8 pads
          </div>
        </div>
        <button
          onClick={stopAll}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            cursor: "pointer",
            padding: "10px 16px",
            borderRadius: 12,
            background: accent,
            color: "#fff",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            transition: "transform .08s ease, filter .15s ease",
            boxShadow: "0 6px 16px rgba(0,0,0,.3)",
          }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(.94)";
          }}
          onPointerUp={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "";
          }}
          onPointerLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "";
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 11,
              height: 11,
              borderRadius: 2.5,
              background: "#fff",
            }}
          />
          Stop all
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: 13,
          marginTop: 12,
        }}
      >
        {padList.map((pad, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 0,
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => onPress(i)}
                aria-label={pad.label}
                style={{
                  ...tileStyle(pad.hue, conf, playingIndex === i, accent),
                  animation: hydrated
                    ? "padSettle .38s cubic-bezier(.16,1,.3,1) both"
                    : undefined,
                  animationDelay: hydrated ? `${i * 25}ms` : undefined,
                }}
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "scale(.92)";
                }}
                onPointerUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "";
                }}
                onPointerLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "";
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-archivo), sans-serif",
                    fontWeight: 900,
                    fontSize: 56,
                    lineHeight: 1,
                    color: "currentColor",
                    opacity: 0.16,
                    userSelect: "none",
                  }}
                >
                  {pad.label.charAt(0)}
                </span>
                {(flash[i] || 0) > 0 && (
                  <div
                    key={flash[i]}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "inherit",
                      background: "#fff",
                      pointerEvents: "none",
                      animation: "padflash .3s ease-out forwards",
                    }}
                  />
                )}
                {!hydrated && (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      overflow: "hidden",
                      borderRadius: "inherit",
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        inset: "-20% -60%",
                        background:
                          "linear-gradient(75deg, transparent 35%, rgba(255,255,255,.4) 50%, transparent 65%)",
                        transform: "translateX(-100%)",
                        animation: "shimmerSweep 1.1s ease-in-out infinite",
                      }}
                    />
                  </span>
                )}
              </button>
            </div>
            {showLabels && (
              <div
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontWeight: 600,
                  fontSize: 11.5,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginTop: 7,
                  color: conf.label,
                  maxWidth: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {hydrated ? (
                  <span
                    style={{
                      display: "inline-block",
                      animation: "labelIn .3s ease both",
                      animationDelay: `${i * 25}ms`,
                    }}
                  >
                    {pad.label}
                  </span>
                ) : (
                  <span
                    aria-hidden
                    style={{
                      display: "inline-block",
                      width: "58%",
                      height: 9,
                      borderRadius: 5,
                      verticalAlign: "middle",
                      background:
                        "linear-gradient(90deg, rgba(120,120,120,.18) 25%, rgba(120,120,120,.36) 37%, rgba(120,120,120,.18) 63%)",
                      backgroundSize: "400% 100%",
                      animation: "shimmer 1.15s ease-in-out infinite",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {isPortrait && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            background: "rgba(8,7,12,.94)",
            backdropFilter: "blur(4px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            textAlign: "center",
            padding: 32,
          }}
        >
          <div
            style={{
              width: 54,
              height: 80,
              border: "3px solid rgba(255,255,255,.85)",
              borderRadius: 11,
              animation: "rotatehint 2.4s ease-in-out infinite",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: "#fff",
            }}
          >
            Rotate your phone
          </div>
          <div
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,.6)",
              maxWidth: 240,
            }}
          >
            This soundboard is built for landscape — turn your device sideways.
          </div>
        </div>
      )}

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={conf.name}
        accent={accent}
        activeTab={settingsTab}
        onTabChange={setSettingsTab}
        volume={volume}
        onVolumeChange={setVolume}
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
        pads={padList}
        onLabelChange={updatePadLabel}
        onPreview={onPress}
        playingIndex={playingIndex}
        customSounds={customSounds}
        onUploadSound={uploadCustomSound}
        onClearSound={clearCustomSound}
      />
    </div>
  );
}
