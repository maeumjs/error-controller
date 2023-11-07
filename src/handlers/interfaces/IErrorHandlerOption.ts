import type { TGetLanguageFunction } from '#/handlers/interfaces/TGetLanguageFunction';
import type { TTranslateFunction } from '#/handlers/interfaces/TTranslateFunction';

export interface IErrorHandlerOption<T> {
  encryption: boolean;
  fallbackMessage: string | ((args: T) => string);
  getLanguage: TGetLanguageFunction<T>;
  translate: TTranslateFunction;
}
