import { CE_MAEUM_DEFAULT_ERROR_HANDLER } from '#modules/interfaces/CE_MAEUM_DEFAULT_ERROR_HANDLER';
import type TMaeumErrorHandlerLocales from '#modules/interfaces/TMaeumErrorHandlerLocales';

export default function getLocaleHandler(
  locales: TMaeumErrorHandlerLocales | undefined,
  id: string,
) {
  try {
    const handler = locales?.[id];

    if (handler != null) {
      return handler;
    }

    const common = locales?.[CE_MAEUM_DEFAULT_ERROR_HANDLER.COMMON];

    if (common != null) {
      return common;
    }

    return undefined;
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    return undefined;
  }
}
