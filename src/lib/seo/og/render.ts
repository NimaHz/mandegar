import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { Resvg } from "@resvg/resvg-js";
import satori, { type Font } from "satori";

import { OG_HEIGHT, OG_WIDTH } from "./targets";
import { type OgCard, OgCardView } from "./template";

const FONT_DIR = join(process.cwd(), "src/assets/fonts");

let fonts: Promise<Font[]> | undefined;

const loadFonts = () => {
  fonts ??= Promise.all([
    readFile(join(FONT_DIR, "vazirmatn/static/vazirmatn-medium.ttf")),
    readFile(join(FONT_DIR, "vazirmatn/static/vazirmatn-extrabold.ttf")),
    readFile(join(FONT_DIR, "kufam/static/kufam-extrabold.ttf")),
  ]).then(([medium, extraBold, logo]): Font[] => [
    { name: "Vazirmatn", data: medium, weight: 500, style: "normal" },
    { name: "Vazirmatn", data: extraBold, weight: 800, style: "normal" },
    { name: "Kufam", data: logo, weight: 800, style: "normal" },
  ]);
  return fonts;
};

export const renderOgImage = async (card: OgCard) => {
  const svg = await satori(OgCardView({ card }), {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: await loadFonts(),
  });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
};
