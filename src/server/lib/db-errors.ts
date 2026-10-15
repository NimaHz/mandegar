import { conflict, ValidationFailure } from "./http-error";

interface PgErrorInfo {
  code: string;
  constraint: string;
  table: string;
}

const textOf = (value: unknown) => (typeof value === "string" ? value : "");

const pgErrorOf = (error: unknown): PgErrorInfo | null => {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    if (typeof current === "object" && current !== null && "code" in current) {
      const { code } = current;
      if (typeof code === "string" && /^\d{2}[0-9A-Z]{3}$/.test(code)) {
        return {
          code,
          constraint: "constraint_name" in current ? textOf(current.constraint_name) : "",
          table: "table_name" in current ? textOf(current.table_name) : "",
        };
      }
    }
    current = current instanceof Error ? current.cause : undefined;
  }
  return null;
};

export const isUniqueViolation = (error: unknown, constraint?: string) => {
  const info = pgErrorOf(error);
  return info?.code === "23505" && (constraint === undefined || info.constraint === constraint);
};

const fieldOf = ({ constraint, table }: PgErrorInfo) =>
  constraint
    .slice(table.length + 1)
    .replace(/_unique$/, "")
    .replace(/^(.*?_id)_[a-z_]+_id_fk$/, "$1")
    .replace(/_idx$/, "")
    .replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase()) || "_";

export const guardWrite = async <TResult>(operation: () => Promise<TResult>): Promise<TResult> => {
  try {
    return await operation();
  } catch (error) {
    const info = pgErrorOf(error);
    if (info?.code === "23505") throw new ValidationFailure({ [fieldOf(info)]: "Already in use" });
    if (info?.code === "23503")
      throw new ValidationFailure({ [fieldOf(info)]: "Referenced item not found" });
    throw error;
  }
};

export const guardDelete = async <TResult>(operation: () => Promise<TResult>): Promise<TResult> => {
  try {
    return await operation();
  } catch (error) {
    const info = pgErrorOf(error);
    if (info?.code === "23503")
      throw conflict(`Still used by ${info.table || "other records"}`, "IN_USE");
    throw error;
  }
};
