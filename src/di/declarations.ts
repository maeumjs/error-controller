import type { CE_DI } from '#/di/CE_DI';
import type { ErrorController } from '#/handlers/ErrorController';
import '@maeum/tools';

declare module '@maeum/tools' {
  export interface IClassContainer {
    resolve(name: typeof CE_DI.ERROR_CONTROLLER): ErrorController;
  }
}
