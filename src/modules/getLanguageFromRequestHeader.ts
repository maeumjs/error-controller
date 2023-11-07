import acceptLanguage from 'accept-language';

export function getLanguageFromRequestHeader(
  defaultLanguage: string,
  languages?: string | string[],
): string {
  const language = Array.isArray(languages) ? languages.join(', ') : languages;
  return acceptLanguage.get(language) ?? defaultLanguage;
}
