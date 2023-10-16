import type ErrorHandler from '#/handlers/ErrorHandler';
import type TGetLanguageFunction from '#/handlers/interfaces/TGetLanguageFunction';
import type TTranslateFunction from '#/handlers/interfaces/TTranslateFunction';

export default interface IErrorControllerOption {
  translate?: TTranslateFunction;
  getLanguage?: TGetLanguageFunction<unknown>;
  defaultLanguage?: string;
  fallbackMessage?: string | ((args: unknown) => string);
  encryption?: boolean;
  fallback?: ErrorHandler<any>;
  includeDefaultHandler?: boolean;
  handlers?: ErrorHandler<any>[];
}
