"use client";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isLight = theme === "light";

  return (
    <button
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label="Toggle theme"
      className="relative flex items-center justify-between w-28 px-1 py-1 rounded-full bg-gray-200 dark:bg-gray-800 cursor-pointer select-none"
    >
      {/* Background highlight */}
      <motion.div
        layout
        initial={false}
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`absolute top-1 left-1 bottom-1 w-1/2 rounded-full bg-white dark:bg-gray-700`}
        style={{ x: isLight ? 0 : 112 }} // toggle sliding effect, 112px = approx half button width - padding
      />

      {/* Light label */}
      <span
        className={`z-10 w-1/2 text-center text-sm font-semibold ${
          isLight ? "text-black" : "text-gray-500"
        }`}
      >
        🌞 Light
      </span>

      {/* Dark label */}
      <span
        className={`z-10 w-1/2 text-center text-sm font-semibold ${
          isLight ? "text-gray-500" : "text-white"
        }`}
      >
        🌙 Dark
      </span>
    </button>
  );
}
