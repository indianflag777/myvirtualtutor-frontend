"use client";

import React from "react";

export default function SessionShell({ tutor, whiteboard, controls }) {
  return (
    <div style={styles.page}>
      <div style={styles.main}>
        <div className="mvt-desktop" style={styles.desktopGrid}>
          <div style={styles.panel}>{tutor}</div>
          <div style={styles.panel}>{whiteboard}</div>
        </div>

        <div className="mvt-mobile" style={styles.mobileTabs}>
          <MobileTabs tutor={tutor} whiteboard={whiteboard} />
        </div>
      </div>

      <div style={styles.controls}>{controls}</div>

      <style jsx global>{`
        .mvt-mobile { display: none; }
        .mvt-desktop { display: grid; }

        @media (max-width: 1023px) {
          .mvt-mobile { display: block; }
          .mvt-desktop { display: none; }
        }
      `}</style>
    </div>
  );
}

function MobileTabs({ tutor, whiteboard }) {
  const [tab, setTab] = React.useState("tutor");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={styles.tabBar}>
        <button
          onClick={() => setTab("tutor")}
          style={tab === "tutor" ? styles.tabActive : styles.tab}
        >
          Tutor
        </button>
        <button
          onClick={() => setTab("board")}
          style={tab === "board" ? styles.tabActive : styles.tab}
        >
          Whiteboard
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <div style={styles.panel}>{tab === "tutor" ? tutor : whiteboard}</div>
      </div>
    </div>
  );
}

const CONTROL_BAR_H = 72;

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0b0f14",
    color: "#e8eef6",
  },
  main: {
    flex: 1,
    minHeight: 0,
    padding: 16,
  },
  desktopGrid: {
    height: "100%",
    minHeight: 0,
    gridTemplateColumns: "40% 60%",
    gap: 16,
  },
  mobileTabs: {
    height: "100%",
    minHeight: 0,
  },
  panel: {
    height: "100%",
    minHeight: 0,
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
  },
  controls: {
    height: CONTROL_BAR_H,
    padding: "12px 16px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "#0b0f14",
  },
  tabBar: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
    color: "#e8eef6",
    cursor: "pointer",
  },
  tabActive: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "#e8eef6",
    cursor: "pointer",
  },
};
