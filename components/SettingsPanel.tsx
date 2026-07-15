"use client";

import type { Pad, Theme } from "./Soundboard";

export type SettingsTab = "audio" | "sounds";

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
  pads: Pad[];
  onPreview: (index: number) => void;
  playingIndex: number | null;
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
  pads,
  onPreview,
  playingIndex,
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
              {activeTab === "audio" ? "Audio" : "Sounds"}
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
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pads.map((pad, i) => (
                <button
                  key={pad.label + i}
                  onClick={() => onPreview(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: `1px solid ${c.rowBorder}`,
                    background: playingIndex === i ? c.navActiveBg : c.rowBg,
                    borderRadius: 10,
                    padding: "9px 12px",
                    cursor: "pointer",
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontWeight: 600,
                    fontSize: 12.5,
                    color: c.text,
                  }}
                >
                  <span>{pad.label}</span>
                  <span style={{ color: c.subText, fontSize: 11 }}>
                    {playingIndex === i ? "Playing…" : "Preview"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
