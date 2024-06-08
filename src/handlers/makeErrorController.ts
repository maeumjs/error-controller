import { CE_DI } from '#/di/CE_DI';
import { ApiErrorHandler } from '#/handlers/ApiErrorHandler';
import { ErrorController } from '#/handlers/ErrorController';
import { HTTPErrorHandler } from '#/handlers/HTTPErrorHandler';
import { SchemaErrorHandler } from '#/handlers/SchemaErrorHandler';
import type { IErrorControllerOption } from '#/handlers/interfaces/IErrorControllerOption';
import type { THTTPErrorHandlerParameters } from '#/handlers/interfaces/THTTPErrorHandlerParameters';
import { getLanguageFromRequestHeader } from '#/modules/getLanguageFromRequestHeader';
import type { IClassContainer } from '@maeum/tools';

export function makeErrorController(container: IClassContainer, args?: IErrorControllerOption) {
  const fallbackMessage =
    args?.fallbackMessage ?? 'internal server error, please retry again later';
  const encryption = args?.encryption ?? true;
  const translate = args?.translate ?? (() => undefined);
  const defaultLanguage = args?.defaultLanguage ?? 'en';
  const getLanguage =
    args?.getLanguage ??
    ((languageArgs: THTTPErrorHandlerParameters) =>
      getLanguageFromRequestHeader(defaultLanguage, languageArgs.req.headers['accept-languages']));

  const errorController = new ErrorController(container, translate);

  if (args?.handlers == null || args?.handlers.length === 0) {
    errorController.add(
      new SchemaErrorHandler(container, {
        encryption,
        translate,
        fallbackMessage,
        getLanguage,
      }),
    );
    errorController.add(
      new ApiErrorHandler(container, { encryption, translate, fallbackMessage, getLanguage }),
    );
    errorController.add(
      new HTTPErrorHandler(container, { encryption, translate, fallbackMessage, getLanguage }),
    );
  } else {
    if (args?.includeDefaultHandler ?? false) {
      errorController.add(
        new SchemaErrorHandler(container, {
          encryption,
          translate,
          fallbackMessage,
          getLanguage,
        }),
      );
      errorController.add(
        new ApiErrorHandler(container, { encryption, translate, fallbackMessage, getLanguage }),
      );
      errorController.add(
        new HTTPErrorHandler(container, { encryption, translate, fallbackMessage, getLanguage }),
      );
    }

    errorController.add(...args.handlers);

    container.register(CE_DI.ERROR_CONTROLLER, errorController);
  }
}
