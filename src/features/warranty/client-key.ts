import "server-only";

import { headers } from "next/headers";

import { siteConfig } from "@/config/site";
import { clientIpOf, clientKeyOf } from "@/server/plugins/security";

export const requestClientKey = async () =>
  clientKeyOf(clientIpOf(new Request(siteConfig.url, { headers: await headers() })));
