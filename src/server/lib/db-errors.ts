const codeOf = (error: unknown): { code?: unknown; constraint_name?: unknown } | null =>
  typeof error === "object" && error !== null ? error : null;

export const isUniqueViolation = (error: unknown, constraint?: string): boolean => {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    const candidate = codeOf(current);
    if (candidate?.code === "23505") {
      return constraint === undefined || candidate.constraint_name === constraint;
    }
    current = current instanceof Error ? current.cause : undefined;
  }
  return false;
};
