"use client";

import { themeConf, type CustomSound, type Pad, type Theme } from "./Soundboard";

export type SettingsTab = "audio" | "sounds" | "themes";

const THEMES: Theme[] = ["Arcade", "Neon", "Pastel"];

interface PanelConf {
  backdrop: string;
  panelBg: string;
  panelBorder: string;
  text: string;
  subText: string;
  navBg: string;
  navActiveBg: string;
  navActiveText: string;
  navText: string;
  rowBg: string;
  rowBorder: string;
}

function panelConf(theme: Theme): PanelConf {
  if (theme === "Neon")
    return {
      backdrop: "rgba(4,5,11,.72)",
      panelBg: "#0d1020",
      panelBorder: "rgba(255,255,255,.12)",
      text: "#ffffff",
      subText: "rgba(255,255,255,.55)",
      navBg: "rgba(255,255,255,.04)",
      navActiveBg: "rgba(255,255,255,.1)",
      navActiveText: "#ffffff",
      navText: "rgba(255,255,255,.6)",
      rowBg: "rgba(255,255,255,.04)",
      rowBorder: "rgba(255,255,255,.08)",
    };
  if (theme === "Pastel")
    return {
      backdrop: "rgba(40,32,26,.35)",
      panelBg: "#fffaf3",
      panelBorder: "rgba(0,0,0,.08)",
      text: "#231e18",
      subText: "rgba(40,32,26,.55)",
      navBg: "rgba(0,0,0,.03)",
      navActiveBg: "rgba(0,0,0,.06)",
      navActiveText: "#231e18",
      navText: "rgba(40,32,26,.55)",
      rowBg: "rgba(0,0,0,.03)",
      rowBorder: "rgba(0,0,0,.06)",
    };
  return {
    backdrop: "rgba(6,5,9,.72)",
    panelBg: "#1c1526",
    panelBorder: "rgba(255,255,255,.1)",
    text: "#ffffff",
    subText: "rgba(255,255,255,.55)",
    navBg: "rgba(255,255,255,.04)",
    navActiveBg: "rgba(255,255,255,.1)",
    navActiveText: "#ffffff",
    navText: "rgba(255,255,255,.6)",
    rowBg: "rgba(255,255,255,.04)",
    rowBorder: "rgba(255,255,255,.08)",
  };
}

const NAV_ITEMS: { key: SettingsTab; label: string }[] = [
  { key: "audio", label: "Audio" },
  { key: "sounds", label: "Sounds" },
  { key: "themes", label: "Themes" },
];

export interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  theme: Theme;
  accent: string;
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  activeTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  pads: Pad[];
  onLabelChange: (index: number, label: string) => void;
  onPreview: (index: number) => void;
  playingIndex: number | null;
  customSounds: Record<number, CustomSound>;
  onUploadSound: (index: number, file: File) => void;
  onClearSound: (index: number) => void;
}

export default function SettingsPanel({
  open,
  onClose,
  theme,
  accent,
  activeTab,
  onTabChange,
  volume,
  onVolumeChange,
  activeTheme,
  onThemeChange,
  pads,
  onLabelChange,
  onPreview,
  playingIndex,
  customSounds,
  onUploadSound,
  onClearSound,
}: SettingsPanelProps) {
  if (!open) return null;
  const c = panelConf(theme);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: c.backdrop,
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(560px, 100%)",
          height: "min(360px, 100%)",
          background: c.panelBg,
          border: `1px solid ${c.panelBorder}`,
          borderRadius: 18,
          boxShadow: "0 24px 60px rgba(0,0,0,.4)",
          display: "flex",
          overflow: "hidden",
          fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 148,
            flex: "none",
            background: c.navBg,
            borderRight: `1px solid ${c.panelBorder}`,
            padding: "18px 10px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-archivo), sans-serif",
              fontWeight: 800,
              fontSize: 13,
              color: c.text,
              padding: "0 10px 14px",
              letterSpacing: ".02em",
            }}
          >
            Settings
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeTab;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                style={{
                  textAlign: "left",
                  border: "none",
                  cursor: "pointer",
                  padding: "9px 10px",
                  borderRadius: 9,
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontWeight: 600,
                  fontSize: 12.5,
                  letterSpacing: ".04em",
                  background: isActive ? c.navActiveBg : "transparent",
                  color: isActive ? c.navActiveText : c.navText,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: "20px 22px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-archivo), sans-serif",
                fontWeight: 800,
                fontSize: 16,
                color: c.text,
              }}
            >
              {activeTab === "audio"
                ? "Audio"
                : activeTab === "sounds"
                ? "Sounds"
                : "Themes"}
            </div>
            <button
              onClick={onClose}
              aria-label="Close settings"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: c.subText,
                fontSize: 18,
                lineHeight: 1,
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          {activeTab === "audio" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: 11.5,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: c.subText,
                }}
              >
                Master volume — {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                style={{ accentColor: accent, width: "100%" }}
              />
            </div>
          ) : activeTab === "themes" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {THEMES.map((t) => {
                const tc = themeConf(t);
                const isActive = t === activeTheme;
                return (
                  <button
                    key={t}
                    onClick={() => onThemeChange(t)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      textAlign: "left",
                      cursor: "pointer",
                      border: isActive
                        ? `2px solid ${accent}`
                        : `1px solid ${c.rowBorder}`,
                      background: isActive ? c.navActiveBg : c.rowBg,
                      borderRadius: 10,
                      padding: isActive ? "8px 11px" : "9px 12px",
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        flex: "none",
                        borderRadius: 8,
                        background: tc.stage,
                        border: "1px solid rgba(0,0,0,.12)",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontWeight: 600,
                        fontSize: 12.5,
                        color: c.text,
                      }}
                    >
                      {t}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pads.map((pad, i) => {
                const custom = customSounds[i];
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                      border: `1px solid ${c.rowBorder}`,
                      background: playingIndex === i ? c.navActiveBg : c.rowBg,
                      borderRadius: 10,
                      padding: "6px 6px 6px 12px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="text"
                        value={pad.label}
                        onChange={(e) => onLabelChange(i, e.target.value)}
                        maxLength={20}
                        aria-label={`Label for sound ${i + 1}`}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          border: "none",
                          background: "transparent",
                          outline: "none",
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontWeight: 600,
                          fontSize: 12.5,
                          color: c.text,
                          padding: "5px 0",
                        }}
                      />
                      <label
                        style={{
                          flex: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          border: `1px solid ${c.rowBorder}`,
                          background: "transparent",
                          cursor: "pointer",
                          borderRadius: 7,
                          padding: "6px 10px",
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontWeight: 600,
                          fontSize: 11,
                          color: c.subText,
                        }}
                      >
                        Upload
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadSound(i, file);
                            e.target.value = "";
                          }}
                          style={{ display: "none" }}
                        />
                      </label>
                      <button
                        onClick={() => onPreview(i)}
                        style={{
                          flex: "none",
                          border: `1px solid ${c.rowBorder}`,
                          background: "transparent",
                          cursor: "pointer",
                          borderRadius: 7,
                          padding: "6px 10px",
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontWeight: 600,
                          fontSize: 11,
                          color: c.subText,
                        }}
                      >
                        {playingIndex === i ? "Playing…" : "Preview"}
                      </button>
                    </div>
                    {custom && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingRight: 4,
                          paddingBottom: 2,
                        }}
                      >
                        <span
                          style={{
                            fontFamily:
                              "var(--font-space-mono), monospace",
                            fontSize: 10.5,
                            color: c.subText,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 260,
                          }}
                        >
                          custom: {custom.name}
                        </span>
                        <button
                          onClick={() => onClearSound(i)}
                          style={{
                            flex: "none",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: c.subText,
                            fontFamily:
                              "var(--font-space-grotesk), sans-serif",
                            fontWeight: 600,
                            fontSize: 10.5,
                            textDecoration: "underline",
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
