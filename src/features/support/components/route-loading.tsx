import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

export const loadingLabel = async () => {
  const { common } = await getDictionary(await getLocale());
  return common.loading;
};
