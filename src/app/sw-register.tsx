"use client";

import { useEffect } from "react";

export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silently ignore: PWA install/offline is a progressive enhancement,
        // not something that should ever break the site.
      });
    }
  }, []);

  return null;
}
