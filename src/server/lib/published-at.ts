export const publishedAtFor = (
  published: boolean,
  current: Date | null,
  requested?: string | null,
) => {
  const next = requested === undefined ? current : requested === null ? null : new Date(requested);
  return published && !next ? new Date() : next;
};
