import { useEffect, useState } from "react";

export function useThemeChange() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleThemeChange = () => forceUpdate({});
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);
}