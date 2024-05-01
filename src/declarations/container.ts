/* @ctix-declaration */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ERROR_CONTROLLER_SYMBOL_KEY } from '#/declarations/ERROR_CONTROLLER_SYMBOL_KEY';
import type { ErrorController } from '#/handlers/ErrorController';
import { IClassContainer } from '@maeum/tools';

declare module '@maeum/tools' {
  export interface IClassContainer {
    resolve(name: typeof ERROR_CONTROLLER_SYMBOL_KEY): ErrorController;
  }
}
