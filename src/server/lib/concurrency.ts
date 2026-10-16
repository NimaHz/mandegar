import { stale } from "./http-error";

export const assertUnchanged = (updatedAt: Date, expected: string | undefined) => {
  if (expected !== undefined && updatedAt.getTime() !== new Date(expected).getTime()) throw stale();
};
