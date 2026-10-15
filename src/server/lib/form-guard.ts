import "server-only";

import { verifyAltcha } from "@/server/modules/altcha/service";

import { safeEqual, sign } from "./crypto";
import { HttpError } from "./http-error";

const MIN_AGE_MS = 3_000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;
const PURPOSE = "form-token";

export interface HumanProof {
  website?: string | undefined;
  formToken: string;
  altcha: string;
}

export const issueFormToken = (issuedAt = Date.now()) => {
  const stamp = String(issuedAt);
  return `${stamp}.${sign(stamp, PURPOSE)}`;
};

const isFormTokenFresh = (token: string, now = Date.now()) => {
  const [stamp, signature] = token.split(".");
  if (!stamp || !signature || !/^\d{13}$/.test(stamp)) return false;
  if (!safeEqual(signature, sign(stamp, PURPOSE))) return false;
  const age = now - Number(stamp);
  return age >= MIN_AGE_MS && age <= MAX_AGE_MS;
};

export const assertHuman = async (proof: HumanProof) => {
  if (proof.website) throw new HttpError(400, "SPAM_REJECTED", "Submission rejected");
  if (!isFormTokenFresh(proof.formToken)) {
    throw new HttpError(400, "SPAM_REJECTED", "Form expired or submitted too quickly");
  }
  if (!(await verifyAltcha(proof.altcha))) {
    throw new HttpError(403, "CHALLENGE_FAILED", "Verification challenge failed");
  }
};
