import { checkSymbol, groupCode, hasValidCheck, normalizeCode, randomSymbols } from "./codes";

export const TRACKING_CODE_LENGTH = 9;

export const createTrackingCode = () => {
  const body = `T${randomSymbols(TRACKING_CODE_LENGTH - 2)}`;
  return `${body}${checkSymbol(body)}`;
};

export const parseTrackingCode = (input: string) => {
  const code = normalizeCode(input);
  return code.length === TRACKING_CODE_LENGTH && code.startsWith("T") && hasValidCheck(code)
    ? code
    : null;
};

export const formatTrackingCode = (code: string) => groupCode(code, 3);
