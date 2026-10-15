const APARAT_EMBED = "https://www.aparat.com/video/video/embed/videohash";

export const START_TIME_PARAM = "t";

export const aparatEmbedUrl = (hash: string) =>
  `${APARAT_EMBED}/${encodeURIComponent(hash)}/vt/frame`;
