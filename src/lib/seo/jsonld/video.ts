import { type Locale, localeMeta } from "@/i18n/config";
import type { GuideChapter, GuideVideo } from "@/types/content";

import { isoDuration, tehranIso } from "../text";
import { absoluteUrl } from "../urls";
import { ref, siteIds } from "./ids";
import type { JsonLdNode } from "./types";

const APARAT_EMBED = "https://www.aparat.com/video/video/embed/videohash";

interface VideoInput {
  id: string;
  locale: Locale;
  pageUrl: string;
  name: string;
  description: string;
  video: GuideVideo;
  thumbnail: string;
  uploadDate: string;
  durationSec: number | null;
  chapters: GuideChapter[];
}

const clipNodes = (pageUrl: string, chapters: GuideChapter[], durationSec: number | null) =>
  [...chapters]
    .sort((a, b) => a.startSec - b.startSec)
    .map((chapter, index, sorted) => ({
      "@type": "Clip",
      name: chapter.title,
      startOffset: chapter.startSec,
      endOffset: sorted[index + 1]?.startSec ?? durationSec,
      url: `${pageUrl}#t=${chapter.startSec}`,
    }));

export const videoNode = ({
  id,
  locale,
  pageUrl,
  name,
  description,
  video,
  thumbnail,
  uploadDate,
  durationSec,
  chapters,
}: VideoInput): JsonLdNode => ({
  "@type": "VideoObject",
  "@id": id,
  name,
  description,
  thumbnailUrl: absoluteUrl(thumbnail),
  uploadDate: tehranIso(uploadDate),
  duration: durationSec ? isoDuration(durationSec) : null,
  contentUrl: video.kind === "upload" ? absoluteUrl(video.src) : null,
  encodingFormat: video.kind === "upload" ? video.mime : null,
  embedUrl:
    video.kind === "aparat" ? `${APARAT_EMBED}/${encodeURIComponent(video.hash)}/vt/frame` : null,
  url: pageUrl,
  inLanguage: localeMeta[locale].hreflang,
  publisher: ref(siteIds.organization),
  hasPart: clipNodes(pageUrl, chapters, durationSec),
});
