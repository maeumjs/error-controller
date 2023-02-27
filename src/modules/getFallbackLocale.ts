import type { FastifyRequest } from 'fastify';

export default function getFallbackLocale(
  code: number,
  locale: Record<
    number,
    (req: FastifyRequest, id: string, params?: Record<string, string>) => string
  >,
): ((req: FastifyRequest, id: string, params?: Record<string, string>) => string) | undefined {
  const localeFunc = locale[code];

  if (localeFunc != null) {
    return localeFunc;
  }

  const fallbackCode = Math.floor(code / 100) * 100;
  return locale[fallbackCode];
}
