import { useEffect, useState } from "react";

import { Finale } from "./Finale";
import { Header, Hero } from "./Hero";
import { Journey } from "./Journey";
import { Projects } from "./Projects";
import { Universe } from "./Universe";

import "./portfolio.css";

/** One small noise tile, generated once; the CSS steps it around for live grain. */
function useGrainTile() {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 160;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(160, 160);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    setUrl(c.toDataURL("image/png"));
  }, []);
  return url;
}

export function Portfolio() {
  const [ready, setReady] = useState(false);
  const grain = useGrainTile();

  useEffect(() => {
    // hold the opening on black until the display face is in, so the wordmark never reflows
    let done = false;
    const go = () => {
      if (!done) {
        done = true;
        setReady(true);
      }
    };
    document.fonts?.load("100px Anton").then(go, go);
    const fallback = setTimeout(go, 1800);
    return () => clearTimeout(fallback);
  }, []);

  return (
    <div className="pf">
      <Header ready={ready} />
      <main>
        <Hero ready={ready} />
        <Universe />
        <Journey />
        <Projects />
        <Finale />
      </main>
      <div className="pf__grain" style={{ backgroundImage: grain ? `url(${grain})` : undefined }} aria-hidden />
      <div className="pf__vignette" aria-hidden />
    </div>
  );
}
