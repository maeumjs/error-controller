# @maeum/error-controller <!-- omit in toc -->

![ts](https://flat.badgen.net/badge/Built%20With/TypeScript/blue)
[![Download Status](https://img.shields.io/npm/dw/@maeum/error-controller.svg?style=flat-square)](https://npmcharts.com/compare/@maeum/error-controller?minimal=true)
[![Github Star](https://img.shields.io/github/stars/@maeum/error-controller.svg?style=flat-square)](https://github.com/maeumjs/error-controller)
[![Github Issues](https://img.shields.io/github/issues/maeumjs/error-controller)](https://github.com/maeumjs/error-controller/issues)
[![NPM version](https://img.shields.io/npm/v/@maeum/error-controller.svg?style=flat-square)](https://www.npmjs.com/package/@maeum/error-controller)
[![License](https://img.shields.io/npm/l/@maeum/error-controller.svg?style=flat-square)](https://github.com/maeumjs/error-controller/blob/master/LICENSE)
[![ci](https://github.com/maeumjs/error-controller/actions/workflows/ci.yml/badge.svg)](https://github.com/maeumjs/error-controller/actions/workflows/ci.yml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Error hander extension of the Maeum boilerplate.

## Table of Contents <!-- omit in toc -->

- [Getting Start](#getting-start)
- [How it works?](#how-it-works)

## Getting Start

```bash
npm i @maeum/error-controller --save
```

## How it works?

`@maeum/error-controller` create error handler for `fastify.setErrorHandler` function.

```ts
server.setErrorHandler(
  errorHandler([], {
  [CE_MAEUM_DEFAULT_ERROR_HANDLER.COMMON]: (req, id, param) => getLocales(req.headers['accept-language']).t(id, param),
  [CE_MAEUM_DEFAULT_ERROR_HANDLER.DEFAULT_REST_ERROR]: (req, id, param) => getLocales(req.headers['accept-language']).t(id, param),
}, {
    hooks: {
      [CE_MAEUM_DEFAULT_ERROR_HANDLER.COMMON]: {
        pre: (err: Error & { validation?: ErrorObject[] }, req: FastifyRequest) => {
          req.setRequestError(err);
        },
      },
    },
    encryptor: (code: string): string => {
      if (
        config.server.runMode === CE_RUN_MODE.STAGE ||
        config.server.runMode === CE_RUN_MODE.PRODUCTION
      ) {
        return encrypt(code);
      }

      return code;
    },
  }),
);
```
