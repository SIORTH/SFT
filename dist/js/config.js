 /**
 * SIFORTECH - Refactored Script
 * Architecture:
 *   - Single IntersectionObserver reveal system (no AOS, no library)
 *   - fetch → build full HTML string → single innerHTML inject
 *   - Global state machine: loading → rendering → ready / error
 *   - Skeleton hides only after DOM + next rAF
 *   - Event delegation for filters
 *   - No inline onclick
 *   - All selectors cached; no forced reflow
 */

tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#2563eb",
          red: "#ef4444",
          dark: "#0f172a",
          soft: "#f8fafc",
          grid: "#cbd5e1",
        },
      },
      animation: {
        "move-grid": "moveGrid 20s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
      },
      keyframes: {
        moveGrid: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(40px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-15px)" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
      },
    },
  },
};
