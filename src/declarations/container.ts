/* @ctix-declaration */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { $YMBOL_KEY_ERROR_CONTROLLER } from '#/declarations/SYMBOL_KEY_ERROR_CONTROLLER';
import type { ErrorController } from '#/handlers/ErrorController';
import { IClassContainer } from '@maeum/tools';

declare module '@maeum/tools' {
  export interface IClassContainer {
    resolve(name: typeof $YMBOL_KEY_ERROR_CONTROLLER): ErrorController;
  }
}
