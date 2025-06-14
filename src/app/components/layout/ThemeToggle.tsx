'use client'

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { FiSun } from "react-icons/fi";

export default function ThemeToggle() {
  const { setTheme } = useTheme();

  // Force light mode on mount
  useEffect(() => {
    setTheme("light");
  }, [setTheme]);

  return (
    <div className="flex flex-col items-center">
      {/* Static light mode toggle display (disabled functionality) */}
      <div className="relative flex items-center justify-between w-40 h-10 px-1 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-inner cursor-default select-none">
        {/* Background highlight */}
        <div className="absolute top-1 left-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-gradient-to-r from-blue-400 to-blue-500 shadow-md" />

        {/* Light label (active) */}
        <div className="z-10 w-1/2 flex items-center justify-center gap-2 text-white">
          <FiSun className="text-lg" />
          <span className="text-sm font-medium">Light</span>
        </div>

        {/* Dark label (disabled state) */}
        <div className="z-10 w-1/2 flex items-center justify-center gap-2 text-blue-400">
          <span className="text-sm font-medium opacity-50">Dark</span>
        </div>
      </div>

      {/* Sheraton branding */}
      <div className="mt-2 text-xs text-blue-500 font-medium">
        Sheraton Theme
      </div>
    </div>
  );
}
