import { useEffect, useState } from "react";

export function useLanguageChange() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => forceUpdate({});
    window.addEventListener("language-change", handleLanguageChange);
    return () =>
      window.removeEventListener("language-change", handleLanguageChange);
  }, []);
}