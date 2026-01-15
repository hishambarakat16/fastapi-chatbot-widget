import { useEffect, useRef, useState } from "react";

export function useTypewriter(text, { speedMs = 12, enabled = true } = {}) {
  const [out, setOut] = useState("");
  const iRef = useRef(0);
  const tRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setOut(text || "");
      return;
    }

    iRef.current = 0;
    setOut("");

    const s = text || "";
    const tick = () => {
      iRef.current += 1;
      setOut(s.slice(0, iRef.current));
      if (iRef.current < s.length) tRef.current = setTimeout(tick, speedMs);
    };

    tRef.current = setTimeout(tick, speedMs);
    return () => tRef.current && clearTimeout(tRef.current);
  }, [text, speedMs, enabled]);

  return out;
}
