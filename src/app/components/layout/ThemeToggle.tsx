'use client'

import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => setTheme(isLight ? "dark" : "light")}
        aria-label="Toggle theme"
        className="relative flex items-center justify-between w-40 h-10 px-1 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-inner cursor-pointer select-none border border-blue-200 dark:border-gray-700"
      >
        {/* Background highlight */}
        <motion.div
          layout
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-1 left-1 bottom-1 rounded-full ${
            isLight 
              ? 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-md' 
              : 'bg-gradient-to-r from-gray-700 to-gray-800 shadow-md'
          }`}
          style={{
            x: isLight ? 0 : 'calc(100% - 0.5rem)',
            width: 'calc(50% - 0.25rem)'
          }}
        />

        {/* Light label */}
        <div className={`z-10 w-1/2 flex items-center justify-center gap-2 ${
          isLight ? "text-white" : "text-gray-500 dark:text-gray-400"
        }`}>
          <FiSun className="text-lg" />
          <span className="text-sm font-medium">Light</span>
        </div>

        {/* Dark label */}
        <div className={`z-10 w-1/2 flex items-center justify-center gap-2 ${
          isLight ? "text-blue-400" : "text-white"
        }`}>
          <FiMoon className="text-lg" />
          <span className="text-sm font-medium">Dark</span>
        </div>
      </button>

      {/* Sheraton branding */}
      <div className="mt-2 text-xs text-blue-500 dark:text-blue-400 font-medium">
        Sheraton Theme
      </div>
    </div>
  );
}