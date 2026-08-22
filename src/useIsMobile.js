import { useEffect, useState } from "react";

// ==========================================
// useIsMobile
// ==========================================
// Simple breakpoint hook so components can switch layout (grid
// columns, sidebar vs. top nav, etc.) between mobile and desktop.
// Since the app is styled with inline styles rather than CSS
// classes, this is how we get media-query-like behavior.

export default function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const handleChange = (e) => setIsMobile(e.matches);

    setIsMobile(mql.matches);
    mql.addEventListener("change", handleChange);

    return () => mql.removeEventListener("change", handleChange);
  }, [breakpoint]);

  return isMobile;
}