"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/** Scroll distance (px) below which the nav is always shown. */
const SHOW_NEAR_TOP = 64;
/** Minimum scroll delta to react to — filters out trackpad/rubber-band jitter. */
const DELTA = 6;

/**
 * Controls when the floating navigation is visible.
 *
 * The nav is intentionally NOT permanent — a fixed bar that's always on top of
 * the content overlaps it and causes mis-clicks. Instead it behaves like the
 * page's chrome: it reveals when you're "moving" (a route change, scrolling
 * back up, or sitting near the top) and slides away once you scroll down to
 * read or interact with the content beneath it.
 */
export function useNavVisibility() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const pathname = usePathname();

  // Reveal whenever the page changes — the nav is shown while navigating.
  useEffect(() => {
    setVisible(true);
    lastY.current = typeof window === "undefined" ? 0 : window.scrollY;
  }, [pathname]);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const diff = y - lastY.current;

      if (Math.abs(diff) >= DELTA) {
        if (y < SHOW_NEAR_TOP) {
          setVisible(true); // near the top — always visible
        } else if (diff > 0) {
          setVisible(false); // scrolling down into the content — get out of the way
        } else {
          setVisible(true); // scrolling back up — bring it back
        }
        lastY.current = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
}
