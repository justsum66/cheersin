/**
 * R2-002 Phase 1: Tailwind utilities for safe-area, scrollbar-hide, page-container.
 * Migrated from globals.css to reduce CSS file size.
 */
import type { PluginAPI } from "tailwindcss/types/config";

export function safeAreaUtilities({ addUtilities }: PluginAPI) {
  addUtilities({
    /* 280 安全區域：底部導航避開 iPhone 等劉海/Home 條 */
    ".safe-area-pb": {
      "padding-bottom": "env(safe-area-inset-bottom, 0)",
    },
    ".main-content-pb": {
      "padding-bottom": "calc(5rem + env(safe-area-inset-bottom, 0px))",
    },
    ".safe-area-pt": {
      "padding-top": "env(safe-area-inset-top, 0)",
    },
    ".safe-area-px": {
      "padding-left": "env(safe-area-inset-left, 0)",
      "padding-right": "env(safe-area-inset-right, 0)",
    },
    ".safe-area-pb-min-1": {
      "padding-bottom": "max(1rem, env(safe-area-inset-bottom, 0))",
    },
    ".safe-area-pb-quiz-main": {
      "padding-bottom": "max(4rem, calc(1rem + env(safe-area-inset-bottom, 0px)))",
    },
    ".safe-area-pb-hero": {
      "padding-bottom": "max(3.5rem, env(safe-area-inset-bottom, 3.5rem))",
    },
    /* RWD 手機/平板：主內容區水平 padding */
    ".page-container-mobile": {
      "padding-left": "max(1rem, env(safe-area-inset-left, 0))",
      "padding-right": "max(1rem, env(safe-area-inset-right, 0))",
      "@media (min-width: 768px)": {
        "padding-left": "1.5rem",
        "padding-right": "1.5rem",
      },
      "@media (min-width: 1024px)": {
        "padding-left": "2rem",
        "padding-right": "2rem",
      },
    },
    /* A11Y-012 / UX-003：觸控目標 ≥48px，符合 WCAG 與全站 CTA 規範 */
    ".touch-target": {
      "min-height": "48px",
      "min-width": "48px",
    },
    /* 隱藏捲軸：橫向捲動區（Lobby 分類/輪播） */
    ".scrollbar-hide": {
      "-ms-overflow-style": "none",
      "scrollbar-width": "none",
    },
    ".scrollbar-hide::-webkit-scrollbar": { display: "none" },
    ".carousel-track": {
      "overflow-x": "auto",
      "-ms-overflow-style": "none",
      "scrollbar-width": "none",
    },
    ".carousel-track::-webkit-scrollbar": { display: "none" },
    /* 焦點環：WCAG AA，遊戲區專用 */
    ".games-focus-ring": {
      "transition": "box-shadow 0.2s ease-out, outline-color 0.2s ease-out",
    },
    ".games-focus-ring:focus-visible": {
      "outline": "2px solid rgba(139, 0, 0, 0.8)",
      "outline-offset": "2px",
      "box-shadow": "none",
    },
  });
}
