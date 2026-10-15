import { type Locale, localeMeta } from "@/i18n/config";
import { aparatEmbedUrl, START_TIME_PARAM } from "@/lib/video";
import type { GuideChapter, GuideVideo } from "@/types/content";

import { isoDuration, tehranIso } from "../text";
import { absoluteUrl } from "../urls";
import { ref, siteIds } from "./ids";
import type { JsonLdNode } from "./types";

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

const clipUrl = (pageUrl: string, seconds: number) => {
  const url = new URL(pageUrl);
  url.searchParams.set(START_TIME_PARAM, String(seconds));
  return url.toString();
};

const clipNodes = (pageUrl: string, chapters: GuideChapter[], durationSec: number | null) =>
  chapters
    .toSorted((a, b) => a.startSec - b.startSec)
    .map((chapter, index, sorted) => ({
      "@type": "Clip",
      name: chapter.title,
      startOffset: chapter.startSec,
      endOffset: sorted[index + 1]?.startSec ?? durationSec,
      url: clipUrl(pageUrl, chapter.startSec),
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
  embedUrl: video.kind === "aparat" ? aparatEmbedUrl(video.hash) : null,
  url: pageUrl,
  inLanguage: localeMeta[locale].hreflang,
  publisher: ref(siteIds.organization),
  hasPart: video.kind === "upload" ? clipNodes(pageUrl, chapters, durationSec) : null,
});
