import { parseAsStringLiteral } from "nuqs/server";

import { contactDepartments } from "@/types/support";

export const contactSearchParams = {
  department: parseAsStringLiteral(contactDepartments).withDefault("general"),
};
