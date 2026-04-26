"use client";

import { useEffect } from "react";

export default function ThemeProvider() {
  useEffect(() => {
    function apply() {
      const t = localStorage.getItem("trademind_theme");
      if (t === "oled") document.documentElement.classList.add("oled");
      else document.documentElement.classList.remove("oled");
    }
    apply();
    window.addEventListener("storage", apply);
    return () => window.removeEventListener("storage", apply);
  }, []);
  return null;
}